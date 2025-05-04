import { AssetId, BigNumberish, BN, DryRunResult, Provider } from "fuels";
import { DEFAULT_AMM_CONTRACT_ID } from "./constants";
import { addFee, BASIS_POINTS, getAmountIn, getAmountOut, powDecimals, subtractFee } from "./math";
import { AmmFees, AmmMetadata, Asset, LpAssetInfo, MultiRouteAmountsOutResult, PoolId, PoolMetadata, Route } from "./model";
import { Option } from './typegen/common';
import { MiraAmmContract, PoolMetadataOutput } from "./typegen/MiraAmmContract";
import { arrangePoolParams, assetInput, poolContainsAsset, poolIdInput, poolIdToString, reorderPoolId, } from "./utils";





const DECIMALS_PRECISION = 1000000000000

export class ReadonlyMiraAmm {
  provider: Provider;
  ammContract: MiraAmmContract;

  constructor(provider: Provider, contractIdOpt?: string) {
    let contractId = contractIdOpt ?? DEFAULT_AMM_CONTRACT_ID;
    this.provider = provider;
    this.ammContract = new MiraAmmContract(contractId, provider);
  }

  id(): string {
    return this.ammContract.id.toString();
  }

  async ammMetadata(): Promise<AmmMetadata> {
    return {
      id: this.id(),
      fees: await this.fees(),
      hook: await this.hook(),
      totalAssets: await this.totalAssets(),
      owner: await this.owner()
    }
  }

  async poolMetadata(poolId: PoolId): Promise<PoolMetadata | null> {
    poolId = reorderPoolId(poolId);
    const result = await this.ammContract.functions.pool_metadata(poolIdInput(poolId)).get();
    const value = result.value;
    if (!value) {
      return null;
    }
    return {
      poolId: poolId,
      reserve0: value.reserve_0,
      reserve1: value.reserve_1,
      liquidity: [value.liquidity.id, value.liquidity.amount],
      decimals0: value.decimals_0,
      decimals1: value.decimals_1,
    };
  }

