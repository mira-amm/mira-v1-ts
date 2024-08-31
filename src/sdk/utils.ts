import {AssetIdInput, ContractIdInput, IdentityInput} from "./typegen/MiraAmmContract";
import {AbstractAddress, AssetId} from "fuels";
import {PoolId} from "./model";

export function contractIdInput(contractId: string): ContractIdInput {
  return {bits: contractId};
}

export function addressInput(address: string | AbstractAddress): IdentityInput {
  return {Address: {bits: address.toString()}};
}

export function assetInput(asset: AssetId): AssetIdInput {
  return {bits: asset.toString()};
}

export function poolIdInput(poolId: PoolId): [AssetIdInput, AssetIdInput, boolean] {
  poolId = reorderPoolId(poolId);
  return [assetInput(poolId[0]), assetInput(poolId[1]), poolId[2]];
}

export function buildPoolId(assetA: AssetId, assetB: AssetId, isStable: boolean): PoolId {
  return reorderPoolId([assetA, assetB, isStable]);
}

function reorderPoolId(poolId: PoolId): PoolId {
  if (assetLessThan(poolId[0], poolId[1])) {
    return poolId
  } else {
    return [poolId[1], poolId[0], poolId[2]];
  }
}

function assetLessThan(assetA: AssetId, assetB: AssetId): boolean {
  let assetAInt = parseInt(assetA.bits, 16);
  let assetBInt = parseInt(assetB.bits, 16);
  return assetAInt < assetBInt;
}
