/* Autogenerated file. Do not edit manually. */

/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */

/*
  Fuels version: 0.94.3
*/

import {
  Account,
  BigNumberish,
  BN,
  decompressBytecode,
  Script,
  StrSlice,
} from 'fuels';

import type { Enum, Vec } from "./common";

export type IdentityInput = Enum<{ Address: AddressInput, ContractId: ContractIdInput }>;
export type IdentityOutput = Enum<{ Address: AddressOutput, ContractId: ContractIdOutput }>;

export type AddressInput = { bits: string };
export type AddressOutput = AddressInput;
export type AssetIdInput = { bits: string };
export type AssetIdOutput = AssetIdInput;
export type ContractIdInput = { bits: string };
export type ContractIdOutput = ContractIdInput;

export type SwapExactInputScriptInputs = [amount_in: BigNumberish, asset_in: AssetIdInput, amount_out_min: BigNumberish, pools: Vec<[AssetIdInput, AssetIdInput, boolean]>, recipient: IdentityInput, deadline: BigNumberish];
export type SwapExactInputScriptOutput = Vec<[BN, AssetIdOutput]>;

export type SwapExactInputScriptConfigurables = Partial<{
  AMM_CONTRACT_ID: ContractIdInput;
}>;

const abi = {
  "programType": "script",
  "specVersion": "1",
  "encodingVersion": "1",
  "concreteTypes": [
    {
      "type": "(struct std::asset_id::AssetId, struct std::asset_id::AssetId, bool)",
      "concreteTypeId": "a95e1fcceb1451b8a76471f593f66c4a52ca04bde3c227c746ad7aaf988de5c6",
      "metadataTypeId": 1
    },
    {
      "type": "(u64, struct std::asset_id::AssetId)",
      "concreteTypeId": "e10d8bfc338a29565debd72645b365f9b0481e462fd7d591848de4a73223d58d",
      "metadataTypeId": 0
    },
    {
      "type": "enum std::identity::Identity",
      "concreteTypeId": "ab7cd04e05be58e3fc15d424c2c4a57f824a2a2d97d67252440a3925ebdc1335",
      "metadataTypeId": 4
    },
    {
      "type": "str",
      "concreteTypeId": "8c25cb3686462e9a86d2883c5688a22fe738b0bbc85f458d2d2b5f3f667c6d5a"
    },
    {
      "type": "struct std::asset_id::AssetId",
      "concreteTypeId": "c0710b6731b1dd59799cf6bef33eee3b3b04a2e40e80a0724090215bbf2ca974",
      "metadataTypeId": 8
    },
    {
      "type": "struct std::contract_id::ContractId",
      "concreteTypeId": "29c10735d33b5159f0c71ee1dbd17b36a3e69e41f00fab0d42e1bd9f428d8a54",
      "metadataTypeId": 9
    },
    {
      "type": "struct std::vec::Vec<(struct std::asset_id::AssetId, struct std::asset_id::AssetId, bool)>",
      "concreteTypeId": "a5cbfec6a05585025be4180a09c2bd7944724d54ac729c9bebe421d061ee5378",
      "metadataTypeId": 11,
      "typeArguments": [
        "a95e1fcceb1451b8a76471f593f66c4a52ca04bde3c227c746ad7aaf988de5c6"
      ]
    },
    {
      "type": "struct std::vec::Vec<(u64, struct std::asset_id::AssetId)>",
      "concreteTypeId": "6f03bcbe6f8a1e01b5dcb5701ab21443606d1b323a888ead4e9a2ecda650ae2e",
      "metadataTypeId": 11,
      "typeArguments": [
        "e10d8bfc338a29565debd72645b365f9b0481e462fd7d591848de4a73223d58d"
      ]
    },
    {
      "type": "u32",
      "concreteTypeId": "d7649d428b9ff33d188ecbf38a7e4d8fd167fa01b2e10fe9a8f9308e52f1d7cc"
    },
    {
      "type": "u64",
      "concreteTypeId": "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
    }
  ],
  "metadataTypes": [
    {
      "type": "(_, _)",
      "metadataTypeId": 0,
      "components": [
        {
          "name": "__tuple_element",
          "typeId": "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
        },
        {
          "name": "__tuple_element",
          "typeId": 8
        }
      ]
    },
    {
      "type": "(_, _, _)",
      "metadataTypeId": 1,
      "components": [
        {
          "name": "__tuple_element",
          "typeId": 8
        },
        {
          "name": "__tuple_element",
          "typeId": 8
        },
        {
          "name": "__tuple_element",
          "typeId": 3
        }
      ]
    },
    {
      "type": "b256",
      "metadataTypeId": 2
    },
    {
      "type": "bool",
      "metadataTypeId": 3
    },
    {
      "type": "enum std::identity::Identity",
      "metadataTypeId": 4,
      "components": [
        {
          "name": "Address",
          "typeId": 7
        },
        {
          "name": "ContractId",
          "typeId": 9
        }
      ]
    },
    {
      "type": "generic T",
      "metadataTypeId": 5
    },
    {
      "type": "raw untyped ptr",
      "metadataTypeId": 6
    },
    {
      "type": "struct std::address::Address",
      "metadataTypeId": 7,
      "components": [
        {
          "name": "bits",
          "typeId": 2
        }
      ]
    },
    {
      "type": "struct std::asset_id::AssetId",
      "metadataTypeId": 8,
      "components": [
        {
          "name": "bits",
          "typeId": 2
        }
      ]
    },
    {
      "type": "struct std::contract_id::ContractId",
      "metadataTypeId": 9,
      "components": [
        {
          "name": "bits",
          "typeId": 2
        }
      ]
    },
    {
      "type": "struct std::vec::RawVec",
      "metadataTypeId": 10,
      "components": [
        {
          "name": "ptr",
          "typeId": 6
        },
        {
          "name": "cap",
          "typeId": "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
        }
      ],
      "typeParameters": [
        5
      ]
    },
    {
      "type": "struct std::vec::Vec",
      "metadataTypeId": 11,
      "components": [
        {
          "name": "buf",
          "typeId": 10,
          "typeArguments": [
            {
              "name": "",
              "typeId": 5
            }
          ]
        },
        {
          "name": "len",
          "typeId": "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
        }
      ],
      "typeParameters": [
        5
      ]
    }
  ],
  "functions": [
    {
      "inputs": [
        {
          "name": "amount_in",
          "concreteTypeId": "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
        },
        {
          "name": "asset_in",
          "concreteTypeId": "c0710b6731b1dd59799cf6bef33eee3b3b04a2e40e80a0724090215bbf2ca974"
        },
        {
          "name": "amount_out_min",
          "concreteTypeId": "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
        },
        {
          "name": "pools",
          "concreteTypeId": "a5cbfec6a05585025be4180a09c2bd7944724d54ac729c9bebe421d061ee5378"
        },
        {
          "name": "recipient",
          "concreteTypeId": "ab7cd04e05be58e3fc15d424c2c4a57f824a2a2d97d67252440a3925ebdc1335"
        },
        {
          "name": "deadline",
          "concreteTypeId": "d7649d428b9ff33d188ecbf38a7e4d8fd167fa01b2e10fe9a8f9308e52f1d7cc"
        }
      ],
      "name": "main",
      "output": "6f03bcbe6f8a1e01b5dcb5701ab21443606d1b323a888ead4e9a2ecda650ae2e",
      "attributes": null
    }
  ],
  "loggedTypes": [
    {
      "logId": "10098701174489624218",
      "concreteTypeId": "8c25cb3686462e9a86d2883c5688a22fe738b0bbc85f458d2d2b5f3f667c6d5a"
    }
  ],
  "messagesTypes": [],
  "configurables": [
    {
      "name": "AMM_CONTRACT_ID",
      "concreteTypeId": "29c10735d33b5159f0c71ee1dbd17b36a3e69e41f00fab0d42e1bd9f428d8a54",
      "offset": 17064
    }
  ]
};

const bytecode = decompressBytecode('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');

export class SwapExactInputScript extends Script<SwapExactInputScriptInputs, SwapExactInputScriptOutput> {

  static readonly abi = abi;
  static readonly bytecode = bytecode;

  constructor(wallet: Account) {
    super(bytecode, abi, wallet);
  }
}
