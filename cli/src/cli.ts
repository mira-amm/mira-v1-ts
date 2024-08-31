import {Command} from "commander";
import * as dotenv from "dotenv";
import {cleanEnv, str} from "envalid";
import {Address, Provider, TxParams, WalletUnlocked,} from "fuels";
import {buildPoolId, MiraAmm, ReadonlyMiraAmm} from "../../src/sdk";
import {futureDeadline} from "src/utils";

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
  gasLimit: 300_000,
  maxFee: 300_000,
};

program
  .command("add-liquidity createPool isStable assetA assetB amountA amountB")
  .action(async (createPool, isStable, assetA, assetB, amountA, amountB) => {
    const poolId = buildPoolId(assetA, assetB, isStable);
    const amount0 = poolId[0].bits === assetA ? amountA : amountB;
    const amount1 = poolId[0].bits === assetA ? amountB : amountA;
    const deadline = await futureDeadline(provider);
    const request = await mira.addLiquidity(createPool, poolId, amount0, amount1, 0, 0, deadline, txParams);
    const tx = await wallet.sendTransaction(request);
    console.log("add-liquidity: ", tx.id);
  });

program
  .command("remove-liquidity isStable assetA assetB liquidity")
  .action(async (isStable, assetA, assetB, liquidity) => {
    const poolId = buildPoolId(assetA, assetB, isStable);
    const deadline = await futureDeadline(provider);
    const request = await mira.removeLiquidity(poolId, liquidity, 0, 0, deadline, txParams);
    const tx = await wallet.sendTransaction(request);
    console.log("remove-liquidity: ", tx.id);
  });

program
  .command("pool-meta isStable assetA assetB")
  .action(async (isStable, assetA, assetB) => {
    const poolId = buildPoolId(assetA, assetB, isStable);
    const meta = await readonlyMira.poolMetadata(poolId);
    if (meta === null) {
      console.log("Pool not found");
      return;
    }
    console.log("id:", meta.poolId);
    console.log("reserve0:", meta.reserve0.toString());
    console.log("reserve1:", meta.reserve1.toString());
    console.log("liquidity:", meta.liquidity[1].toString());
    console.log("liquidity asset:", meta.liquidity[0].toString());
    console.log("decimals0:", meta.decimals0);
    console.log("decimals1:", meta.decimals1);
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
    const request = await mira.transferOwnership(newOwner, txParams);
    const tx = await wallet.sendTransaction(request);
    console.log("transfer-ownership: ", tx.id);
  });

program.parse();
