#!/bin/bash

export HOME=/root

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

# Install Stackdriver Agent
curl -sSO https://dl.google.com/cloudagents/install-monitoring-agent.sh
sudo bash install-monitoring-agent.sh

cd /srv
sudo mkdir chp

cd ./chp

sudo git clone https://github.com/chainpoint/chainpoint-node-src.git
sudo chmod 775 chainpoint-node-src
cd ./chainpoint-node-src
git checkout -b v2 origin/v2

git submodule add https://michael-iglesias:faca2c20b50c456892f3b6a601ae457d7a49ff10@github.com/chainpoint/go-hydra-smart-contract-files.git artifacts/ethcontracts

curl "http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip" -H "Metadata-Flavor: Google" > eip.txt

make init

make build-rocksdb

echo CHAINPOINT_CORE_CONNECT_IP_LIST=35.245.211.97,35.245.9.90,35.188.238.186 >> .env
echo NODE_ENV=development >> .env
echo NETWORK=testnet >> .env


make deploy

curl -X POST \
  https://us-central1-tierion-iglesias.cloudfunctions.net/eth-address-init-stream-processor \
  -H 'Content-Type: application/json' \
  -H 'Postman-Token: 127b5e92-b8fd-4fd0-b6f9-3a58f9d0c0d9' \
  -H 'cache-control: no-cache' \
  -d "{
	\"ethAddress\": \"$(<eth-address.txt)\"
}"

# Start Hydra Utils to poll for a positive $TKN balance before it invokes `make register` on behalf of the Node
npm install -g load-testing-node-utils
export ETH_INFURA_API_KEY="ad8f210998704f9e89a37a4791d4702e" && hydra-chp-node-utils

# make register NODE_ETH_REWARDS_ADDRESS=$(<eth-address.txt) NODE_PUBLIC_IP_ADDRESS=$(<eip.txt) AUTO_REFILL_ENABLED=true AUTO_REFILL_AMOUNT=720

export COMPOSE_INTERACTIVE_NO_CLI=1 && docker exec `docker ps -q` bash -c "source cli/scripts/env_secrets_expand.sh && node cli/register.js NODE_ETH_REWARDS_ADDRESS=$(<eth-address.txt) NODE_PUBLIC_IP_ADDRESS=$(<eip.txt) AUTO_REFILL_ENABLED=true AUTO_REFILL_AMOUNT=720"