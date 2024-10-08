import { describe, it, expect } from 'vitest';
import { launchTestNode } from 'fuels/test-utils';
import { AssetId, ContractFactory } from 'fuels';

import { MiraAmmContractFactory as AmmContractFactory } from '../src/sdk/typegen/MiraAmmContractFactory';
import { MockTokenFactory } from '../src/sdk/typegen/MockTokenFactory';
import { 
  CreatePoolAndAddLiquidityScript as LiqPoolScript,
  CreatePoolAndAddLiquidityScriptLoader as LiqPoolScriptLoader,
} from '../src/sdk/typegen';


describe('Create Pool and Add Liquidity', () => {
  it('local', async () => {
    using launched = await launchTestNode({
      walletsConfig: {
        // assets: [],
        amountPerCoin: 100_000_000,
      }
    });  

    const {
      wallets: [genesis, recipient],
    } = launched;

    // Deploy Amm Contract
    const { waitForResult: waitForAmmContractDeploy } = await AmmContractFactory.deploy(genesis);
    const { contract: ammContract } = await waitForAmmContractDeploy();

    // Deploy Mock Token Contract
    const { waitForResult: waitForTokenContractDeploy } = await MockTokenFactory.deploy(genesis);
    const { contract: tokenContract } = await waitForTokenContractDeploy();

    // Add Token A
    const { waitForResult: waitForTokenA } = await tokenContract.functions.add_token("TOKEN_A", "TKA", 9).call();
    const { value: tokenAId } = await waitForTokenA();

    // Add Token B
    const { waitForResult: waitForTokenB } = await tokenContract.functions.add_token("TOKEN_B", "TKB", 9).call();
    const { value: tokenBId } = await waitForTokenB();

    // Token A Sub ID
    const { waitForResult: waitForTokenASubId } = await tokenContract.functions.get_sub_id(tokenAId).call();
    const { value: tokenASubId } = await waitForTokenASubId();

    // Token B Sub ID
    const { waitForResult: waitForTokenBSubId } = await tokenContract.functions.get_sub_id(tokenBId).call();
    const { value: tokenBSubId } = await waitForTokenBSubId();

    // Assert Sub IDs
    if (!tokenASubId || !tokenBSubId) {
      throw new Error('Token sub IDs not set');
    }

    // Order
    const orderSubIds = (assetIds: AssetId[], subIds: string[]) => {
      if (assetIds[0].bits < assetIds[1].bits) {
        return [subIds[0], subIds[1]];
      }
      return [ subIds[1], subIds[0]];
    }

    const orderTokenIds = (assetIds: AssetId[]): AssetId[] => {
      if (assetIds[0].bits < assetIds[1].bits) {
        return [assetIds[0], assetIds[1]];
      }
      return [assetIds[1], assetIds[0]];
    }

    const [orderedSubIdA, orderedSubIdB] = orderSubIds([tokenAId, tokenBId], [tokenASubId, tokenBSubId]);
    const [orderedTokenIdA, orderedTokenIdB] = orderTokenIds([tokenAId, tokenBId]);

    // Mint Token A
    const { waitForResult: waitForTokenAMint } = await tokenContract.functions.mint_tokens(orderedTokenIdA, 1_000_000).call();
    await waitForTokenAMint();

    // Mint Token B
    const { waitForResult: waitForTokenBMint } = await tokenContract.functions.mint_tokens(orderedTokenIdB, 1_000_000).call();
    await waitForTokenBMint();

    // Set Ownership
    const { waitForResult: waitForAmmSetOwnership } = await ammContract.functions.transfer_ownership({ Address: { bits: genesis.address.toB256() }}).call();
    await waitForAmmSetOwnership();

    // Deploy Script as Blob
    const ScriptFactory = new ContractFactory(LiqPoolScript.bytecode, LiqPoolScript.abi, genesis);
    const { waitForResult: waitForScriptDeploy } = await ScriptFactory.deployAsBlobTxForScript();
    await waitForScriptDeploy();

    // Load Script via Loader
    const liqPoolScript = new LiqPoolScriptLoader(genesis);
    liqPoolScript.setConfigurableConstants({
        AMM_CONTRACT_ID: { bits: ammContract.id.toB256()},
    });

    // Get minted resources
    const resources = await genesis.getResourcesToSpend([
      { assetId: orderedTokenIdA.bits, amount: 1_000_000 },
      { assetId: orderedTokenIdB.bits, amount: 1_000_000 },
      { assetId: genesis.provider.getBaseAssetId(), amount: 10_000_000 },
    ]);

    // Execute Script and build tx
    const request = await liqPoolScript.functions.main(
      { bits: tokenContract.id.toB256() },
      orderedSubIdA,
      { bits: tokenContract.id.toB256() },
      orderedSubIdB,
      false,
      100_000,
      100_000,
      { Address: { bits: recipient.address.toB256() }},
      100_000_000,
    )
    .addContracts([ammContract, tokenContract])
    .getTransactionRequest();

    request.addResources(resources);
    request.addChangeOutput(recipient.address, orderedTokenIdA.bits);
    request.addChangeOutput(recipient.address, orderedTokenIdB.bits);
    request.addVariableOutputs(2);

    const cost = await genesis.getTransactionCost(request);
    request.maxFee = cost.maxFee;
    request.gasLimit = cost.gasUsed;
    genesis.fund(request, cost);

    const tx = await genesis.sendTransaction(request);

    console.log(tx);

    const res = await tx.waitForResult();
    expect(res.isStatusSuccess).toBe(true);
  });
});
