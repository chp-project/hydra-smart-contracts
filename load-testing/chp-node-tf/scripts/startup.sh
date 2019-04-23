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

git clone https://github.com/chainpoint/chainpoint-node-src.git && cd ./chainpoint-node-src
git checkout -b v2 origin/v2

curl "http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip" -H "Metadata-Flavor: Google" > /eip.txt

make init

# Start Hydra Utils to poll for a positive $TKN balance before it invokes `make register` on behalf of the Node
npm install -g load-testing-node-utils
export ETH_INFURA_API_KEY="ad8f210998704f9e89a37a4791d4702e" && hydra-chp-node-utils

# make register NODE_ETH_REWARDS_ADDRESS=$(</eth-address.txt) NODE_PUBLIC_IP_ADDRESS=$(</eip.txt) AUTO_REFILL_ENABLED=true AUTO_REFILL_AMOUNT=720