  /**
   * Fetches pool metadata for multiple pool IDs using multicall
   * @param poolIds Array of pool IDs
   * @returns Map of pool ID strings to PoolMetadata
   */
  private async fetchMultiPoolMetadata(poolIds: PoolId[]): Promise<Map<string, PoolMetadata>> {
    const reorderedPoolIds = poolIds.map(id => reorderPoolId(id));
    
    const uniquePoolMap = new Map<string, PoolId>();
    
    reorderedPoolIds.forEach(poolId => {
      const key = poolIdToString(poolId);
      if (!uniquePoolMap.has(key)) {
        uniquePoolMap.set(key, poolId);
      }
    });
    
    const uniquePoolIds: PoolId[] = Array.from(uniquePoolMap.values());

    const calls = uniquePoolIds.map(poolId => 
      this.ammContract.functions.pool_metadata(poolIdInput(poolId))
    );

    try {
      const results = await this.ammContract.multiCall(calls).get();
      const metadataMap = new Map<string, PoolMetadata>();

      // @ts-ignore
      results.forEach((result: DryRunResult<Option<PoolMetadataOutput>>, index: number) => {
        const poolId = uniquePoolIds[index];
        const value = result.value;

        if (value) {
          const metadata: PoolMetadata = {
            poolId,
            reserve0: value.reserve_0,
            reserve1: value.reserve_1,
            liquidity: [value.liquidity.id, value.liquidity.amount],
            decimals0: value.decimals_0,
            decimals1: value.decimals_1,
          };
          metadataMap.set(poolIdToString(poolId), metadata);
        }
      });

      return metadataMap;
    } catch (error) {
      throw new Error(`Failed to fetch pool metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculates amounts out for a single route
   * @param assetIdIn Input asset ID
   * @param assetAmountIn Input amount
   * @param route Route containing pool IDs
   * @param poolMetadataMap Map of pool metadata
   * @param fees AMM fees
   * @returns Array of assets with amounts
   */
  private calculateRouteAmountsOut(
    assetIdIn: AssetId,
    assetAmountIn: BigNumberish,
    route: Route,
    poolMetadataMap: Map<string, PoolMetadata>,
    fees: AmmFees
  ): Asset[] {
    const assetAmount = new BN(assetAmountIn);
    if (assetAmount.isNeg() || assetAmount.isZero()) {
      throw new Error("Non-positive input amount");
    }

    let currentAsset = assetIdIn;
    let currentAmount = assetAmount;
    const amountsOut: Asset[] = [[currentAsset, currentAmount]];

    for (const poolId of route.pools) {
      const reorderedPoolId = reorderPoolId(poolId);
      const poolKey = poolIdToString(reorderedPoolId);
      const pool = poolMetadataMap.get(poolKey);
      if (!pool) {
        throw new Error(`Pool metadata not found for poolId: ${poolKey}`);
      }

      currentAmount = subtractFee(reorderedPoolId, currentAmount, fees);
      const [assetOut, reserveIn, reserveOut, decimalsIn, decimalsOut] = arrangePoolParams(pool, currentAsset);
      const amountOut = getAmountOut(
        reorderedPoolId[2],
        reserveIn,
        reserveOut,
        powDecimals(decimalsIn),
        powDecimals(decimalsOut),
        currentAmount
      );

      currentAsset = assetOut;
      currentAmount = amountOut;
      amountsOut.push([currentAsset, currentAmount]);
    }

    return amountsOut;
  }

  /**
   * Calculates amounts out for multiple routes using multicall
   * @param assetIdIn Input asset ID
   * @param assetAmountIn Input amount
   * @param routes Array of routes
   * @param assetIdOut Expected output asset ID
   * @returns Array of route results with amounts
   */
  async getMultiRouteAmountsOut(
    assetIdIn: AssetId,
    assetAmountIn: BigNumberish,
    routes: Route[],
    assetIdOut: AssetId
  ): Promise<MultiRouteAmountsOutResult> {
    if (!routes.length) {
      throw new Error("No routes provided");
    }

    // Validate routes and collect unique pool IDs
    const allPoolIds = routes.flatMap(route => route.pools);
    for (const route of routes) {
      let currentAsset = assetIdIn;
      for (const poolId of route.pools) {
        if (!poolId[0].bits.includes(currentAsset.bits) && !poolId[1].bits.includes(currentAsset.bits)) {
          throw new Error(`Invalid route: Pool ${poolIdToString(poolId)} does not contain asset ${currentAsset.bits}`);
        }
        currentAsset = poolId[0].bits === currentAsset.bits ? poolId[1] : poolId[0];
      }
      if (currentAsset.bits !== assetIdOut.bits) {
        throw new Error(`Route does not end with expected output asset: ${assetIdOut.bits}`);
      }
    }

    // Fetch all pool metadata in one multicall
    const poolMetadataMap = await this.fetchMultiPoolMetadata(allPoolIds);
    const fees = await this.fees();

    // Calculate amounts out for each route
    const results: MultiRouteAmountsOutResult =
      routes.map(route => ({
        route,
        amounts:  this.calculateRouteAmountsOut(assetIdIn, assetAmountIn, route, poolMetadataMap, fees),
      }))
    
    return results;
  }


  async fees(): Promise<AmmFees> {
    const result = await this.ammContract.functions.fees().get();
    const [lpFeeVolatile, lpFeeStable, protocolFeeVolatile, protocolFeeStable] = result.value;
    return {
      lpFeeVolatile: lpFeeVolatile,
      lpFeeStable: lpFeeStable,
      protocolFeeVolatile: protocolFeeVolatile,
      protocolFeeStable: protocolFeeStable,
    };
  }

  async hook(): Promise<string | null> {
    const result = await this.ammContract.functions.hook().get();
    return result.value?.bits || null;
  }

  async totalAssets(): Promise<BN> {
    const result = await this.ammContract.functions.total_assets().get();
    return result.value;
  }

  async lpAssetInfo(assetId: AssetId): Promise<LpAssetInfo | null> {
    const name = await this.ammContract.functions.name(assetInput(assetId)).get();
    const symbol = await this.ammContract.functions.symbol(assetInput(assetId)).get();
    const decimals = await this.ammContract.functions.decimals(assetInput(assetId)).get();
    const totalSupply = await this.ammContract.functions.total_supply(assetInput(assetId)).get();

    if (name.value && symbol.value && decimals.value && totalSupply.value) {
      return {
        assetId: assetId,
        name: name.value,
        symbol: symbol.value,
        decimals: decimals.value,
        totalSupply: totalSupply.value,
      };
    } else {
      return null;
    }
  }

  async totalSupply(assetId: AssetId): Promise<BN | undefined> {
    return (await this.ammContract.functions.total_supply(assetInput(assetId)).get()).value;
  }

  async owner(): Promise<string | null> {
    const result = await this.ammContract.functions.owner().get();
    const ownershipState = result.value;
    const identity = ownershipState.Initialized;
    const bits = identity?.Address?.bits ?? identity?.ContractId?.bits;
    return bits || null;
  }

  async getOtherTokenToAddLiquidity(
    poolId: PoolId,
    amount: BigNumberish,
    isFirstToken: boolean,
  ): Promise<Asset> {
    poolId = reorderPoolId(poolId);
    const pool = await this.poolMetadata(poolId);
    if (!pool) {
      throw new Error('Pool not found');
    }
    if (pool.reserve0.isZero() || pool.reserve1.isZero()) {
      throw new Error('Reserve is zero. Any number of tokens can be added');
    }
    if (isFirstToken) {
      const otherTokenAmount = new BN(amount).mul(pool.reserve1).div(pool.reserve0).add(new BN(1));
      return [pool.poolId[1], otherTokenAmount];
    } else {
      const otherTokenAmount = new BN(amount).mul(pool.reserve0).div(pool.reserve1).add(new BN(1));
      return [pool.poolId[0], otherTokenAmount];
    }
  }

  async getLiquidityPosition(poolId: PoolId, lpTokensAmount: BigNumberish): Promise<[Asset, Asset]> {
    poolId = reorderPoolId(poolId);
    const lpTokensBN = new BN(lpTokensAmount);
    if (lpTokensBN.isNeg() || lpTokensBN.isZero()) {
      throw new Error('Non positive input amount');
    }
    const pool = await this.poolMetadata(poolId);
    if (!pool) {
      throw new Error('Pool not found');
    }
    if (lpTokensBN.gt(pool.liquidity[1])) {
      throw new Error('Not enough liquidity');
    }

    const amount0 = pool.reserve0.mul(lpTokensBN).div(pool.liquidity[1]);
    const amount1 = pool.reserve1.mul(lpTokensBN).div(pool.liquidity[1]);
    return [[pool.poolId[0], amount0], [pool.poolId[1], amount1]];
  }

  async getAmountsOut(
    assetIdIn: AssetId,
    assetAmountIn: BigNumberish,
    pools: PoolId[]
  ): Promise<Asset[]> {
    const assetAmount = new BN(assetAmountIn);
    if (assetAmount.isNeg() || assetAmount.isZero()) {
      throw new Error('Non positive input amount');
    }
    const fees = await this.fees();

    let assetIn = assetIdIn;
    let amountIn = assetAmount;
    const amountsOut: Asset[] = [[assetIn, amountIn]];
    for (let poolId of pools) {
      poolId = reorderPoolId(poolId);
      const pool = await this.poolMetadata(poolId);
      if (!pool) {
        throw new Error('Pool not found');
      }
      amountIn = subtractFee(poolId, amountIn, fees);
      let [assetOut, reserveIn, reserveOut, decimalsIn, decimalsOut] = arrangePoolParams(pool, assetIn);
      let amountOut = getAmountOut(poolId[2], reserveIn, reserveOut, powDecimals(decimalsIn), powDecimals(decimalsOut), amountIn);

      assetIn = assetOut;
      amountIn = amountOut;
      amountsOut.push([assetIn, amountIn]);
    }
    return amountsOut;
  }

  async getAmountsIn(
    assetIdOut: AssetId,
    assetAmountOut: BigNumberish,
    pools: PoolId[]
  ): Promise<Asset[]> {
    const assetAmount = new BN(assetAmountOut);
    if (assetAmount.isNeg() || assetAmount.isZero()) {
      throw new Error('Non positive input amount');
    }
    const fees = await this.fees();

    let assetOut = assetIdOut;
    let amountOut = assetAmount;
    const amountsIn: Asset[] = [[assetOut, amountOut]];
    for (let poolId of pools.reverse()) {
      poolId = reorderPoolId(poolId);
      const pool = await this.poolMetadata(poolId);
      if (!pool) {
        throw new Error('Pool not found');
      }
      let [assetIn, reserveOut, reserveIn, decimalsOut, decimalsIn] = arrangePoolParams(pool, assetOut);
      let amountIn = getAmountIn(poolId[2], reserveIn, reserveOut, powDecimals(decimalsIn), powDecimals(decimalsOut), amountOut);
      amountIn = addFee(poolId, amountIn, fees);

      assetOut = assetIn;
      amountOut = amountIn;
      amountsIn.push([assetOut, amountOut]);
    }
    return amountsIn;
  }

  async previewSwapExactInput(
    assetIdIn: AssetId,
    assetAmountIn: BigNumberish,
    pools: PoolId[]
  ): Promise<Asset> {
    const amountsOut = await this.getAmountsOut(assetIdIn, assetAmountIn, pools);
    return amountsOut[amountsOut.length - 1];
  }

  async previewSwapExactOutput(
    assetIdOut: AssetId,
    assetAmountOut: BigNumberish,
    pools: PoolId[]
  ): Promise<Asset> {
    const amountsIn = await this.getAmountsIn(assetIdOut, assetAmountOut, pools);
    return amountsIn[amountsIn.length - 1];
  }

  // Returns the price of the provided assetId retrieved through the provided pools
  async getCurrentRate(
    assetId: AssetId,
    pools: PoolId[]
  ): Promise<[number, number?, number?]> {
    if (pools.length === 0) {
      throw new Error('No pools provided');
    }
    let lastPool = pools[pools.length - 1];
    if (!poolContainsAsset(lastPool, assetId)) {
      pools = pools.slice().reverse();
      lastPool = pools[pools.length - 1];
      if (!poolContainsAsset(lastPool, assetId)) {
        throw new Error('Asset not found in border pools');
      }
    }

    let assetIdIn = assetId;
    for (let poolId of pools.slice().reverse()) {
      if (poolId[0].bits === assetIdIn.bits) {
        assetIdIn = poolId[1];
      } else if (poolId[1].bits === assetIdIn.bits) {
        assetIdIn = poolId[0];
      } else {
        throw new Error('Incorrect pools');
      }
    }

    let currentRate = new BN(DECIMALS_PRECISION);
    let assetIn = assetIdIn;
    let assetDecimalsIn, assetDecimalsOut;
    const fees = await this.fees();
    const volatileFee = fees.lpFeeVolatile.toNumber() + fees.protocolFeeVolatile.toNumber();
    for (const poolId of pools) {
      const pool = await this.poolMetadata(poolId);
      if (!pool) {
        throw new Error(`Pool not found ${poolId}`);
      }
      const [reserveIn, reserveOut, assetOut, decimalsIn, decimalsOut] = poolId[0].bits === assetIn.bits ?
        [pool.reserve0, pool.reserve1, poolId[1], pool.decimals0, pool.decimals1] :
        [pool.reserve1, pool.reserve0, poolId[0], pool.decimals1, pool.decimals0];
      if (assetIdIn.bits === assetIn.bits) {
        assetDecimalsIn = decimalsIn;
      }
      if (poolId[2]) {
        // stable
        // TODO: temporary & fast solution based on the attempt to swap 100 tokens
        const assetAmountIn = 100;
        // already accounts for fees
        const amountsOut = await this.getAmountsOut(assetIn, assetAmountIn, [poolId]);
        const assetOut = amountsOut[amountsOut.length - 1][1];
        currentRate = currentRate.mul(assetAmountIn).div(assetOut);
      } else {
        // volatile
        currentRate = currentRate.mul(reserveIn).div(reserveOut).mul(BASIS_POINTS.sub(volatileFee)).div(BASIS_POINTS);
      }
      assetIn = assetOut;
      assetDecimalsOut = decimalsOut;
    }
    let rate = currentRate.toNumber() / DECIMALS_PRECISION
    return [rate, assetDecimalsIn, assetDecimalsOut];
  }
}
