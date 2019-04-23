require("@babel/polyfill");
import exec from 'executive'

const fs = require('fs')
const path = require('path')
const ethers = require('ethers');
const R = require('ramda');
const _ = require('lodash');

const TierionNetworkTokenABI = require('../build/contracts/TierionNetworkToken.json').abi
const infuraProvider = new ethers.providers.InfuraProvider('ropsten', process.env.ETH_INFURA_API_KEY)
const ethAddress = fs.readFileSync('/eth-address.txt', 'utf8')
const publicIP = fs.readFileSync('/eip.txt', 'utf8')

// TNT Amounts
const NODE_TNT_STAKE_AMOUNT = 500000000000;

const wait = (ms) => new Promise(resolve => { setTimeout(() => resolve(), ms) })

async function main() {
  let owner = ethers.Wallet.createRandom({ extraEntropy: ethers.utils.formatBytes32String(`${Date.now()}`) });
  owner.connect(provider);
  // Connect to Token Contract
  let tokenContract = new ethers.Contract(process.env.ROPSTEN_TOKEN_CONTRACT_ADDRESS, TierionNetworkTokenABI, owner);
  
  let positiveTokenBalance = false
  while (!positiveTokenBalance) {
    let balance = await tokenContract.balanceOf(ethAddress);

    if (balance == NODE_TNT_STAKE_AMOUNT) positiveTokenBalance = true;

    await wait(60000)
  }

  let result = await exec([
    `make register NODE_ETH_REWARDS_ADDRESS=${ethAddress} NODE_PUBLIC_IP_ADDRESS=${publicIP} AUTO_REFILL_ENABLED=true AUTO_REFILL_AMOUNT=720`
  ])

  return result
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