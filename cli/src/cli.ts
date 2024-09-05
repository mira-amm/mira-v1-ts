import {Command} from "commander";
import * as dotenv from "dotenv";
import {cleanEnv, str} from "envalid";
import {Address, Provider, TransactionRequest, TxParams, WalletUnlocked} from "fuels";
import {buildPoolId, getAssetId, MiraAmm, ReadonlyMiraAmm} from "../../src/sdk";
import {futureDeadline} from "./utils";

const FALLBACK_RPC = "https://testnet.fuel.network/v1/graphql";

dotenv.config();

const {SECRET_KEY, RPC, CONTRACT_ADDRESS} = cleanEnv(process.env, {
  SECRET_KEY: str({default: ""}),
  CONTRACT_ADDRESS: str({default: ""}),
  RPC: str({default: FALLBACK_RPC}),
});

const program = new Command();

const provider = await Provider.create(RPC);
const wallet = new WalletUnlocked(SECRET_KEY, provider);
const mira = new MiraAmm(wallet, CONTRACT_ADDRESS);
const readonlyMira = new ReadonlyMiraAmm(provider, CONTRACT_ADDRESS);
const txParams: TxParams = {
  gasLimit: 999_999,
  maxFee: 999_999,
};

async function fundAndSend<T extends TransactionRequest>(request: T, operation: string) {
  const gasCost = await wallet.getTransactionCost(request);
  request = await wallet.fund(request, gasCost);
  const tx = await wallet.sendTransaction(request);

  const response = await provider.getTransactionResponse(tx.id);
  await response.waitForResult();
  console.log(operation, tx.id);
}

program
  .command("create-pool-and-add-liquidity isStable tokenAContract tokenASubId tokenBContract tokenBSubId amountA amountB")
  .action(async (isStable, tokenAContract, tokenASubId, tokenBContract, tokenBSubId, amountA, amountB) => {
    isStable = isStable === "true";
    const assetA = getAssetId(tokenAContract, tokenASubId);
    const assetB = getAssetId(tokenBContract, tokenBSubId);
    const poolId = buildPoolId(assetA, assetB, isStable);

    const [token0Contract, token0SubId, token1Contract, token1SubId, amount0, amount1] = poolId[0].bits === assetA.bits ?
      [tokenAContract, tokenASubId, tokenBContract, tokenBSubId, amountA, amountB] :
      [tokenBContract, tokenBSubId, tokenAContract, tokenASubId, amountB, amountA];
    const deadline = await futureDeadline(provider);
    const request = await mira.createPoolAndAddLiquidity(token0Contract, token0SubId, token1Contract, token1SubId, isStable, amount0, amount1, deadline, txParams);
    await fundAndSend(request, "create-pool-and-add-liquidity");
  });

program
  .command("add-liquidity isStable assetA assetB amountA amountB")
  .action(async (isStable, assetA, assetB, amountA, amountB) => {
    isStable = isStable === "true";
    const poolId = buildPoolId(assetA, assetB, isStable);
    const amount0 = poolId[0].bits === assetA ? amountA : amountB;
    const amount1 = poolId[0].bits === assetA ? amountB : amountA;
    const deadline = await futureDeadline(provider);
    const request = await mira.addLiquidity(poolId, amount0, amount1, 0, 0, deadline, txParams);
    await fundAndSend(request, "add-liquidity");
  });

program
  .command("remove-liquidity isStable assetA assetB liquidity")
  .action(async (isStable, assetA, assetB, liquidity) => {
    isStable = isStable === "true";
    const poolId = buildPoolId(assetA, assetB, isStable);
    const deadline = await futureDeadline(provider);
    const request = await mira.removeLiquidity(poolId, liquidity, 0, 0, deadline, txParams);
    await fundAndSend(request, "remove-liquidity");
  });

program
  .command("pool-meta isStable assetA assetB")
  .action(async (isStable, assetA, assetB) => {
    isStable = isStable === "true";
    const poolId = buildPoolId(assetA, assetB, isStable);
    const meta = await readonlyMira.poolMetadata(poolId);
    if (meta === null) {
      console.log("Pool not found");
      return;
    }
    const lpAssetInfo = await readonlyMira.lpAssetInfo({bits: meta.liquidity[0].bits});
    if (lpAssetInfo === null) {
      console.log("LP asset not found");
      return;
    }
    console.log("id:", meta.poolId[0].bits, meta.poolId[1].bits, meta.poolId[2]);
    console.log("reserve0:", meta.reserve0.toString());
    console.log("reserve1:", meta.reserve1.toString());
    console.log("liquidity:", meta.liquidity[1].toString());
    console.log("liquidity asset:", meta.liquidity[0].bits);
    console.log("decimals0:", meta.decimals0);
    console.log("decimals1:", meta.decimals1);
    console.log("lp name:", lpAssetInfo.name);
    console.log("lp symbol:", lpAssetInfo.symbol);
    console.log("lp decimals:", lpAssetInfo.decimals);
    console.log("lp total supply:", lpAssetInfo.totalSupply.toString());
  });

program
  .command("amm-meta")
  .action(async () => {
    const meta = await readonlyMira.ammMetadata();
    console.log("id:", Address.fromString(meta.id).toB256());
    console.log("owner:", meta.owner);
    console.log("hook:", meta.hook);
    console.log("total assets:", meta.totalAssets.toString());
    console.log("LP fees (v/s):", meta.fees.lpFeeVolatile.toString(), meta.fees.lpFeeStable.toString());
    console.log("Protocol fees (v/s):", meta.fees.protocolFeeVolatile.toString(), meta.fees.protocolFeeStable.toString());
  });

program
  .command("transfer-ownership newOwner")
  .action(async (newOwner) => {
    let request = await mira.transferOwnership(newOwner, txParams);
    await fundAndSend(request, "transfer-ownership");
  });

program.parse();
