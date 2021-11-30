#!/bin/bash

echo "env: $1";
echo "debug: $2";
echo "coin: $3";

env=$1
debug=$2
coin=$3

# DEV move (dont use jest)
if [[ $2 = 'true' ]]
then
  cd e2e/app-offline/offline-electron-app && npm run dev && cd ../../../ &&/
  cd e2e/app-online/online-electron-app && npm run dev && cd ../../../ &&/
  cd e2e/sdk-support/abort-tx && npm run dev && cd ../../../ &&/
#  cd e2e/sdk-transfers/cosmos-e2e-transfer && npm run dev && cd ../../../ &&/
#  cd e2e/sdk-tendermint-custom/cosmos-e2e-ibc-deposit && npm run dev && cd ../../../ &&/
#  cd e2e/sdk-tendermint-custom/osmosis-e2e-swap && npm run dev && cd ../../../ &&/
#  cd e2e/sdk-tendermint-custom/osmosis-e2e-delegate && npm run dev && cd ../../../ &&/
#  cd e2e/sdk-tendermint-custom/osmosis-e2e-lp-add && npm run dev && cd ../../../ BROKE TODO FIXME
#  cd e2e/sdk-transfers/thorchain-e2e-transfer && npm run dev && cd ../../../ &&/
#  cd e2e/sdk-transfers/ethereum-e2e-transfer && npm run dev && cd ../../../ &&/
##   cd e2e/sdk-support/rbf-ethereum && npm run dev && cd ../../../ &&/
#  cd e2e/sdk-support/abort-tx && npm run dev && cd ../../../ &&/
#  cd e2e/sdk-support/forget-user && npm run dev && cd ../../../ &&/
#  cd e2e/sdk-support/querykey-migration && npm run dev && cd ../../../ &&/
#  cd e2e/sdk-support/context-switching && npm run dev && cd ../../../ &&/
#  cd e2e/sdk-swaps/bitcoincash-e2e-swap && npm run dev && cd ../../../ &&/
#  cd e2e/sdk-swaps/etherum-e2e-swap && npm run dev && cd ../../../ &&/
#  cd e2e/sdk-swaps/thorchain-e2e-swap && npm run dev && cd ../../../

# Default mode
else
  cd e2e/app-offline/offline-electron-app && npm run test && cd ../../../ &&/
  cd e2e/app-online/online-electron-app && npm run test && cd ../../../ &&/
  #support functions
  cd e2e/sdk-support/abort-tx && npm run test && cd ../../../ &&/
# TODO addmeback
#  cd e2e/sdk-support/context-switching && npm run test && cd ../../../ &&/
#  cd e2e/sdk-support/forget-user && npm run test && cd ../../../ &&/
#  cd e2e/sdk-support/querykey-migration && npm run test && cd ../../../ &&/
#  cd e2e/sdk-support/rbf-ethereum && npm run test && cd ../../../ &&/
#  #transfers
#  cd e2e/sdk-transfers/cosmos-e2e-transfer && npm run test && cd ../../../ &&/
  #ibc depsoit
#  cd e2e/sdk-tendermint-custom/cosmos-e2e-ibc-deposit && npm run test && cd ../../../ &&/
  #osmosis
#  cd e2e/sdk-tendermint-custom/osmosis-e2e-swap && npm run test && cd ../../../ &&/
#  cd e2e/sdk-tendermint-custom/osmosis-e2e-delegate && npm run test && cd ../../../
#  cd e2e/sdk-tendermint-custom/osmosis-e2e-lp-add && npm run test && cd ../../../ BROKE TODO FIXME

#remember last entry can NOT have &&/

#thorchain offline TODO re-enable
#  cd e2e/sdk-swaps/bitcoincash-e2e-swap && npm run test && cd ../../../ &&/
#  cd e2e/sdk-swaps/etherum-e2e-swap && npm run test && cd ../../../ &&/
#  cd e2e/sdk-swaps/thorchain-e2e-swap && npm run test
fi

#	cd e2e/sdk-swaps/thorchain-e2e-swap && npm run dev
#	cd e2e/sdk-swaps/thorchain-e2e-swap && npm run test &&/
#	cd e2e/sdk-swaps/etherum-e2e-swap && npm run dev
#	cd e2e/sdk-swaps/etherum-e2e-swap && npm run test &&/
#	cd e2e/sdk-swaps/tokens-e2e-swap && npm run dev
#	cd e2e/sdk-swaps/tokens-e2e-swap && npm run test
#	cd e2e/sdk-support/abort-tx && npm run dev
#	cd e2e/sdk-support/abort-tx && npm run test
