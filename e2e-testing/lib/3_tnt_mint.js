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
const REGISTRY_CONTRACT_ADDRESS = process.env[`${process.env.ETH_ENVIRONMENT}_REGISTRY_CONTRACT_ADDRESS`] || fs.readFileSync(`./contract-addresses/contract-addresses/${process.env.ETH_ENVIRONMENT.toLowerCase()}_registry.txt`, 'utf8');

const REWARDS_LIST_KEY = (new Array(1)).fill("address")
const REWARDS_LIST = (new Array(1)).fill("0x2ff39aa5ee4f19168894af67f3eff25266376b23")

async function setChpRegistry(accounts) {
  const owner = accounts[0];

  let tokenContract = new ethers.Contract(process.env[`${process.env.ETH_ENVIRONMENT}_TOKEN_CONTRACT_ADDRESS`], require('../../build/contracts/TierionNetworkToken.json').abi, owner);

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

async function mint(accounts) {
  const owner = accounts[0];
  const leader = accounts[1];

  let tokenContract = new ethers.Contract(process.env[`${process.env.ETH_ENVIRONMENT}_TOKEN_CONTRACT_ADDRESS`], require('../../build/contracts/TierionNetworkToken.json').abi, leader);
  let rewardsListHash = ethers.utils.keccak256(abiCoder.encode(REWARDS_LIST_KEY, REWARDS_LIST));

  let sigs = [];
  let messageHash;
  for (let i = 2; i < Object.keys(accounts).length; i++) { // Starting at i=2 because accounts[0] is contract owner & accounts[1] is elected leader
  
    let web3Owner = web3.eth.accounts.privateKeyToAccount(accounts[i].privateKey);
    let signature = await web3Owner.sign(rewardsListHash);

    if (!messageHash) { messageHash = signature.messageHash }

    sigs.push(signature.signature);
  }

  try {
    let mintResult = await tokenContract.mint(
      REWARDS_LIST,
      messageHash,
      ...sigs
    );

    await mintResult.wait();
  
    let txReceipt = await provider.getTransactionReceipt(mintResult.hash);
  
    _.set(
      owner, 
      'e2eTesting.mint.token.MINT_INVOKED', 
      _.merge(_.get(owner, 'e2eTesting.mint.token.MINT_INVOKED', {}), { passed: true, gasUsed: txReceipt.gasUsed.toString() })
    );
  } catch (error) {
    console.error(error)
  }
  
  return accounts;
}

async function mintThrowSameSig(accounts) {
  const owner = accounts[0];
  const leader = accounts[1];

  let tokenContract = new ethers.Contract(process.env[`${process.env.ETH_ENVIRONMENT}_TOKEN_CONTRACT_ADDRESS`], require('../../build/contracts/TierionNetworkToken.json').abi, leader);

  let rewardsListHash = ethers.utils.keccak256(abiCoder.encode(REWARDS_LIST_KEY, REWARDS_LIST));
  let web3Owner = web3.eth.accounts.privateKeyToAccount(leader.privateKey);
  
  let signature = await web3Owner.sign(rewardsListHash);

  try {
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
  } catch (__) {
    _.set(
      leader, 
      'e2eTesting.mint.token.MINT_THROW_SAME_SIG', 
      _.merge(_.get(leader, 'e2eTesting.mint.token.MINT_THROW_SAME_SIG', {}), { passed: true, gasUsed: 0 })
    );
  }

  return accounts;
}

async function mintThrowMissingSig(accounts) {
  const owner = accounts[0];
  const leader = accounts[1];

  let tokenContract = new ethers.Contract(process.env[`${process.env.ETH_ENVIRONMENT}_TOKEN_CONTRACT_ADDRESS`], require('../../build/contracts/TierionNetworkToken.json').abi, leader);

  let rewardsListHash = ethers.utils.keccak256(abiCoder.encode(REWARDS_LIST_KEY, REWARDS_LIST));
  let web3Owner = web3.eth.accounts.privateKeyToAccount(leader.privateKey);
  
  let signature = await web3Owner.sign(rewardsListHash);

  try {
    // Missing Signatures 5 & 6 - Should throw
    let mintResult = await tokenContract.mint(
      REWARDS_LIST,
      signature.messageHash,
      signature.signature,
      signature.signature,
      signature.signature,
      signature.signature
    );
    await mintResult.wait();
  } catch (__) {
    _.set(
      leader, 
      'e2eTesting.mint.token.MINT_MISSING_SIG', 
      _.merge(_.get(leader, 'e2eTesting.mint.token.MINT_MISSING_SIG', {}), { passed: true, gasUsed: 0 })
    );
  }

  return accounts;
}

async function mintThrowWrongSig(accounts) {
  const owner = accounts[0];
  const leader = accounts[1];

  let tokenContract = new ethers.Contract(process.env[`${process.env.ETH_ENVIRONMENT}_TOKEN_CONTRACT_ADDRESS`], require('../../build/contracts/TierionNetworkToken.json').abi, leader);
  let rewardsListHash = ethers.utils.keccak256(abiCoder.encode(REWARDS_LIST_KEY, REWARDS_LIST));
  
  let sigs = [];
  let messageHash;
  
  // Let's push a wrong signature (signing different rewardsListHash) to sigs[]
  let web3Owner = web3.eth.accounts.privateKeyToAccount(accounts[2].privateKey);
  let signature = await web3Owner.sign(
    ethers.utils.keccak256(abiCoder.encode(
      REWARDS_LIST_KEY.concat(["address"]), 
      REWARDS_LIST.concat(["2ff39aa5ee4f19168894af67f3eff25266376b23"])
    ))
  );

  let wrongSig = await web3Owner.sign(rewardsListHash);
  sigs.push(wrongSig.signature);

  // Pushing Correct Signatures to sigs[]
  // Starting at i=2 because accounts[0] is contract owner & accounts[1] is elected leader
  // & accounts[2] is "wrong signature"
  for (let i = 3; i < Object.keys(accounts).length; i++) { 
  
    let web3Owner = web3.eth.accounts.privateKeyToAccount(accounts[i].privateKey);
    let signature = await web3Owner.sign(rewardsListHash);

    if (!messageHash) { messageHash = signature.messageHash }

    sigs.push(signature.signature);
  }

  try {
    // Should throw as first signature signed the wrong rewardsListHash
    let mintResult = await tokenContract.mint(
      REWARDS_LIST,
      ...sigs
    );
    await mintResult.wait();
  } catch (__) {
    _.set(
      leader, 
      'e2eTesting.mint.token.MINT_THROW_WRONG_SIG', 
      _.merge(_.get(leader, 'e2eTesting.mint.token.MINT_THROW_WRONG_SIG', {}), { passed: true, gasUsed: 0 })
    );
  }

  return accounts;
}

async function mintCores(accounts) {
  const owner = accounts[0];
  const leader = accounts[1];

  let tokenContract = new ethers.Contract(process.env[`${process.env.ETH_ENVIRONMENT}_TOKEN_CONTRACT_ADDRESS`], require('../../build/contracts/TierionNetworkToken.json').abi, leader);
  tokenContract.on("MintCores", (a, b, event) => {

    console.log('====================================');
    console.log(a.toString(), b.toString());
    console.log('====================================');
  });
  let rewardsListHash = ethers.utils.keccak256(abiCoder.encode(REWARDS_LIST_KEY, REWARDS_LIST));

  let sigs = [];
  let messageHash;
  for (let i = 2; i < Object.keys(accounts).length; i++) { // Starting at i=2 because accounts[0] is contract owner & accounts[1] is elected leader
  
    let web3Owner = web3.eth.accounts.privateKeyToAccount(accounts[i].privateKey);
    let signature = await web3Owner.sign(rewardsListHash);

    if (!messageHash) { messageHash = signature.messageHash }

    sigs.push(signature.signature);
  }

  try {
    let mintResult = await tokenContract.mintCores(
      REWARDS_LIST,
      messageHash,
      sigs.splice(0,2).concat((new Array(124)).fill("0x"))
    );

    debugger;

    await mintResult.wait();
  
    let txReceipt = await provider.getTransactionReceipt(mintResult.hash);

    debugger;
  
    _.set(
      owner, 
      'e2eTesting.mint.token.MINT_CORES_INVOKED', 
      _.merge(_.get(owner, 'e2eTesting.mint.token.MINT_CORES_INVOKED', {}), { passed: true, gasUsed: txReceipt.gasUsed.toString() })
    );
  } catch (error) {
    console.error(error)
  }
  
  return accounts;
}

async function mintCoresRaw(accounts) {
  const owner = accounts[0];
  const leader = accounts[1];
  const leaderWallet = new ethers.Wallet(accounts[1].privateKey)

  let tokenContract = new ethers.Contract(process.env[`${process.env.ETH_ENVIRONMENT}_TOKEN_CONTRACT_ADDRESS`], require('../../build/contracts/TierionNetworkToken.json').abi, leader);
  tokenContract.on("MintCores", (a, b, event) => {
    console.log('====================================');
    console.log(a.toString(), b.toString());
    console.log('====================================');
  });

  
  let rewardsListHash = ethers.utils.keccak256(abiCoder.encode(REWARDS_LIST_KEY, REWARDS_LIST));
  let sigs = [];
  let messageHash;
  for (let i = 2; i < Object.keys(accounts).length; i++) { // Starting at i=2 because accounts[0] is contract owner & accounts[1] is elected leader
    let web3Owner = web3.eth.accounts.privateKeyToAccount(accounts[i].privateKey);
    let signature = await web3Owner.sign(rewardsListHash);

    if (!messageHash) { messageHash = signature.messageHash }

    sigs.push(signature.signature);
  }

  // Create Raw Tx
  const tokenContractInterface = new ethers.utils.Interface(require('../../build/contracts/TierionNetworkToken.json').abi)
  let functionInfo = tokenContractInterface.functions.mintCores
  let functionData = functionInfo.encode([REWARDS_LIST, messageHash, sigs])
  let functionData1 = ethers.utils.solidityPack(['address[]', 'bytes32', 'bytes[]'], [REWARDS_LIST, messageHash, sigs])

  const tx = {
    gasPrice: 1000000000,
    gasLimit: 185000,
    data: functionData1,
    to: TOKEN_CONTRACT_ADDRESS,
    nonce: 32,
    chainId: parseInt(3, 10)
  }

  let signedTx = await leaderWallet.sign(tx)

  debugger;

  let sendResponse = await provider.sendTransaction(signedTx)
  let txReceipt = await provider.waitForTransaction(sendResponse.hash)
  let transactionHash = txReceipt.transactionHash
  let blockHash = txReceipt.blockHash
  let blockNumber = txReceipt.blockNumber
  let gasUsed = txReceipt.gasUsed.toNumber() // convert from BigNumber to native number
  let result = { transactionHash, blockHash, blockNumber, gasUsed }

  debugger;

  console.log('====================================');
  console.log(result, 'result');
  console.log('====================================');
  
  _.set(
    owner, 
    'e2eTesting.mint.token.MINT_CORES_INVOKED', 
    _.merge(_.get(owner, 'e2eTesting.mint.token.MINT_CORES_INVOKED', {}), { passed: true, gasUsed: txReceipt.gasUsed.toString() })
  );
  
  return accounts;
}

module.exports.setChpRegistry = setChpRegistry;
module.exports.mint = mint;
module.exports.mintCores = mintCores;
module.exports.mintCoresRaw = mintCoresRaw;
module.exports.mintThrowSameSig = mintThrowSameSig;
module.exports.mintThrowMissingSig = mintThrowMissingSig;
module.exports.mintThrowWrongSig = mintThrowWrongSig;