
const path = require('path');
const fs = require('fs');
const ethers = require('ethers');
const Web3 = require('web3')
const _ = require('lodash');
const chalk = require('chalk');
const async = require('async')
const provider = require('./utils/provider');
const accounts = require('./utils/accounts').accounts;

const OLD_TOKEN_CONTRACT_ADDRESS = process.env[`${process.env.ETH_ENVIRONMENT}_OLD_TOKEN_CONTRACT_ADDRESS`] || fs.readFileSync(`./contract-addresses/contract-addresses/${process.env.ETH_ENVIRONMENT.toLowerCase()}_old_token.txt`, 'utf8');
const TOKEN_CONTRACT_ADDRESS = process.env[`${process.env.ETH_ENVIRONMENT}_TOKEN_CONTRACT_ADDRESS`] || fs.readFileSync(`./contract-addresses/contract-addresses/${process.env.ETH_ENVIRONMENT.toLowerCase()}_token.txt`, 'utf8');
const REGISTRY_CONTRACT_ADDRESS = process.env[`${process.env.ETH_ENVIRONMENT}_REGISTRY_CONTRACT_ADDRESS`] || fs.readFileSync(`./contract-addresses/contract-addresses/${process.env.ETH_ENVIRONMENT.toLowerCase()}_registry.txt`, 'utf8');
const MIGRATION_CONTRACT_ADDRESS = process.env[`${process.env.ETH_ENVIRONMENT}_MIGRATION_CONTRACT_ADDRESS`] || fs.readFileSync(`./contract-addresses/contract-addresses/${process.env.ETH_ENVIRONMENT.toLowerCase()}_migration.txt`, 'utf8');
const TierionNetworkTokenABI = require('../../build/contracts/TierionNetworkToken.json').abi

const web3 = new Web3(new Web3.providers.HttpProvider(`https://ropsten.infura.io/v3/foobar`))
const tokenContract = web3.eth.Contract(TierionNetworkTokenABI, TOKEN_CONTRACT_ADDRESS)

let ETH_TRANSFER_NONCE_COUNTER = 0

async function creditAccounts(tknContract, tntAmount, accounts) {
  // Pull Contract Owner Address from accounts dictionary
  const owner = accounts[0];

  // Connect to Token Contract
  let tokenContract = new ethers.Contract((tknContract === 'TNT') ? OLD_TOKEN_CONTRACT_ADDRESS : TOKEN_CONTRACT_ADDRESS, require(`../../build/contracts/${(tknContract === 'TNT') ? 'OldTNT' : 'TierionNetworkToken'}.json`).abi, accounts[0]);

  for (let i = 0; i < Object.keys(accounts).length; i++) {
    if (i === 0) continue;

    const element = Object.keys(accounts)[i];
    
    console.log(chalk.gray('-> Transfering to: ' + accounts[i].address))
    let tx = await tokenContract.transfer(accounts[i].address, tntAmount);
    await tx.wait();

    let txReceipt = await provider.getTransactionReceipt(tx.hash);

    _.set(
      accounts[i], 
      'e2eTesting.node.INITIAL_BALANCE_TRANSFER',
      _.merge(_.get(accounts[i], 'e2eTesting.node.INITIAL_BALANCE_TRANSFER', {}), { passed: true, gasUsed: txReceipt.gasUsed.toString() })
    );
  }
  return accounts;
}

async function creditAccountsAsync(tntAmount, accounts) {
  const owner = accounts[0]
  const txs = []
  const gasPrice = await provider.getGasPrice();
  const gasLimit = 185000;
  let nonce = await provider.getTransactionCount(owner.address)

  for (let i = 0; i < Object.keys(accounts).length; i++) {
    if (i === 0) continue;

    console.log(chalk.gray('-> Transfering to: ' + accounts[i].address))

    const funcSigEncoded = tokenContract.methods.transfer(accounts[i].address, tntAmount).encodeABI()
    let txData = {
      gasLimit: gasLimit,
      gasPrice: (gasPrice * 2) - ETH_TRANSFER_NONCE_COUNTER,
      to: TOKEN_CONTRACT_ADDRESS,
      data: funcSigEncoded,
      nonce: nonce + ETH_TRANSFER_NONCE_COUNTER,
      chainId: 3,
    }
    txs.push(txData)

    debugger
    
    // Increment ETH_TRANSFER_NONCE_COUNTER to get fresh nonce
    ETH_TRANSFER_NONCE_COUNTER++
  }

  return new Promise((resolve, reject) => {
    async.parallel(
      txs.map(currVal => {
        return (cb) => {
          owner.sendTransaction(currVal).then(res => {
            provider.waitForTransaction(res.hash)
              .then(() => cb(null, res))
              .catch(err => cb(err, null))
          })
        }
      }),
      function (err, results) {
        if(err) reject(err)
        else resolve(results)
      }
    )
  })
}

