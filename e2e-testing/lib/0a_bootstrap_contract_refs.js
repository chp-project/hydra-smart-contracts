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
const MIGRATION_CONTRACT_ADDRESS = process.env[`${process.env.ETH_ENVIRONMENT}_MIGRATION_CONTRACT_ADDRESS`] || fs.readFileSync(`./contract-addresses/contract-addresses/${process.env.ETH_ENVIRONMENT.toLowerCase()}_migration.txt`, 'utf8');

async function tkn_setChpRegistry(accounts) {
  const owner = accounts[0];

  let tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, require('../../build/contracts/TierionNetworkToken.json').abi, owner);

  console.log(chalk.gray('-> Setting Chainpoint Registry contract address'));
  let registryInit = await tokenContract.setChainpointRegistry(REGISTRY_CONTRACT_ADDRESS);
  await registryInit.wait();

  let txReceipt = await provider.getTransactionReceipt(registryInit.hash);

  _.set(
    owner, 
    'e2eTesting.mint.token.SET_CHP_REGISTRY_CONTRACT', 
    _.merge(_.get(owner, 'e2eTesting.mint.token.SET_CHP_REGISTRY_CONTRACT', {}), { passed: true, gasUsed: txReceipt.gasUsed.toString() })
  );

  return accounts;
}

async function migration_setToken(accounts) {
  const owner = accounts[0];

  let migrationContract = new ethers.Contract(process.env[`${process.env.ETH_ENVIRONMENT}_MIGRATION_CONTRACT_ADDRESS`], require('../../build/contracts/ChainpointMigration.json').abi, owner);

  console.log(chalk.gray('-> Setting $TKN contract address'));
  let migrationInit = await migrationContract.setToken(TOKEN_CONTRACT_ADDRESS);
  await migrationInit.wait();

  let txReceipt = await provider.getTransactionReceipt(migrationInit.hash);

  _.set(
    owner, 
    'e2eTesting.migration.SET_$TKN_CONTRACT', 
    _.merge(_.get(owner, 'e2eTesting.migration.SET_$TKN_CONTRACT', {}), { passed: true, gasUsed: txReceipt.gasUsed.toString() })
  );

  return accounts;
}

module.exports.tkn_setChpRegistry = tkn_setChpRegistry;
module.exports.migration_setToken = migration_setToken;