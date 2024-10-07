/* Autogenerated file. Do not edit manually. */

/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */

/*
  Fuels version: 0.94.9
*/

import { Contract, ContractFactory, decompressBytecode } from "fuels";
import type { Provider, Account, DeployContractOptions, DeployContractResult } from "fuels";

import { MiraAmmContract } from "./MiraAmmContract";

const bytecode = decompressBytecode("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");

export class MiraAmmContractFactory extends ContractFactory {

  static readonly bytecode = bytecode;

  constructor(accountOrProvider: Account | Provider) {
    super(bytecode, MiraAmmContract.abi, accountOrProvider);
  }

  deploy<TContract extends Contract = Contract>(
    deployOptions?: DeployContractOptions
  ): Promise<DeployContractResult<TContract>> {
    return super.deploy({
      storageSlots: MiraAmmContract.storageSlots,
      ...deployOptions,
    });
  }

  static async deploy (
    wallet: Account,
    options: DeployContractOptions = {}
  ): Promise<DeployContractResult<MiraAmmContract>> {
    const factory = new MiraAmmContractFactory(wallet);
    return factory.deploy(options);
  }
}