async function creditAccountsEth(amount, accounts) {
  // Pull Contract Owner Address from accounts dictionary
  const owner = accounts[0];

  let gasPrice = await provider.getGasPrice();
  let gasLimit = 21000; // The exact cost (in gas) to send to an Externally Owned Account (EOA)
  let value = ethers.utils.parseEther(amount)

  for (let i = 0; i < Object.keys(accounts).length; i++) {
    if (i === 0) continue;

    let nonce = await provider.getTransactionCount(owner.address)
    nonce += ETH_TRANSFER_NONCE_COUNTER
    // Increment ETH_TRANSFER_NONCE_COUNTER to get fresh nonce
    ETH_TRANSFER_NONCE_COUNTER++

    // Owner will transfer ETH to account[i]
    console.log(chalk.gray('-> Transfering ETH to: ' + accounts[i].address), `nonce=${nonce}`)
    let tx = await owner.sendTransaction({
        gasLimit: gasLimit,
        gasPrice: gasPrice,
        to: accounts[i].address,
        nonce,
        chainId: 3,
        value: value
    });
    await provider.waitForTransaction(tx.hash)

    _.set(
      accounts[i], 
      'e2eTesting.node.INITIAL_BALANCE_TRANSFER_ETH',
      _.merge(_.get(accounts[i], 'e2eTesting.node.INITIAL_BALANCE_TRANSFER_ETH', {}), { passed: true, gasUsed: gasLimit })
    );
  }

  return accounts;
}

async function creditAccountsEthAsync(amount, accounts) {
  const owner = accounts[0]
  const txs = []

  let gasPrice = await provider.getGasPrice();
  let gasLimit = 21000; // The exact cost (in gas) to send to an Externally Owned Account (EOA)
  let nonce = await provider.getTransactionCount(owner.address)
  let value = ethers.utils.parseEther(amount)

  for (let i = 0; i < Object.keys(accounts).length; i++) {
    if (i === 0) continue;

    console.log(chalk.gray('-> Transfering ETH to: ' + accounts[i].address))

    let txData = {
      gasLimit: gasLimit,
      gasPrice: (gasPrice * 2) - ETH_TRANSFER_NONCE_COUNTER,
      to: accounts[i].address,
      nonce: nonce + ETH_TRANSFER_NONCE_COUNTER,
      value,
      chainId: 3
    }
    txs.push(txData)

    debugger
    
    // Increment ETH_TRANSFER_NONCE_COUNTER to get fresh nonce
    ETH_TRANSFER_NONCE_COUNTER++
  }

  return new Promise((resolve, reject) => {
    async.parallel(
      txs.map(currVal => {
        return (cb) => {
          owner.sendTransaction(currVal).then(res => {
            provider.waitForTransaction(res.hash)
              .then(() => cb(null, res))
              .catch(err => cb(err, null))
          })
        }
      }),
      function (err, results) {
        if(err) reject(err)
        else resolve(results)
      }
    )
  })
}

