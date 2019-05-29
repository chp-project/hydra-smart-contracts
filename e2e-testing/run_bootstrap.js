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
const {tkn_setChpRegistry, migration_setToken} = require('./lib/0a_bootstrap_contract_refs');

const accounts = defaultAccounts;

(async function() {
  // Chainpoint Hydra Smart Contract Testing Suite
  cliHelloLogger();

  const args = process.argv.slice(2);

  let actions = R.pipeP(
    tap(() => titleLogger('$TKN Contract'), tkn_setChpRegistry),
    tap(() => titleLogger('Migration Contract'), migration_setToken),
  )
  await actions(accounts);

  // 
  // Log results of E2E Bootstrapping to stdout
  // 
  for (let i = 0; i < 1; i++) {
    console.log('\n' + 'Account: ' + accounts[i].address);
    resultsLogger(accounts[i], 'SET_CHP_REGISTRY_CONTRACT', 'mint.token')
    resultsLogger(accounts[i], 'SET_$TKN_CONTRACT', 'migration')
  }
})();