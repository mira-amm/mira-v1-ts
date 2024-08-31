import {AssetIdInput, ContractIdInput, IdentityInput} from "./typegen/MiraAmmContract";
import {AbstractAddress, AssetId} from "fuels";
import {PoolId} from "./model";

export function contractIdInput(contractId: string): ContractIdInput {
  return {bits: contractId};
}

export function addressInput(address: AbstractAddress): IdentityInput {
  return {Address: {bits: address.toString()}};
}

export function assetInput(asset: AssetId): AssetIdInput {
  return {bits: asset.toString()};
}

export function poolIdInput(poolId: PoolId): [AssetIdInput, AssetIdInput, boolean] {
  return [assetInput(poolId[0]), assetInput(poolId[1]), poolId[2]];
}
