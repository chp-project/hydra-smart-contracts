const path = require('path');
const fs = require('fs');
const ethers = require('ethers');
const Web3 = require('web3');
const _ = require('lodash');
const chalk = require('chalk');
const ipToInt = require("ip-to-int")
const provider = require('./utils/provider');

const web3 = new Web3(provider)
const abiCoder = ethers.utils.defaultAbiCoder;

const TOKEN_CONTRACT_ADDRESS = process.env[`${process.env.ETH_ENVIRONMENT}_TOKEN_CONTRACT_ADDRESS`] || fs.readFileSync(`./contract-addresses/contract-addresses/${process.env.ETH_ENVIRONMENT.toLowerCase()}_token.txt`, 'utf8');
const REGISTRY_CONTRACT_ADDRESS = process.env[`${process.env.ETH_ENVIRONMENT}_REGISTRY_CONTRACT_ADDRESS`] || fs.readFileSync(`./contract-addresses/contract-addresses/${process.env.ETH_ENVIRONMENT.toLowerCase()}_registry.txt`, 'utf8');

async function approveCores(accounts) {
  const owner = accounts[0];

  for (let i = 0; i < Object.keys(accounts).length; i++) {
    if (i === 0) continue;
    
    console.log(chalk.gray('-> Approving Core: ' + accounts[i].address));
    let registryContract = new ethers.Contract(REGISTRY_CONTRACT_ADDRESS, require('../../build/contracts/ChainpointRegistry.json').abi, owner);
    
    let approveResult = await registryContract.approveCoreStaking(
      accounts[i].address,
      "0x0000000000000000000000000000000000000000000000000000000000000000",
      (new Array(126)).fill("0x")
    );
    await approveResult.wait();

    let txReceipt = await provider.getTransactionReceipt(approveResult.hash);

    _.set(
      accounts[i], 
      'e2eTesting.core.APPROVE_CORE', 
      _.merge(_.get(accounts[i], 'e2eTesting.core.APPROVE_CORE', {}), { passed: true, gasUsed: txReceipt.gasUsed.toString() })
    );
  }

  return accounts;
}

async function approveCoresMultiSig(accounts) {
  const owner = accounts[0];
  const leader = accounts[1];

  let registryContract = new ethers.Contract(REGISTRY_CONTRACT_ADDRESS, require('../../build/contracts/ChainpointRegistry.json').abi, leader);
  // registryContract.on("CoreApproval", (a, b, event) => {

  //   console.log('====================================');
  //   console.log(a.toString(), b.toString());
  //   console.log('====================================');
  // });
  console.log(chalk.gray('-> Approving Core (Multi-sig): ' + owner.address));

  let sigs = [];
  let coreCandidateHash = ethers.utils.keccak256(owner.address);
  let messageHash;
  for (let i = 2; i < Object.keys(accounts).length; i++) { // Starting at i=2 because accounts[0] is contract owner & accounts[1] is elected leader
  
    let web3Owner = web3.eth.accounts.privateKeyToAccount(accounts[i].privateKey);
    let signature = await web3Owner.sign(coreCandidateHash);

    if (!messageHash) { messageHash = signature.messageHash }

    sigs.push(signature.signature);
  }

  try {
    let mintResult = await registryContract.approveCoreStaking(
      owner.address,
      messageHash,
      sigs.splice(0,2).concat((new Array(124)).fill("0x"))
    );
    await mintResult.wait();
  
    let txReceipt = await provider.getTransactionReceipt(mintResult.hash);
    debugger;
  
    _.set(
      owner, 
      'e2eTesting.core.CORE_APPROVAL_MULTISIG', 
      _.merge(_.get(owner, 'e2eTesting.core.CORE_APPROVAL_MULTISIG', {}), { passed: true, gasUsed: txReceipt.gasUsed.toString() })
    );
  } catch (error) {
    console.error(error)
  }
  
  return accounts;
}

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
      else return [false, 0]
    })();

    _.set(
      accounts[i],
      `e2eTesting.core.${checkType}`,
      _.merge(_.get(accounts[i], `e2eTesting.core.${checkType}`, {}), { passed: (stakeResult.isStaked === expectedCoreValues[0] && _.isEqual(stakeResult.coreIp, expectedCoreValues[1])), gasUsed: 0 })
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

module.exports.approveCores = approveCores;
module.exports.approveCoresMultiSig = approveCoresMultiSig;
module.exports.stakeCores = stakeCores;
module.exports.checkCoreStakings = checkCoreStakings;
module.exports.updateStakesCores = updateStakesCores;
module.exports.unStakeCores = unStakeCores;