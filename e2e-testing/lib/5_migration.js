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
const MIGRATION_CONTRACT_ADDRESS = process.env[`${process.env.ETH_ENVIRONMENT}_MIGRATION_CONTRACT_ADDRESS`] || fs.readFileSync(`./contract-addresses/contract-addresses/${process.env.ETH_ENVIRONMENT.toLowerCase()}_migration.txt`, 'utf8');

async function setToken(accounts) {
  const owner = accounts[0];

  let migrationContract = new ethers.Contract(process.env[`${process.env.ETH_ENVIRONMENT}_MIGRATION_CONTRACT_ADDRESS`], require('../../build/contracts/ChainpointMigration.json').abi, owner);

  console.log(chalk.gray('-> Setting $TKN contract address'));
  let migrationInit = await migrationContract.setToken(TOKEN_CONTRACT_ADDRESS);
  await migrationInit.wait();

  let txReceipt = await provider.getTransactionReceipt(migrationInit.hash);

  _.set(
    owner, 
    'e2eTesting.migration.SET_$TKN_CONTRACT', 
    _.merge(_.get(owner, 'e2eTesting.migration.TKN_CONTRACT', {}), { passed: true, gasUsed: txReceipt.gasUsed.toString() })
  );

  return accounts;
}

async function exchange(amount, accounts) {
  for (let i = 0; i < Object.keys(accounts).length; i++) {
    if (i === 0) continue;

    console.log(chalk.gray('-> Migrating Tokens for: ' + accounts[i].address))

    const owner = accounts[i];

    let migrationContract = new ethers.Contract(process.env[`${process.env.ETH_ENVIRONMENT}_MIGRATION_CONTRACT_ADDRESS`], require('../../build/contracts/ChainpointMigration.json').abi, owner);
    let migrationInit = await migrationContract.exchange(amount);
    await migrationInit.wait();

    let txReceipt = await provider.getTransactionReceipt(migrationInit.hash);

    _.set(
      owner, 
      'e2eTesting.migration.EXCHANGE', 
      _.merge(_.get(owner, 'e2eTesting.migration.EXCHANGE', {}), { passed: true, gasUsed: txReceipt.gasUsed.toString() })
    );
  }

  return accounts;
}

module.exports.setToken = setToken;
module.exports.exchange = exchange;
