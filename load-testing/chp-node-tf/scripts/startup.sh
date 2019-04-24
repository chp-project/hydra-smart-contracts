#!/bin/bash

if [ -x "$(command -v docker)" ]; then
    echo "Docker already installed"
else
    echo "Install docker"
    curl -fsSL https://get.docker.com -o get-docker.sh
    bash get-docker.sh
    sudo usermod -aG docker $USER
fi

sudo apt-get -qq install -y docker-compose git make jq nodejs npm openssl build-essential g++
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
if ! [ -x "$(command -v yarn)" ]; then
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
    sudo apt-get update -y && sudo apt-get install -y --no-install-recommends yarn
fi

cd /srv
sudo mkdir chp

cd ./chp

sudo git clone https://github.com/chainpoint/chainpoint-node-src.git
sudo chmod 775 chainpoint-node-src
cd ./chainpoint-node-src
git checkout -b v2 origin/v2

sudo git clone --single-branch --branch preprod https://michael-iglesias:faca2c20b50c456892f3b6a601ae457d7a49ff10@github.com/chainpoint/go-hydra-smart-contract-files.git artifacts/ethcontracts

curl "http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip" -H "Metadata-Flavor: Google" > eip.txt

make init

make build

make build-rocksdb

make deploy

# Start Hydra Utils to poll for a positive $TKN balance before it invokes `make register` on behalf of the Node
npm install -g load-testing-node-utils
export ETH_INFURA_API_KEY="ad8f210998704f9e89a37a4791d4702e" && hydra-chp-node-utils&

# make register NODE_ETH_REWARDS_ADDRESS=$(</eth-address.txt) NODE_PUBLIC_IP_ADDRESS=$(</eip.txt) AUTO_REFILL_ENABLED=true AUTO_REFILL_AMOUNT=720