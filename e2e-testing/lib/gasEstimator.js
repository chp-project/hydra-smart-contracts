const ethers = require('ethers');
const provider = require('./utils/provider');
const accounts = require('./utils/accounts');

const TOKEN_CONTRACT_ADDRESS = process.env[`${process.env.ETH_ENVIRONMENT}_TOKEN_CONTRACT_ADDRESS`];
const REGISTRY_CONTRACT_ADDRESS = process.env[`${process.env.ETH_ENVIRONMENT}_REGISTRY_CONTRACT_ADDRESS`];
const QUORUM_CONTRACT_ADDRESS = process.env[`${process.env.ETH_ENVIRONMENT}_QUORUM_CONTRACT_ADDRESS`];

let tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, require('../../build/contracts/TierionNetworkToken.json').abi, accounts[0]);
let registryContract = new ethers.Contract(REGISTRY_CONTRACT_ADDRESS, require('../../build/contracts/ChainpointRegistry.json').abi, accounts[0]);
let quorumContract = new ethers.Contract(QUORUM_CONTRACT_ADDRESS, require('../../build/contracts/ChainpointQuorum.json').abi, accounts[0]);

let result = tokenContract.mint.estimateGas(["0xc6a7897cc8f2e3b294844a07165573c6194324ab"], {from: '0xae9d2422C95c2253EeF6C015705C3777992f1959'});

console.log('====================================');
console.log(result, 'result');
console.log('====================================');