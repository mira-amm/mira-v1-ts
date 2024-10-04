import {Account, Address, AssetId, BigNumberish, ScriptTransactionRequest, TxParams} from "fuels";
import {DEFAULT_AMM_CONTRACT_ID} from "./constants";
import {
  AddLiquidityScript,
  CreatePoolAndAddLiquidityScript,
  RemoveLiquidityScript,
  SwapExactInputScript,
  SwapExactOutputScript
} from "./typegen";
import {MiraAmmContract} from "./typegen/MiraAmmContract";
import {PoolId} from "./model";
import {addressInput, assetInput, contractIdInput, getAssetId, getLPAssetId, poolIdInput, reorderPoolId} from "./utils";
import {MiraAmmContractFactory} from "./typegen/MiraAmmContractFactory";

export class MiraAmm {
  private readonly account: Account;
  private readonly ammContract: MiraAmmContract;
  private readonly addLiquidityScript: AddLiquidityScript;
  private readonly createPoolAndAddLiquidityScript: CreatePoolAndAddLiquidityScript;
  private readonly removeLiquidityScript: RemoveLiquidityScript;
  private readonly swapExactInputScript: SwapExactInputScript;
  private readonly swapExactOutputScript: SwapExactOutputScript;

  constructor(account: Account, contractIdOpt?: string) {
    const contractId = contractIdOpt ?? DEFAULT_AMM_CONTRACT_ID;
    const contractIdConfigurables = {AMM_CONTRACT_ID: contractIdInput(contractId)};
    this.account = account;
    this.ammContract = new MiraAmmContract(contractId, account);
    this.addLiquidityScript = new AddLiquidityScript(account)
      .setConfigurableConstants(contractIdConfigurables);
    this.createPoolAndAddLiquidityScript = new CreatePoolAndAddLiquidityScript(account)
      .setConfigurableConstants(contractIdConfigurables);
    this.removeLiquidityScript = new RemoveLiquidityScript(account)
      .setConfigurableConstants(contractIdConfigurables);
    this.swapExactInputScript = new SwapExactInputScript(account)
      .setConfigurableConstants(contractIdConfigurables);
    this.swapExactOutputScript = new SwapExactOutputScript(account)
      .setConfigurableConstants(contractIdConfigurables);
  }

  static async deploy(wallet: Account): Promise<MiraAmm> {
    const {waitForResult} = await MiraAmmContractFactory.deploy(wallet);
    const {contract, transactionResult} = await waitForResult();

    console.log("Deployed MiraAmm contract with status:", transactionResult.status, "and id:", contract.id.toString());

    return new MiraAmm(wallet, contract.id.toString());
  }

  id(): string {
    return this.ammContract.id.toB256();
  }

  async addLiquidity(
    poolId: PoolId,
    amount0Desired: BigNumberish,
    amount1Desired: BigNumberish,
    amount0Min: BigNumberish,
    amount1Min: BigNumberish,
    deadline: BigNumberish,
    txParams?: TxParams,
  ): Promise<ScriptTransactionRequest> {
    poolId = reorderPoolId(poolId);
    const request = await this.addLiquidityScript
      .functions
      .main(poolIdInput(poolId), amount0Desired, amount1Desired, amount0Min, amount1Min, addressInput(this.account.address), deadline)
      .addContracts([this.ammContract])
      .txParams(txParams ?? {})
      .getTransactionRequest();

    request.addResources(
      await this.account.getResourcesToSpend([
        {
          assetId: poolId[0].bits,
          amount: amount0Desired,
        },
        {
          assetId: poolId[1].bits,
          amount: amount1Desired,
        },
      ])
    );

    request.addVariableOutputs(1); // LP token

    const gasCost = await this.account.getTransactionCost(request);
    return await this.account.fund(request, gasCost);
  }

  async createPoolAndAddLiquidity(
    token0Contract: string,
    token0SubId: string,
    token1Contract: string,
    token1SubId: string,
    isStable: boolean,
    amount0Desired: BigNumberish,
    amount1Desired: BigNumberish,
    deadline: BigNumberish,
    txParams?: TxParams,
  ): Promise<ScriptTransactionRequest> {
    let request = await this.createPoolAndAddLiquidityScript
      .functions
      .main(contractIdInput(token0Contract), token0SubId, contractIdInput(token1Contract), token1SubId, isStable, amount0Desired, amount1Desired, addressInput(this.account.address), deadline)
      .addContracts([this.ammContract])
      .txParams(txParams ?? {})
      .getTransactionRequest();
    const token0Asset = getAssetId(token0Contract, token0SubId);
    const token1Asset = getAssetId(token1Contract, token1SubId);

    request.addResources(
      await this.account.getResourcesToSpend([
        {
          assetId: token0Asset.bits,
          amount: amount0Desired,
        },
        {
          assetId: token1Asset.bits,
          amount: amount1Desired,
        },
      ])
    );

    request = request.addContractInputAndOutput(Address.fromString(token0Contract));
    if (token0Contract != token1Contract) {
      request = request.addContractInputAndOutput(Address.fromString(token1Contract));
    }

    request.addVariableOutputs(2); // LP token x2
    const gasCost = await this.account.getTransactionCost(request);
    return await this.account.fund(request, gasCost);
  }

