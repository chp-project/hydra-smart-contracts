const path = require('path');
const fs = require('fs');
const ethers = require('ethers');
const _ = require('lodash');
const chalk = require('chalk');
const ipToInt = require("ip-to-int")
const provider = require('./utils/provider');

const TOKEN_CONTRACT_ADDRESS = process.env[`${process.env.ETH_ENVIRONMENT}_TOKEN_CONTRACT_ADDRESS`] || fs.readFileSync(`./contract-addresses/contract-addresses/${process.env.ETH_ENVIRONMENT.toLowerCase()}_token.txt`, 'utf8');
const REGISTRY_CONTRACT_ADDRESS = process.env[`${process.env.ETH_ENVIRONMENT}_REGISTRY_CONTRACT_ADDRESS`] || fs.readFileSync(`./contract-addresses/contract-addresses/${process.env.ETH_ENVIRONMENT.toLowerCase()}_registry.txt`, 'utf8');

async function stakeCores(accounts) {
  for (let i = 0; i < Object.keys(accounts).length; i++) {
    if (i === 0) continue;
    
    console.log(chalk.gray('-> Staking Core: ' + accounts[i].address));
    let registryContract = new ethers.Contract(REGISTRY_CONTRACT_ADDRESS, require('../../build/contracts/ChainpointRegistry.json').abi, accounts[i]);
    
    let stakeResult = await registryContract.stakeCore(ipToInt((accounts[i].metadata && accounts[i].metadata.ip) ? accounts[i].metadata.ip : `56.0.0.${i}`).toInt());
    await stakeResult.wait();

    let txReceipt = await provider.getTransactionReceipt(stakeResult.hash);

    _.set(
      accounts[i], 
      'e2eTesting.core.STAKE', 
      _.merge(_.get(accounts[i], 'e2eTesting.core.STAKE', {}), { passed: true, gasUsed: txReceipt.gasUsed.toString() })
    );
  }
  return accounts;
}

async function checkCoreStakings(checkType, accounts) {
  let registryContract = new ethers.Contract(REGISTRY_CONTRACT_ADDRESS, require('../../build/contracts/ChainpointRegistry.json').abi, accounts[0]);

  for (let i = 0; i < Object.keys(accounts).length; i++) {
    if (i === 0) continue;
    
    console.log(chalk.gray('-> Checking Staked Core: ' + accounts[i].address));
    let stakeResult = await registryContract.cores(accounts[i].address);
    let expectedCoreValues = (function() {
      if (checkType === 'CHECK_STAKE') return [true, ipToInt(`172.168.0.${i}`).toInt()]; // i === 172.168.0.x
      else if (checkType === 'CHECK_STAKE_UPDATED') return [true, ipToInt(`11.0.0.${i}`).toInt()]; // i === 11.0.0.x
      else return [false, "0x0000000000000000000000000000000000000000000000000000000000000000"]
    })();

    _.set(
      accounts[i],
      `e2eTesting.core.${checkType}`,
      _.merge(_.get(accounts[i], `e2eTesting.core.${checkType}`, {}), { passed: (stakeResult.isStaked === expectedCoreValues[0] && _.isEqual(stakeResult.coreIp, expectedCoreValues[1]) && _.isEqual(stakeResult.corePublicKey, expectedCoreValues[1])), gasUsed: 0 })
    );
  }
  return accounts;
}

async function updateStakesCores(accounts) {
  for (let i = 0; i < Object.keys(accounts).length; i++) {
    if (i === 0) continue;

    console.log(chalk.gray('-> Updating Core Stake: ' + accounts[i].address));
    let registryContract = new ethers.Contract(REGISTRY_CONTRACT_ADDRESS, require('../../build/contracts/ChainpointRegistry.json').abi, accounts[i]);

    let update = await registryContract.updateStakeCore(ipToInt(`11.0.0.${i}`).toInt()); // i === 11.0.0.x
    await update.wait();

    let txReceipt = await provider.getTransactionReceipt(update.hash);

    _.set(
      accounts[i], 
      'e2eTesting.core.UPDATED_STAKE', 
      _.merge(_.get(accounts[i], 'e2eTesting.core.UPDATED_STAKE', {}), { passed: true, gasUsed: txReceipt.gasUsed.toString() })
    );
  }
  return accounts;
}

async function unStakeCores(accounts) {
  for (let i = 0; i < Object.keys(accounts).length; i++) {
    if (i === 0) continue;

    console.log(chalk.gray('-> Un-staking Core: ' + accounts[i].address));
    let registryContract = new ethers.Contract(REGISTRY_CONTRACT_ADDRESS, require('../../build/contracts/ChainpointRegistry.json').abi, accounts[i]);

    let unstake = await registryContract.unStakeCore();
    await unstake.wait();

    let txReceipt = await provider.getTransactionReceipt(unstake.hash);

    _.set(
      accounts[i], 
      'e2eTesting.core.UN_STAKE', 
      _.merge(_.get(accounts[i], 'e2eTesting.core.UN_STAKE', {}), { passed: true, gasUsed: txReceipt.gasUsed.toString() })
    );
  }
  return accounts;
}

module.exports.stakeCores = stakeCores;
module.exports.checkCoreStakings = checkCoreStakings;
module.exports.updateStakesCores = updateStakesCores;
module.exports.unStakeCores = unStakeCores;