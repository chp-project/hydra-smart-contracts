const ethers = require('ethers');
const _ = require('lodash');
const chalk = require('chalk');
const provider = require('./utils/provider');

const TOKEN_CONTRACT_ADDRESS = process.env[`${process.env.ETH_ENVIRONMENT}_TOKEN_CONTRACT_ADDRESS`];
const REGISTRY_CONTRACT_ADDRESS = process.env[`${process.env.ETH_ENVIRONMENT}_REGISTRY_CONTRACT_ADDRESS`];

async function stakeNodes(accounts) {
  for (let i = 0; i < Object.keys(accounts).length; i++) {
    if (i === 0) continue;
    
    console.log(chalk.gray('-> Staking Node: ' + accounts[i].address));
    let registryContract = new ethers.Contract(REGISTRY_CONTRACT_ADDRESS, require('../../build/contracts/ChainpointRegistry.json').abi, accounts[i]);
    
    let stakeResult = await registryContract.stake("0x48656c6c6f20576f726c64210000000000000000000000000000000000000000", "0x48656c6c6f20576f726c64210000000000000000000000000000000000000000");
    await stakeResult.wait();

    _.set(accounts[i], 'e2eTesting.node.STAKE', true);
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
      if (checkType === 'CHECK_STAKE') return [true, '0x48656c6c6f20576f726c64210000000000000000000000000000000000000000'];
      else if (checkType === 'CHECK_STAKE_UPDATED') return [true, ethers.utils.formatBytes32String(`${i}`)];
      else return [false, "0x0000000000000000000000000000000000000000000000000000000000000000"]
    })();

    _.set(
      accounts[i],
      `e2eTesting.node.${checkType}`, 
      (stakeResult.isStaked === expectedNodeValues[0] && _.isEqual(stakeResult.nodeIp, expectedNodeValues[1]) && _.isEqual(stakeResult.nodePublicKey, expectedNodeValues[1]))
    );
  }
  return accounts;
}

async function updateStakesNodes(accounts) {
  for (let i = 0; i < Object.keys(accounts).length; i++) {
    if (i === 0) continue;

    console.log(chalk.gray('-> Updating Node Stake: ' + accounts[i].address));
    let registryContract = new ethers.Contract(REGISTRY_CONTRACT_ADDRESS, require('../../build/contracts/ChainpointRegistry.json').abi, accounts[i]);

    let update = await registryContract.updateStake(ethers.utils.formatBytes32String(`${i}`), ethers.utils.formatBytes32String(`${i}`));
    await update.wait();

    _.set(accounts[i], 'e2eTesting.node.UPDATED_STAKE', true);
  }
  return accounts;
}

async function unStakeNodes(accounts) {
  for (let i = 0; i < Object.keys(accounts).length; i++) {
    if (i === 0) continue;

    console.log(chalk.gray('-> Un-staking Node: ' + accounts[i].address));
    let registryContract = new ethers.Contract(REGISTRY_CONTRACT_ADDRESS, require('../../build/contracts/ChainpointRegistry.json').abi, accounts[i]);

    let update = await registryContract.unStake();
    await update.wait();

    _.set(accounts[i], 'e2eTesting.node.UN_STAKE', true);
  }
  return accounts;
}

module.exports.stakeNodes = stakeNodes;
module.exports.checkNodeStakings = checkNodeStakings;
module.exports.updateStakesNodes = updateStakesNodes;
module.exports.unStakeNodes = unStakeNodes;