  async createPool(
    token0Contract: string,
    token0SubId: string,
    token1Contract: string,
    token1SubId: string,
    isStable: boolean,
    txParams?: TxParams,
  ): Promise<ScriptTransactionRequest> {
    let request = await this.ammContract
      .functions
      .create_pool(contractIdInput(token0Contract), token0SubId, contractIdInput(token1Contract), token1SubId, isStable)
      .txParams(txParams ?? {})
      .getTransactionRequest();

    request = request.addContractInputAndOutput(Address.fromString(token0Contract));
    request = request.addContractInputAndOutput(Address.fromString("0x0ceafc5ef55c66912e855917782a3804dc489fb9e27edfd3621ea47d2a281156"));
    if (token0Contract != token1Contract) {
      request = request.addContractInputAndOutput(Address.fromString(token1Contract));
    }

    const gasCost = await this.account.getTransactionCost(request);
    return await this.account.fund(request, gasCost);
  }

  async removeLiquidity(
    poolId: PoolId,
    liquidity: BigNumberish,
    amount0Min: BigNumberish,
    amount1Min: BigNumberish,
    deadline: BigNumberish,
    txParams?: TxParams,
  ): Promise<ScriptTransactionRequest> {
    poolId = reorderPoolId(poolId);
    const request = await this.removeLiquidityScript
      .functions
      .main(poolIdInput(poolId), liquidity, amount0Min, amount1Min, addressInput(this.account.address), deadline)
      .addContracts([this.ammContract])
      .txParams(txParams ?? {})
      .getTransactionRequest();

    request.addResources(
      await this.account.getResourcesToSpend([
        {
          assetId: getLPAssetId(this.ammContract.id.toB256(), poolId).bits,
          amount: liquidity,
        },
      ])
    );

    request.addVariableOutputs(2); // tokens to receive back

    const gasCost = await this.account.getTransactionCost(request);
    return await this.account.fund(request, gasCost);
  }

  async swapExactInput(
    amountIn: BigNumberish,
    assetIn: AssetId,
    amountOutMin: BigNumberish,
    pools: PoolId[],
    deadline: BigNumberish,
    txParams?: TxParams,
  ): Promise<ScriptTransactionRequest> {
    let request = await this.swapExactInputScript
      .functions
      .main(amountIn, assetInput(assetIn), amountOutMin, pools.map(poolIdInput), addressInput(this.account.address), deadline)
      .addContracts([this.ammContract])
      .txParams(txParams ?? {})
      .getTransactionRequest();

    request.addResources(
      await this.account.getResourcesToSpend([
        {
          assetId: assetIn.bits,
          amount: amountIn,
        },
      ])
    );
    request.addVariableOutputs(1); // The token to receive

    const gasCost = await this.account.getTransactionCost(request);
    return await this.account.fund(request, gasCost);
  }

  async swapExactOutput(
    amountOut: BigNumberish,
    assetOut: AssetId,
    amountInMax: BigNumberish,
    pools: PoolId[],
    deadline: BigNumberish,
    txParams?: TxParams,
  ): Promise<ScriptTransactionRequest> {
    let request = await this.swapExactOutputScript
      .functions
      .main(amountOut, assetInput(assetOut), amountInMax, pools.map(poolIdInput), addressInput(this.account.address), deadline)
      .addContracts([this.ammContract])
      .txParams(txParams ?? {})
      .getTransactionRequest();

    let assetIn = assetOut;
    for (const pool of pools) {
      if (pool[0].bits === assetIn.bits) {
        assetIn = pool[1];
      } else {
        assetIn = pool[0];
      }
    }
    request.addResources(
      await this.account.getResourcesToSpend([
        {
          assetId: assetIn.bits,
          amount: amountInMax,
        },
      ])
    );
    request.addVariableOutputs(1); // The token to receive

    const gasCost = await this.account.getTransactionCost(request);
    return await this.account.fund(request, gasCost);
  }

  async transferOwnership(
    newOwner: string,
    txParams?: TxParams,
  ): Promise<ScriptTransactionRequest> {
    const request = await this.ammContract
      .functions
      .transfer_ownership(addressInput(newOwner))
      .txParams(txParams ?? {})
      .getTransactionRequest();

    const gasCost = await this.account.getTransactionCost(request);
    return await this.account.fund(request, gasCost);
  }
}
