const path = require('path');
const fs = require('fs');
const ethers = require('ethers');
const _ = require('lodash');
const R = require('ramda')
const chalk = require('chalk');
const ipToInt = require('ip-to-int')
const validator = require('validator')
const provider = require('./utils/provider');

const TOKEN_CONTRACT_ADDRESS = process.env[`${process.env.ETH_ENVIRONMENT}_TOKEN_CONTRACT_ADDRESS`] || fs.readFileSync(`./contract-addresses/contract-addresses/${process.env.ETH_ENVIRONMENT.toLowerCase()}_token.txt`, 'utf8');
const REGISTRY_CONTRACT_ADDRESS = process.env[`${process.env.ETH_ENVIRONMENT}_REGISTRY_CONTRACT_ADDRESS`] || fs.readFileSync(`./contract-addresses/contract-addresses/${process.env.ETH_ENVIRONMENT.toLowerCase()}_registry.txt`, 'utf8');

async function stakeNodes(accounts) {
  for (let i = 0; i < Object.keys(accounts).length; i++) {
    if (i === 0) continue;
    
    console.log(chalk.gray('-> Staking Node: ' + accounts[i].address));
    let registryContract = new ethers.Contract(REGISTRY_CONTRACT_ADDRESS, require('../../build/contracts/ChainpointRegistry.json').abi, accounts[i]);
    
    let stakeResult = await registryContract.stake(
      ipToInt(`${Math.floor(Math.random() * 254)}.${Math.floor(Math.random() * 254)}.${Math.floor(Math.random() * 254)}.${Math.floor(Math.random() * 254)}`).toInt(),
      accounts[i].address
    );
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
    let expectedNodeValues = (() => {
      return {
        isStaked: (checkType === 'CHECK_STAKE' || checkType === 'CHECK_STAKE_UPDATED') ? R.thunkify(R.identity)(true) : R.thunkify(R.identity)(false),
        ip: (checkType === 'CHECK_STAKE' || checkType === 'CHECK_STAKE_UPDATED') ? R.pipe((i) => ipToInt(i).toIP(), (i) => validator.isIP(i)) : R.thunkify(R.identity)(0),
        rewardsAddr: (checkType === 'CHECK_STAKE' || checkType === 'CHECK_STAKE_UPDATED') ? R.thunkify(R.identity)(accounts[i].address) : R.thunkify(R.identity)("0x0000000000000000000000000000000000000000000000000000000000000000")
      }
    })();

    _.set(
      accounts[i],
      `e2eTesting.node.${checkType}`, 
      _.merge(
        _.get(accounts[i], `e2eTesting.node.${checkType}`, {}),
        { passed: (stakeResult.isStaked === expectedNodeValues.isStaked() && expectedNodeValues.ip(stakeResult.nodeIp) === true, gasUsed: 0 }
      )
    );

    debugger;
  }
  return accounts;
}

async function updateStakesNodes(accounts) {
  for (let i = 0; i < Object.keys(accounts).length; i++) {
    if (i === 0) continue;

    console.log(chalk.gray('-> Updating Node Stake: ' + accounts[i].address));
    let registryContract = new ethers.Contract(REGISTRY_CONTRACT_ADDRESS, require('../../build/contracts/ChainpointRegistry.json').abi, accounts[i]);

    let update = await registryContract.updateStake(
      ipToInt(`${Math.floor(Math.random() * 254)}.${Math.floor(Math.random() * 254)}.${Math.floor(Math.random() * 254)}.${Math.floor(Math.random() * 254)}`).toInt()
    );
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