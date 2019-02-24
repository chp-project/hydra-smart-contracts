const ethers = require('ethers');
const _ = require('lodash');
const chalk = require('chalk');
const provider = require('./utils/provider');

const abiCoder = ethers.utils.defaultAbiCoder;

const TOKEN_CONTRACT_ADDRESS = process.env[`${process.env.ETH_ENVIRONMENT}_TOKEN_CONTRACT_ADDRESS`];
const REGISTRY_CONTRACT_ADDRESS = process.env[`${process.env.ETH_ENVIRONMENT}_REGISTRY_CONTRACT_ADDRESS`];
const QUORUM_CONTRACT_ADDRESS = process.env[`${process.env.ETH_ENVIRONMENT}_QUORUM_CONTRACT_ADDRESS`];

async function setChpQuorumAndBootstrap(accounts) {
  const owner = accounts[0];

  let tokenContract = new ethers.Contract(process.env[`${process.env.ETH_ENVIRONMENT}_TOKEN_CONTRACT_ADDRESS`], require('../../build/contracts/TierionNetworkToken.json').abi, owner);

  console.log(chalk.gray('-> Setting Chainpoint Registry + Quorum contract address'));
  let registryInit = await tokenContract.setChainpointRegistry(REGISTRY_CONTRACT_ADDRESS);
  await registryInit.wait();
  
  let quorumInit = await tokenContract.setChpQuorumAndBootstrap(QUORUM_CONTRACT_ADDRESS);
  await quorumInit.wait();

  _.set(owner, `e2eTesting.quorum.token.SET_CHP_QUORUM_CONTRACT`, true);

  return accounts;
}

async function checkRegisteredBallots(accounts) {
  const owner = accounts[0];

  let tokenContract = new ethers.Contract(process.env[`${process.env.ETH_ENVIRONMENT}_TOKEN_CONTRACT_ADDRESS`], require('../../build/contracts/TierionNetworkToken.json').abi, owner);
  let quorumContract = new ethers.Contract(process.env[`${process.env.ETH_ENVIRONMENT}_QUORUM_CONTRACT_ADDRESS`], require('../../build/contracts/ChainpointQuorum.json').abi, owner);

  console.log(chalk.gray('-> Checking registered ballot for mint()'));
  let registeredBallotsResult = await tokenContract.quorumRegisteredBallots(0);
  let result = await quorumContract.registeredBallots(registeredBallotsResult);

  _.set(owner, `e2eTesting.quorum.token.MINT_BALLOT_REGISTERED`, result.isActive);

  debugger;

  return accounts;
}

async function mint(accounts) {
  const owner = accounts[1];

  let tokenContract = new ethers.Contract(process.env[`${process.env.ETH_ENVIRONMENT}_TOKEN_CONTRACT_ADDRESS`], require('../../build/contracts/TierionNetworkToken.json').abi, owner);

  console.log(chalk.gray('-> Invoking Mint, thus registering a vote'));
  let mintResult = await tokenContract.mint(["0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF"]);
  await mintResult.wait();

  _.set(owner, `e2eTesting.quorum.token.MINT_INVOKED`, true);

  return accounts;
}

module.exports.setChpQuorumAndBootstrap = setChpQuorumAndBootstrap;
module.exports.checkRegisteredBallots = checkRegisteredBallots;
module.exports.mint = mint;