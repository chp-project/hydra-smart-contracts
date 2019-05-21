const ethers = require('ethers');
const R = require('ramda');
const _ = require('lodash');
const chalk = require('chalk');
const tap = require('./lib/utils/tap');
const cliHelloLogger = require('./lib/utils/cliHelloLogger');
const resultsLogger = require('./lib/utils/resultsLogger');
const titleLogger = require('./lib/utils/titleLogger');
const provider = require('./lib/utils/provider');
const defaultAccounts = require('./lib/utils/accounts').accounts;
const {accountsFromPrivKey} = require('./lib/utils/accounts');
const { setToken, subscribe, subscribeThrow, isSubscribed } = require('./lib/4_faucet');

// These PrivKeys are those being used by testnet Cores
const privKeysArr = []
const accounts = (privKeysArr.length) ? accountsFromPrivKey(privKeysArr) : defaultAccounts

async function main() {
  // Chainpoint Hydra Smart Contract Testing Suite
  cliHelloLogger();

  let actions = R.pipeP(
    tap(() => titleLogger('Set $TKN contract address'), setToken),
    tap(() => titleLogger('Invoke subscribe()'), subscribe),
    tap(() => titleLogger('Invoke isSubscribed()'), isSubscribed),
    tap(() => titleLogger('Invoke subscribeThrow()'), subscribeThrow)
  )
  await actions(accounts);

  for (let i = 0; i < Object.keys({0: accounts[0], 1: accounts[1]}).length; i++) {
    console.log('\n' + accounts[i].address + ':');
    resultsLogger(accounts[i], 'TKN_CONTRACT', 'faucet');
    resultsLogger(accounts[i], 'SUBSCRIBE', 'faucet');
    resultsLogger(accounts[i], 'IS_SUBSCRIBED', 'faucet');
    resultsLogger(accounts[i], 'SUBSCRIBE_THROW', 'faucet');
  }
}

main()
  .then(res => {
    console.log('====================================');
    console.log(res, 'res');
    console.log('====================================');
    process.exit(0)
  })
  .catch(err => {
    console.log('====================================');
    console.log(err, 'err');
    console.log('====================================');
    process.exit(1)
  })