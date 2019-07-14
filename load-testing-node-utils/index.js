require("@babel/polyfill");
import exec from 'executive'

const fs = require('fs')
const path = require('path')
const ethers = require('ethers');
const R = require('ramda');
const _ = require('lodash');
const chalk = require('chalk')

const TierionNetworkTokenABI = require('../../smart-contract-artifacts/dist/contracts/TierionNetworkToken.json').abi
const infuraProvider = new ethers.providers.InfuraProvider('ropsten', process.env.ETH_INFURA_API_KEY)
const ethAddress = fs.readFileSync('./eth-address.txt', 'utf8').replace(/(\r\n|\n|\r)/gm, "")
const publicIP = fs.readFileSync('./eip.txt', 'utf8').replace(/(\r\n|\n|\r)/gm, "")

// TNT Amounts
const NODE_TNT_STAKE_AMOUNT = 500000000000;

const wait = (ms) => new Promise(resolve => { setTimeout(() => resolve(), ms) })

async function main() {
  console.log('====================================');
  console.log(process.env.ROPSTEN_TOKEN_CONTRACT_ADDRESS);
  console.log('====================================');
  let owner = ethers.Wallet.createRandom({ extraEntropy: ethers.utils.formatBytes32String(`${Date.now()}`) });
  owner = owner.connect(infuraProvider);
  // Connect to Token Contract
  let tokenContract = new ethers.Contract(process.env.ROPSTEN_TOKEN_CONTRACT_ADDRESS, TierionNetworkTokenABI, owner);
  
  let positiveTokenBalance = false
  while (!positiveTokenBalance) {
    let balance = await tokenContract.balanceOf(ethAddress);

    console.log(chalk.gray('Node Balance: ', balance))
    if (balance >= NODE_TNT_STAKE_AMOUNT) positiveTokenBalance = true;

    await wait(20000)
  }
}

main()
  .then(res => {
    console.log('====================================');
    console.log('==        Node received TNT       ==');
    console.log('====================================');
    process.exit(0)
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })