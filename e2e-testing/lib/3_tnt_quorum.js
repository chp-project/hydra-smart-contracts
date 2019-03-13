const ethers = require('ethers');
const Web3 = require('web3');
const _ = require('lodash');
const chalk = require('chalk');
const provider = require('./utils/provider');
const accounts = require('./utils/accounts');

const web3 = new Web3(provider)
const abiCoder = ethers.utils.defaultAbiCoder;

const TOKEN_CONTRACT_ADDRESS = process.env[`${process.env.ETH_ENVIRONMENT}_TOKEN_CONTRACT_ADDRESS`] || fs.readFileSync(`./contract-addresses/contract-addresses/${process.env.ETH_ENVIRONMENT.toLowerCase()}_token.txt`, 'utf8');
const REGISTRY_CONTRACT_ADDRESS = process.env[`${process.env.ETH_ENVIRONMENT}_REGISTRY_CONTRACT_ADDRESS`] || fs.readFileSync(`./contract-addresses/contract-addresses/${process.env.ETH_ENVIRONMENT.toLowerCase()}_registry.txt`, 'utf8');
const QUORUM_CONTRACT_ADDRESS = process.env[`${process.env.ETH_ENVIRONMENT}_QUORUM_CONTRACT_ADDRESS`] || fs.readFileSync(`./contract-addresses/contract-addresses/${process.env.ETH_ENVIRONMENT.toLowerCase()}_quorum.txt`, 'utf8');

const REWARDS_LIST_KEY = [
  "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address",
  "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address",
  "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address",
  "address", "address", "address", "address", "address", "address", "address", "address", "address",
  "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address", "address"
];

const REWARDS_LIST = [
  "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB",
  "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB",
  "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB",
  "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB",
  "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB",
  "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB",
  "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB",
  "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB",
  "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB",
  "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB",
  "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB",
  "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB",
  "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB",
  "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB",
  "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB",
  "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB",
  "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB",
  "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB",
  "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB",
  "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB",
  "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB",
  "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB",
  "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB",
  "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB", "0xb10a489Cd65790280aA8342De840047E9C98FfcB"
];

async function setChpRegistry(accounts) {
  const owner = accounts[0];

  let tokenContract = new ethers.Contract(process.env[`${process.env.ETH_ENVIRONMENT}_TOKEN_CONTRACT_ADDRESS`], require('../../build/contracts/TierionNetworkToken.json').abi, owner);

  console.log(chalk.gray('-> Setting Chainpoint Registry contract address'));
  let registryInit = await tokenContract.setChainpointRegistry(REGISTRY_CONTRACT_ADDRESS);
  await registryInit.wait();

  let txReceipt = await provider.getTransactionReceipt(quorumInit.hash);

  _.set(
    owner, 
    'e2eTesting.mint.token.SET_CHP_REGISTRY_CONTRACT', 
    _.merge(_.get(owner, 'e2eTesting.mint.token.SET_CHP_REGISTRY_CONTRACT', {}), { passed: true, gasUsed: txReceipt.gasUsed.toString() })
  );

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
    'e2eTesting.mint.token.MINT_INVOKED', 
    _.merge(_.get(leader, 'e2eTesting.mint.token.MINT_INVOKED', {}), { passed: true, gasUsed: txReceipt.gasUsed.toString() })
  );

  return accounts;
}

module.exports.setChpRegistry = setChpRegistry;
module.exports.mint = mint;