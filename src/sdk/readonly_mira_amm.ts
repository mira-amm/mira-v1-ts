import {AssetId, BigNumberish, BN, Provider} from "fuels";
import {DEFAULT_AMM_CONTRACT_ID} from "./constants";
import {MiraAmmContract} from "./typegen/MiraAmmContract";
import {AmmFees, AmmMetadata, Asset, LpAssetInfo, PoolId, PoolMetadata} from "./model";
import {assetInput, poolIdInput} from "./utils";

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
    const pool = await this.poolMetadata(poolId);
    if (!pool) {
      throw new Error('Pool not found');
    }
    if (pool.reserve0.isZero() || pool.reserve1.isZero()) {
      throw new Error('Reserve is zero. Any number of tokens can be added');
    }
    if (isFirstToken) {
      const otherTokenAmount = new BN(amount).div(pool.reserve0).mul(pool.reserve1);
      return [pool.poolId[1], otherTokenAmount];
    } else {
      const otherTokenAmount = new BN(amount).div(pool.reserve1).mul(pool.reserve0);
      return [pool.poolId[0], otherTokenAmount];
    }
  }

  async getLiquidityPosition(poolId: PoolId, lpTokensAmount: BigNumberish): Promise<[Asset, Asset]> {
    const lpTokensBN = new BN(lpTokensAmount);
    if (lpTokensBN.isNeg() || lpTokensBN.isZero()) {
      throw new Error('Non positive input amount');
    }
    const pool = await this.poolMetadata(poolId);
    if (!pool) {
      throw new Error('Pool not found');
    }
    if (lpTokensBN > pool.liquidity[1]) {
      throw new Error('Not enough liquidity');
    }

    const multiplier = lpTokensBN.div(pool.liquidity[1]);
    const amount0 = pool.reserve0.mul(multiplier);
    const amount1 = pool.reserve1.mul(multiplier);
    return [[pool.poolId[0], amount0], [pool.poolId[1], amount1]];
  }

  async previewSwapExactInput(
    assetIn: Asset,
    pools: PoolId[]
  ): Promise<Asset> {
    throw new Error('Not implemented');
  }

  async swapExactOutput(
    assetOut: Asset,
    pools: PoolId[]
  ): Promise<Asset> {
    throw new Error('Not implemented');
  }
}
