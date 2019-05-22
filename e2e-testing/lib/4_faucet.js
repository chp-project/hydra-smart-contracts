const path = require('path');
const fs = require('fs');
const ethers = require('ethers');
const Web3 = require('web3');
const _ = require('lodash');
const chalk = require('chalk');
const provider = require('./utils/provider');
const accounts = require('./utils/accounts');

const web3 = new Web3(provider)
const abiCoder = ethers.utils.defaultAbiCoder;

const TOKEN_CONTRACT_ADDRESS = process.env[`${process.env.ETH_ENVIRONMENT}_TOKEN_CONTRACT_ADDRESS`] || fs.readFileSync(`./contract-addresses/contract-addresses/${process.env.ETH_ENVIRONMENT.toLowerCase()}_token.txt`, 'utf8');
const FAUCET_CONTRACT_ADDRESS = process.env[`${process.env.ETH_ENVIRONMENT}_FAUCET_CONTRACT_ADDRESS`] || fs.readFileSync(`./contract-addresses/contract-addresses/${process.env.ETH_ENVIRONMENT.toLowerCase()}_faucet.txt`, 'utf8');

async function setToken(accounts) {
  const owner = accounts[0];

  let faucetContract = new ethers.Contract(process.env[`${process.env.ETH_ENVIRONMENT}_FAUCET_CONTRACT_ADDRESS`], require('../../build/contracts/ChainpointFaucet.json').abi, owner);

  console.log(chalk.gray('-> Setting $TKN contract address'));
  let faucetInit = await faucetContract.setToken(TOKEN_CONTRACT_ADDRESS);
  await faucetInit.wait();

  let txReceipt = await provider.getTransactionReceipt(faucetInit.hash);

  _.set(
    owner, 
    'e2eTesting.faucet.SET_$TKN_CONTRACT', 
    _.merge(_.get(owner, 'e2eTesting.faucet.TKN_CONTRACT', {}), { passed: true, gasUsed: txReceipt.gasUsed.toString() })
  );

  return accounts;
}

async function subscribe(accounts) {
  const owner = accounts[0];
  const subscriber = accounts[1];

  let faucetContract = new ethers.Contract(process.env[`${process.env.ETH_ENVIRONMENT}_FAUCET_CONTRACT_ADDRESS`], require('../../build/contracts/ChainpointFaucet.json').abi, subscriber);

  console.log(chalk.gray('-> Subscribing to Faucet Contract'));
  let result = await faucetContract.subscribe();
  await result.wait();

  let txReceipt = await provider.getTransactionReceipt(result.hash);

  _.set(
    subscriber, 
    'e2eTesting.faucet.SUBSCRIBE', 
    _.merge(_.get(subscriber, 'e2eTesting.faucet.SUBSCRIBE', {}), { passed: true, gasUsed: txReceipt.gasUsed.toString() })
  );

  return accounts;
}

async function subscribeThrow(accounts) {
  const owner = accounts[0];
  const subscriber = accounts[1];

  let faucetContract = new ethers.Contract(process.env[`${process.env.ETH_ENVIRONMENT}_FAUCET_CONTRACT_ADDRESS`], require('../../build/contracts/ChainpointFaucet.json').abi, subscriber);

  console.log(chalk.gray('-> Subscribing to Faucet Contract'));
  let result
  try {
    result = await faucetContract.subscribe();
    await result.wait();
  
    
  } catch (error) {
    let txReceipt = await provider.getTransactionReceipt(result.hash);

    _.set(
      subscriber, 
      'e2eTesting.faucet.SUBSCRIBE_THROW', 
      _.merge(_.get(subscriber, 'e2eTesting.faucet.SUBSCRIBE_THROW', {}), { passed: true, gasUsed: txReceipt.gasUsed.toString() })
    );
  }

  return accounts;
}

async function isSubscribed(accounts) {
  const owner = accounts[0];
  const subscriber = accounts[1];

  let faucetContract = new ethers.Contract(process.env[`${process.env.ETH_ENVIRONMENT}_FAUCET_CONTRACT_ADDRESS`], require('../../build/contracts/ChainpointFaucet.json').abi, subscriber);

  console.log(chalk.gray('-> Is Subscribed'));
  let result = await faucetContract.isSubscribed(subscriber.address);

  _.set(
    subscriber, 
    'e2eTesting.faucet.IS_SUBSCRIBED', 
    _.merge(_.get(subscriber, 'e2eTesting.faucet.IS_SUBSCRIBED', {}), { passed: result, gasUsed: 0 })
  );

  return accounts;
}

module.exports.setToken = setToken;
module.exports.subscribe = subscribe;
module.exports.subscribeThrow = subscribeThrow;
module.exports.isSubscribed = isSubscribed;