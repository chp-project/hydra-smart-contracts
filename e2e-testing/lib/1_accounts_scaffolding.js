const ethers = require('ethers');
const _ = require('lodash');
const chalk = require('chalk');
const provider = require('./utils/provider');

async function creditAccounts(tntAmount, accounts) {
  // Pull Contract Owner Address from accounts dictionary
  const owner = accounts[0];

  // Connect to Token Contract
  let tokenContract = new ethers.Contract(process.env[`${process.env.ETH_ENVIRONMENT}_TOKEN_CONTRACT_ADDRESS`], require('../../build/contracts/TierionNetworkToken.json').abi, owner);

  for (let i = 0; i < Object.keys(accounts).length; i++) {
    if (i === 0) continue;

    const element = Object.keys(accounts)[i];
    
    console.log(chalk.gray('-> Transfering to: ' + accounts[i].address))
    let tx = await tokenContract.transfer(accounts[i].address, tntAmount);
    await tx.wait();

    _.set(accounts[i], 'e2eTesting.node.INITIAL_BALANCE_TRANSFER', true);
  }
  return accounts;
}

async function checkBalances(tntAmount, accounts) {
  // Connect to Token Contract
  let tokenContract = new ethers.Contract(process.env[`${process.env.ETH_ENVIRONMENT}_TOKEN_CONTRACT_ADDRESS`], require('../../build/contracts/TierionNetworkToken.json').abi, accounts[0]);
  // Check Owner balance first. Should be 1B TNT - (5000TNT * 9 Nodes)
  let ownerBalance = await tokenContract.balanceOf(accounts[0].address);
  _.set(accounts[0], 'e2eTesting.node.INITIAL_BALANCE_CHECK', parseInt(ownerBalance.toString(), 10) === (100000000000000000 - (tntAmount * 9)));

  for (let i = 0; i < Object.keys(accounts).length; i++) {
    if (i === 0) continue;

    console.log(chalk.gray('-> Checking balance: ' + accounts[i].address))
    let balance = await tokenContract.balanceOf(accounts[i].address);
    
    _.set(accounts[i], 'e2eTesting.node.INITIAL_BALANCE_CHECK', parseInt(balance.toString(), 10) === tntAmount);
  }
  return accounts;
}

async function approveAllowances(tntAmount, accounts) {
  // Iterate through accounts (skip Owner at index=0) and approve an allowance for the ChainpointRegistry contract
  for (let i = 1; i < Object.keys(accounts).length; i++) {
    let tokenContract = new ethers.Contract(process.env[`${process.env.ETH_ENVIRONMENT}_TOKEN_CONTRACT_ADDRESS`], require('../../build/contracts/TierionNetworkToken.json').abi, accounts[i]);

    console.log(chalk.gray('-> Approving Allowance: ' + accounts[i].address))
    let approval = await tokenContract.approve(process.env[`${process.env.ETH_ENVIRONMENT}_REGISTRY_CONTRACT_ADDRESS`], tntAmount);
    await approval.wait();

    _.set(accounts[i], 'e2eTesting.node.REGISTRY_ALLOWANCE_APPROVAL', true);
  }
  return accounts;
}

async function checkAllowances(tntAmount, accounts) {
  const TOKEN_CONTRACT_ADDRESS = process.env[`${process.env.ETH_ENVIRONMENT}_TOKEN_CONTRACT_ADDRESS`];
  const REGISTRY_CONTRACT_ADDRESS = process.env[`${process.env.ETH_ENVIRONMENT}_REGISTRY_CONTRACT_ADDRESS`];

  // Connect to Token Contract
  let tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, require('../../build/contracts/TierionNetworkToken.json').abi, accounts[0]);

  for (let i = 0; i < Object.keys(accounts).length; i++) {
    if (i === 0) continue;

    console.log(chalk.gray('-> Checking Allowance: ' + accounts[i].address))
    let allowance = await tokenContract.allowance(accounts[i].address, REGISTRY_CONTRACT_ADDRESS);
    
    _.set(accounts[i], 'e2eTesting.node.REGISTRY_ALLOWANCE_APPROVAL_CHECK', parseInt(allowance.toString(), 10) === tntAmount);
  }
  return accounts;
}

module.exports.creditAccounts = creditAccounts;
module.exports.checkBalances = checkBalances;
module.exports.approveAllowances = approveAllowances;
module.exports.checkAllowances = checkAllowances;