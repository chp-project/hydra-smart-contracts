const path = require('path');
const fs = require('fs');
const ethers = require('ethers');
const _ = require('lodash');
const chalk = require('chalk');
const ipToInt = require("ip-to-int")
const provider = require('./utils/provider');

const TOKEN_CONTRACT_ADDRESS = process.env[`${process.env.ETH_ENVIRONMENT}_TOKEN_CONTRACT_ADDRESS`] || fs.readFileSync(`./contract-addresses/contract-addresses/${process.env.ETH_ENVIRONMENT.toLowerCase()}_token.txt`, 'utf8');
const REGISTRY_CONTRACT_ADDRESS = process.env[`${process.env.ETH_ENVIRONMENT}_REGISTRY_CONTRACT_ADDRESS`] || fs.readFileSync(`./contract-addresses/contract-addresses/${process.env.ETH_ENVIRONMENT.toLowerCase()}_registry.txt`, 'utf8');

async function stakeNodes(accounts) {
  for (let i = 0; i < Object.keys(accounts).length; i++) {
    if (i === 0) continue;
    
    console.log(chalk.gray('-> Staking Node: ' + accounts[i].address));
    let registryContract = new ethers.Contract(REGISTRY_CONTRACT_ADDRESS, require('../../build/contracts/ChainpointRegistry.json').abi, accounts[i]);
    
    let stakeResult = await registryContract.stake(ipToInt(`192.168.0.${i}`).toInt(), "0x48656c6c6f20576f726c64210000000000000000000000000000000000000000");
    await stakeResult.wait();

    let txReceipt = await provider.getTransactionReceipt(stakeResult.hash);

    _.set(
      accounts[i], 
      'e2eTesting.node.STAKE', 
      _.merge(_.get(accounts[i], 'e2eTesting.node.STAKE', {}), { passed: true, gasUsed: txReceipt.gasUsed.toString() })
    );
  }
  return accounts;
}

async function checkNodeStakings(checkType, accounts) {
  let registryContract = new ethers.Contract(REGISTRY_CONTRACT_ADDRESS, require('../../build/contracts/ChainpointRegistry.json').abi, accounts[0]);

  for (let i = 0; i < Object.keys(accounts).length; i++) {
    if (i === 0) continue;
    
    console.log(chalk.gray('-> Checking Staked Node: ' + accounts[i].address));
    let stakeResult = await registryContract.nodes(accounts[i].address);
    let expectedNodeValues = (function() {
      if (checkType === 'CHECK_STAKE') return [true, ipToInt(`192.168.0.${i}`).toInt()]; // i === 192.168.0.x
      else if (checkType === 'CHECK_STAKE_UPDATED') return [true, ipToInt(`10.0.0.${i}`).toInt()]; // i === 10.0.0.x
      else return [false, "0x0000000000000000000000000000000000000000000000000000000000000000"]
    })();

    _.set(
      accounts[i],
      `e2eTesting.node.${checkType}`, 
      _.merge(_.get(accounts[i], `e2eTesting.node.${checkType}`, {}), { passed: (stakeResult.isStaked === expectedNodeValues[0] && _.isEqual(stakeResult.nodeIp, expectedNodeValues[1]) && _.isEqual(stakeResult.nodePublicKey, expectedNodeValues[1])), gasUsed: 0 })
    );
  }
  return accounts;
}

async function updateStakesNodes(accounts) {
  for (let i = 0; i < Object.keys(accounts).length; i++) {
    if (i === 0) continue;

    console.log(chalk.gray('-> Updating Node Stake: ' + accounts[i].address));
    let registryContract = new ethers.Contract(REGISTRY_CONTRACT_ADDRESS, require('../../build/contracts/ChainpointRegistry.json').abi, accounts[i]);

    let update = await registryContract.updateStake(ipToInt(`10.0.0.${i}`).toInt()); // i === 10.0.0.x
    await update.wait();

    let txReceipt = await provider.getTransactionReceipt(update.hash);

    _.set(
      accounts[i], 
      'e2eTesting.node.UPDATED_STAKE', 
      _.merge(_.get(accounts[i], 'e2eTesting.node.UPDATED_STAKE', {}), { passed: true, gasUsed: txReceipt.gasUsed.toString() })
    );
  }
  return accounts;
}

async function unStakeNodes(accounts) {
  for (let i = 0; i < Object.keys(accounts).length; i++) {
    if (i === 0) continue;

    console.log(chalk.gray('-> Un-staking Node: ' + accounts[i].address));
    let registryContract = new ethers.Contract(REGISTRY_CONTRACT_ADDRESS, require('../../build/contracts/ChainpointRegistry.json').abi, accounts[i]);

    let unstake = await registryContract.unStake();
    await unstake.wait();

    let txReceipt = await provider.getTransactionReceipt(unstake.hash);

    _.set(
      accounts[i], 
      'e2eTesting.node.UN_STAKE', 
      _.merge(_.get(accounts[i], 'e2eTesting.node.UN_STAKE', {}), { passed: true, gasUsed: txReceipt.gasUsed.toString() })
    );
  }
  return accounts;
}

module.exports.stakeNodes = stakeNodes;
module.exports.checkNodeStakings = checkNodeStakings;
module.exports.updateStakesNodes = updateStakesNodes;
module.exports.unStakeNodes = unStakeNodes;