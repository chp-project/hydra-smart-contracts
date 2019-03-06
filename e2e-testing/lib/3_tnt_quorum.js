const ethers = require('ethers');
const Web3 = require('web3');
const _ = require('lodash');
const chalk = require('chalk');
const provider = require('./utils/provider');
const accounts = require('./utils/accounts');

const web3 = new Web3(provider)
const abiCoder = ethers.utils.defaultAbiCoder;

const TOKEN_CONTRACT_ADDRESS = process.env[`${process.env.ETH_ENVIRONMENT}_TOKEN_CONTRACT_ADDRESS`];
const REGISTRY_CONTRACT_ADDRESS = process.env[`${process.env.ETH_ENVIRONMENT}_REGISTRY_CONTRACT_ADDRESS`];
const QUORUM_CONTRACT_ADDRESS = process.env[`${process.env.ETH_ENVIRONMENT}_QUORUM_CONTRACT_ADDRESS`];

const REWARDS_LIST_KEY = [
  "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address",
  "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address",
  "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address",
  "address", "address", "address", "address", "address", "address", "address", "address", "address",
  "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address"
];

const REWARDS_LIST = [
  "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF",
  "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF",
  "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF",
  "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF",
  "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF",
  "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF",
  "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF",
  "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF",
  "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF",
  "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF",
  "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF",
  "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF",
  "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF",
  "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF",
  "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF",
  "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF",
  "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF",
  "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF",
  "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF",
  "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF",
  "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF",
  "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF",
  "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF",
  "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF", "0x0DCd2F752394c41875e259e00bb44fd505297caF"
];

async function setChpQuorumAndBootstrap(accounts) {
  const owner = accounts[0];

  let tokenContract = new ethers.Contract(process.env[`${process.env.ETH_ENVIRONMENT}_TOKEN_CONTRACT_ADDRESS`], require('../../build/contracts/TierionNetworkToken.json').abi, owner);

  console.log(chalk.gray('-> Setting Chainpoint Registry + Quorum contract address'));
  let registryInit = await tokenContract.setChainpointRegistry(REGISTRY_CONTRACT_ADDRESS);
  await registryInit.wait();
  
  let quorumInit = await tokenContract.setChpQuorumAndBootstrap(QUORUM_CONTRACT_ADDRESS);
  await quorumInit.wait();

  let txReceipt = await provider.getTransactionReceipt(quorumInit.hash);

  _.set(
    owner, 
    'e2eTesting.quorum.token.SET_CHP_QUORUM_CONTRACT', 
    _.merge(_.get(owner, 'e2eTesting.quorum.token.SET_CHP_QUORUM_CONTRACT', {}), { passed: true, gasUsed: txReceipt.gasUsed.toString() })
  );

  return accounts;
}

async function checkRegisteredBallots(accounts) {
  const owner = accounts[0];

  let tokenContract = new ethers.Contract(process.env[`${process.env.ETH_ENVIRONMENT}_TOKEN_CONTRACT_ADDRESS`], require('../../build/contracts/TierionNetworkToken.json').abi, owner);
  let quorumContract = new ethers.Contract(process.env[`${process.env.ETH_ENVIRONMENT}_QUORUM_CONTRACT_ADDRESS`], require('../../build/contracts/ChainpointQuorum.json').abi, owner);

  console.log(chalk.gray('-> Checking registered ballot for mint()'));
  let registeredBallotsResult = await tokenContract.quorumRegisteredBallots(0);
  let result = await quorumContract.registeredBallots(registeredBallotsResult);

  _.set(owner, `e2eTesting.quorum.token.MINT_BALLOT_REGISTERED`, { passed: result.isActive, gasUsed: 0 });

  return accounts;
}

async function mint(accounts) {
  const owner = accounts[0];
  const leader = accounts[1];

  let tokenContract = new ethers.Contract(process.env[`${process.env.ETH_ENVIRONMENT}_TOKEN_CONTRACT_ADDRESS`], require('../../build/contracts/TierionNetworkToken.json').abi, owner);

  let rewardsListHash = ethers.utils.keccak256(abiCoder.encode(REWARDS_LIST_KEY, REWARDS_LIST));
  let web3Owner = web3.eth.accounts.privateKeyToAccount(leader.privateKey);
  
  let signature = await web3Owner.sign(rewardsListHash);

  let mintResult = await tokenContract.mint(
    REWARDS_LIST,
    signature.messageHash,
    signature.signature,
    signature.signature,
    signature.signature,
    signature.signature,
    signature.signature,
    signature.signature
  );
  await mintResult.wait();

  let txReceipt = await provider.getTransactionReceipt(mintResult.hash);

  _.set(
    leader, 
    'e2eTesting.quorum.token.MINT_INVOKED', 
    _.merge(_.get(leader, 'e2eTesting.quorum.token.MINT_INVOKED', {}), { passed: true, gasUsed: txReceipt.gasUsed.toString() })
  );

  return accounts;
}

module.exports.setChpQuorumAndBootstrap = setChpQuorumAndBootstrap;
module.exports.checkRegisteredBallots = checkRegisteredBallots;
module.exports.mint = mint;