async function checkBalances(tknContract, tntAmount, accounts) {
  // Connect to Token Contract (TNT for OLD_TNT or $TKN for new Token)
  let tokenContract = new ethers.Contract((tknContract === 'TNT') ? OLD_TOKEN_CONTRACT_ADDRESS : TOKEN_CONTRACT_ADDRESS, require(`../../build/contracts/${(tknContract === 'TNT') ? 'OldTNT' : 'TierionNetworkToken'}.json`).abi, accounts[0]);
  // Check Owner balance first. Should be 1B TNT - (5000TNT * 9 Nodes)
  let ownerBalance = await tokenContract.balanceOf(accounts[0].address);
  _.set(
    accounts[0], 
    'e2eTesting.node.INITIAL_BALANCE_CHECK',
    _.merge(_.get(accounts[0], 'e2eTesting.node.INITIAL_BALANCE_CHECK', {}), { passed: parseInt(ownerBalance.toString(), 10) === (100000000000000000 - (tntAmount * 9)), gasUsed: 0 })
  );

  for (let i = 0; i < Object.keys(accounts).length; i++) {
    if (i === 0) continue;

    console.log(chalk.gray('-> Checking balance: ' + accounts[i].address))
    let balance = await tokenContract.balanceOf(accounts[i].address);
    
    _.set(
      accounts[i], 
      'e2eTesting.node.INITIAL_BALANCE_CHECK', 
      _.merge(_.get(accounts[i], 'e2eTesting.node.INITIAL_BALANCE_CHECK', {}), { passed: parseInt(balance.toString(), 10) === tntAmount, gasUsed: 0 })
    );
  }
  return accounts;
}

async function approveAllowances(contract, tntAmount, accounts) {
  // Iterate through accounts (skip Owner at index=0) and approve an allowance for the ChainpointRegistry contract
  for (let i = 1; i < Object.keys(accounts).length; i++) {
    let tokenContract = new ethers.Contract((contract === 'registry') ? TOKEN_CONTRACT_ADDRESS : OLD_TOKEN_CONTRACT_ADDRESS, require('../../build/contracts/TierionNetworkToken.json').abi, accounts[i]);

    console.log(chalk.gray('-> Approving Allowance: ' + accounts[i].address))
    let approval = await tokenContract.approve(contract === 'registry' ? REGISTRY_CONTRACT_ADDRESS : MIGRATION_CONTRACT_ADDRESS, tntAmount);
    await approval.wait();

    let txReceipt = await provider.getTransactionReceipt(approval.hash);

    _.set(
      accounts[i], 
      `e2eTesting.node.${contract.toUpperCase()}_ALLOWANCE_APPROVAL`,
      _.merge(_.get(accounts[i], `e2eTesting.node.${contract.toUpperCase()}_ALLOWANCE_APPROVAL`, {}), { passed: true, gasUsed: txReceipt.gasUsed.toString() })
    );
  }
  return accounts;
}

async function checkAllowances(contract, tntAmount, accounts) {
  // Connect to Token Contract
  let tokenContract = new ethers.Contract((contract === 'registry') ? TOKEN_CONTRACT_ADDRESS : OLD_TOKEN_CONTRACT_ADDRESS, require('../../build/contracts/TierionNetworkToken.json').abi, accounts[0]);

  for (let i = 0; i < Object.keys(accounts).length; i++) {
    if (i === 0) continue;

    console.log(chalk.gray('-> Checking Allowance: ' + accounts[i].address))
    let allowance = await tokenContract.allowance(accounts[i].address, (contract === 'registry') ? REGISTRY_CONTRACT_ADDRESS : MIGRATION_CONTRACT_ADDRESS);
    
    _.set(
      accounts[i], 
      `e2eTesting.node.${contract.toUpperCase()}_ALLOWANCE_APPROVAL_CHECK`,
      _.merge(_.get(accounts[i], `e2eTesting.node.${contract.toUpperCase()}_ALLOWANCE_APPROVAL_CHECK`, {}), { passed: parseInt(allowance.toString(), 10) === tntAmount, gasUsed: 0 })      
    );
  }
  return accounts;
}

module.exports.creditAccounts = creditAccounts;
module.exports.creditAccountsAsync = creditAccountsAsync;
module.exports.creditAccountsEth = creditAccountsEth;
module.exports.creditAccountsEthAsync = creditAccountsEthAsync;
module.exports.checkBalances = checkBalances;
module.exports.approveAllowances = approveAllowances;
module.exports.checkAllowances = checkAllowances;