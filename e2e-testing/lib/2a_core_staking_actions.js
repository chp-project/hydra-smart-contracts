const ethers = require('ethers');
const _ = require('lodash');
const chalk = require('chalk');
const provider = require('./utils/provider');

const TOKEN_CONTRACT_ADDRESS = process.env[`${process.env.ETH_ENVIRONMENT}_TOKEN_CONTRACT_ADDRESS`];
const REGISTRY_CONTRACT_ADDRESS = process.env[`${process.env.ETH_ENVIRONMENT}_REGISTRY_CONTRACT_ADDRESS`];

async function stakeCores(accounts) {
  for (let i = 0; i < Object.keys(accounts).length; i++) {
    if (i === 0) continue;
    
    console.log(chalk.gray('-> Staking Core: ' + accounts[i].address));
    let registryContract = new ethers.Contract(REGISTRY_CONTRACT_ADDRESS, require('../../build/contracts/ChainpointRegistry.json').abi, accounts[i]);
    
    let stakeResult = await registryContract.stakeCore("0x48656c6c6f20576f726c64210000000000000000000000000000000000000000", "0x48656c6c6f20576f726c64210000000000000000000000000000000000000000");
    await stakeResult.wait();

    _.set(accounts[i], 'e2eTesting.core.STAKE', true);
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
      if (checkType === 'CHECK_STAKE') return [true, '0x48656c6c6f20576f726c64210000000000000000000000000000000000000000'];
      else if (checkType === 'CHECK_STAKE_UPDATED') return [true, ethers.utils.formatBytes32String(`${i}`)];
      else return [false, "0x0000000000000000000000000000000000000000000000000000000000000000"]
    })();

    _.set(
      accounts[i],
      `e2eTesting.core.${checkType}`, 
      (stakeResult.isStaked === expectedCoreValues[0] && _.isEqual(stakeResult.coreIp, expectedCoreValues[1]) && _.isEqual(stakeResult.corePublicKey, expectedCoreValues[1]))
    );
  }
  return accounts;
}

async function updateStakesCores(accounts) {
  for (let i = 0; i < Object.keys(accounts).length; i++) {
    if (i === 0) continue;

    console.log(chalk.gray('-> Updating Core Stake: ' + accounts[i].address));
    let registryContract = new ethers.Contract(REGISTRY_CONTRACT_ADDRESS, require('../../build/contracts/ChainpointRegistry.json').abi, accounts[i]);

    let update = await registryContract.updateStakeCore(ethers.utils.formatBytes32String(`${i}`), ethers.utils.formatBytes32String(`${i}`));
    await update.wait();

    _.set(accounts[i], 'e2eTesting.core.UPDATED_STAKE', true);
  }
  return accounts;
}

async function unStakeCores(accounts) {
  for (let i = 0; i < Object.keys(accounts).length; i++) {
    if (i === 0) continue;

    console.log(chalk.gray('-> Un-staking Core: ' + accounts[i].address));
    let registryContract = new ethers.Contract(REGISTRY_CONTRACT_ADDRESS, require('../../build/contracts/ChainpointRegistry.json').abi, accounts[i]);

    let update = await registryContract.unStakeCore();
    await update.wait();

    _.set(accounts[i], 'e2eTesting.core.UN_STAKE', true);
  }
  return accounts;
}

module.exports.stakeCores = stakeCores;
module.exports.checkCoreStakings = checkCoreStakings;
module.exports.updateStakesCores = updateStakesCores;
module.exports.unStakeNodes = unStakeCores;