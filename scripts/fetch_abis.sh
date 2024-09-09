#!/bin/bash

set -ex

mkdir -p tmp_abis
cd tmp_abis

echo "Fetching latest Mira v1 core and periphery sources"
git clone git@github.com:mira-amm/mira-v1-core.git
git clone git@github.com:mira-amm/mira-v1-periphery.git

echo "Building Mira v1 core and periphery"

cd mira-v1-core
forc build --release
cd ../mira-v1-periphery
forc build --release

cd ../..

mkdir -p sway_abis/contracts/mira_amm_contract
mkdir -p sway_abis/scripts/add_liquidity_script
mkdir -p sway_abis/scripts/create_pool_and_add_liquidity_script
mkdir -p sway_abis/scripts/remove_liquidity_script
mkdir -p sway_abis/scripts/swap_exact_input_script
mkdir -p sway_abis/scripts/swap_exact_output_script

mv -f tmp_abis/mira-v1-core/contracts/mira_amm_contract/out/release/ sway_abis/contracts/mira_amm_contract
mv -f tmp_abis/mira-v1-periphery/scripts/add_liquidity_script/out/release/ sway_abis/scripts/add_liquidity_script
mv -f tmp_abis/mira-v1-periphery/scripts/create_pool_and_add_liquidity_script/out/release/ sway_abis/scripts/create_pool_and_add_liquidity_script
mv -f tmp_abis/mira-v1-periphery/scripts/remove_liquidity_script/out/release/ sway_abis/scripts/remove_liquidity_script
mv -f tmp_abis/mira-v1-periphery/scripts/swap_exact_input_script/out/release/ sway_abis/scripts/swap_exact_input_script
mv -f tmp_abis/mira-v1-periphery/scripts/swap_exact_output_script/out/release/ sway_abis/scripts/swap_exact_output_script

rm -rf tmp_abis

pnpm fuels typegen -i sway_abis/contracts/*/release/*-abi.json -o ./src/sdk/typegen --contract
pnpm fuels typegen -i sway_abis/scripts/*/release/*-abi.json -o ./src/sdk/typegen --script
