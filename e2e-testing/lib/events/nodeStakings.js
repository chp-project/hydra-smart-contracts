const path = require('path');
const fs = require('fs');
const ethers = require('ethers');
const Web3 = require('web3');
const _ = require('lodash');
const chalk = require('chalk');
const ipToInt = require("ip-to-int")
const provider = require('../utils/provider');
const accounts = require('../utils/accounts').accounts;

const TOKEN_CONTRACT_ADDRESS = process.env[`${process.env.ETH_ENVIRONMENT}_TOKEN_CONTRACT_ADDRESS`] || fs.readFileSync(`./contract-addresses/contract-addresses/${process.env.ETH_ENVIRONMENT.toLowerCase()}_token.txt`, 'utf8');
const REGISTRY_CONTRACT_ADDRESS = process.env[`${process.env.ETH_ENVIRONMENT}_REGISTRY_CONTRACT_ADDRESS`] || fs.readFileSync(`./contract-addresses/contract-addresses/${process.env.ETH_ENVIRONMENT.toLowerCase()}_registry.txt`, 'utf8');

const nodeStakedTopic = ethers.utils.id('NodeStaked(address,uint32,address,uint256,uint256)')
const nodeUnStakedTopic = ethers.utils.id('NodeUnStaked(address,uint32,uint256)')
const coreStakedTopic = ethers.utils.id('CoreStaked(address,uint32,bool,uint256,uint256)')
const coreUnStakedTopic = ethers.utils.id('CoreUnStaked(address,uint32,uint256)')

let registryInterface = new ethers.utils.Interface(require('../../../build/contracts/ChainpointRegistry.json').abi);

// NodeStaked(address,uint32,address,uint256,uint256)
// NodeUnStaked(address,uint32,uint256)
// CoreStaked(address,uint32,bool,uint256,uint256)
// CoreUnStaked(address,uint32,uint256)

async function getTransactionsSinceAsync(lastKnownTxInfo = {blockNumber: 0}, topics) {
  let results = []

  let txs = await provider.getLogs({
    address: REGISTRY_CONTRACT_ADDRESS,
    fromBlock: 0,
    topics
  })
  results.push(...txs)

  return results;
}

(async function main() {
  let activeNodes = {}

  let stakings = await getTransactionsSinceAsync(undefined, [nodeStakedTopic])
  let stakingsTransformed = stakings.map(currVal => {
    let event = registryInterface.parseLog(currVal)
    return {
      sender: event.values['0'],
      ip: event.values['1'],
      isHealthy: event.values['2'],
      amountStaked: parseInt(event.values['3'].toString(), 10),
      duration: parseInt(event.values['4'].toString(), 10),
    }
  })
  // Iterate through stakings and increment value +1 for each ETH Address
  stakingsTransformed.forEach((currVal) => {
    if(activeNodes[currVal.sender] === undefined) {
      activeNodes[currVal.sender] = {staked: 1, ip: ipToInt(currVal.ip).toIP()}
    } else {
      activeNodes[currVal.sender].staked += 1
    }
  })

  let unStakings = await getTransactionsSinceAsync(undefined, [nodeUnStakedTopic])
  let unStakingsTransformed = unStakings.map(currVal => {
    let event = registryInterface.parseLog(currVal)
    return {
      sender: event.values['0'],
      ip: parseInt(event.values['1'].toString(), 10),
      amountStaked: parseInt(event.values['2'].toString(), 10),
    }
  })
  // Iterate through Un-Stakings and decrement value -1 for each ETH Address
  unStakingsTransformed.forEach((currVal) => {
    if(activeNodes[currVal.sender] === undefined) {
      activeNodes[currVal.sender] = {staked: 0, ip: ipToInt(currVal.ip).toIP()}
    } else {
      activeNodes[currVal.sender].staked -= 1
    }
  })
  
  console.log('====================================');
  console.log(activeNodes);
  console.log('====================================');

})()