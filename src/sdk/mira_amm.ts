import {Account, AssetId, BigNumberish, ScriptTransactionRequest, TxParams,} from "fuels";
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
import {addressInput, assetInput, contractIdInput, poolIdInput} from "./utils";

export class MiraAmm {
  private readonly account: Account;
  private readonly ammContract: MiraAmmContract;
  private readonly addLiquidityScript: AddLiquidityScript;
  private readonly createPoolAndAddLiquidityScript: CreatePoolAndAddLiquidityScript;
  private readonly removeLiquidityScript: RemoveLiquidityScript;
  private readonly swapExactInputScript: SwapExactInputScript;
  private readonly swapExactOutputScript: SwapExactOutputScript;

  constructor(account: Account, contractIdOpt?: string) {
    let contractId = contractIdOpt ?? DEFAULT_AMM_CONTRACT_ID;
    let contractIdConfigurables = {AMM_CONTRACT_ID: contractIdInput(contractId)};
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

  id(): string {
    return this.ammContract.id.toString();
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
    let request = await this.addLiquidityScript
      .functions
      .main(poolIdInput(poolId), amount0Desired, amount1Desired, amount0Min, amount1Min, addressInput(this.account.address), deadline)
      .addContracts([this.ammContract])
      .txParams(txParams ?? {})
      .getTransactionRequest();

    request.addVariableOutputs(1); // LP token

    return request;
  }

  async removeLiquidity(
    poolId: PoolId,
    liquidity: BigNumberish,
    amount0Min: BigNumberish,
    amount1Min: BigNumberish,
    deadline: BigNumberish,
    txParams?: TxParams,
  ): Promise<ScriptTransactionRequest> {
    let request = await this.removeLiquidityScript
      .functions
      .main(poolIdInput(poolId), liquidity, amount0Min, amount1Min, addressInput(this.account.address), deadline)
      .addContracts([this.ammContract])
      .txParams(txParams ?? {})
      .getTransactionRequest();

    request.addVariableOutputs(2); // tokens to receive back

    return request;
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

    request.addVariableOutputs(1); // The token to receive

    return request;
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

    request.addVariableOutputs(1); // The token to receive

    return request;
  }
}
