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
const { creditAccounts, checkBalances, approveAllowances, checkAllowances} = require('./lib/1_accounts_scaffolding');
const { setToken, exchange } = require('./lib/5_migration');

// These PrivKeys are those being used by testnet Cores
const privKeysArr = []
const accounts = (privKeysArr.length) ? accountsFromPrivKey(privKeysArr) : defaultAccounts

// TNT Amounts
const NODE_TNT_STAKE_AMOUNT = 550000000000;

// Transfer TNT Tokens to Accounts
let creditAccountsNodes = R.curry(creditAccounts)('TNT')(NODE_TNT_STAKE_AMOUNT);
// Check that balances of Nodes match the default amount of TNT that has been tranferred to each
const checkBalancesNodes = R.curry(checkBalances)('TNT')(NODE_TNT_STAKE_AMOUNT);
// 
const approveAllowancesNodes = R.curry(approveAllowances)('migration')(NODE_TNT_STAKE_AMOUNT);
// Check allowances granted to the ChainpointRegistry Contract
const checkAllowancesNodes = R.curry(checkAllowances)('migration')(NODE_TNT_STAKE_AMOUNT);

const exchangeNodes = R.curry(exchange)(NODE_TNT_STAKE_AMOUNT);

async function main() {
  // Chainpoint Hydra Smart Contract Testing Suite
  cliHelloLogger();

  let actions = R.pipeP(
    // tap(() => titleLogger('Set $TKN contract address'), setToken),
    // tap(() => titleLogger('Transferring Tokens'), creditAccountsNodes),
    // tap(() => titleLogger('Checking Token Balances'), checkBalancesNodes),
    // tap(() => titleLogger('Approving Allowances'), approveAllowancesNodes),
    tap(() => titleLogger('Checking Allowances'), checkAllowancesNodes),
    tap(() => titleLogger('Migrating Tokens'), exchangeNodes),
  )
  await actions(accounts);

  for (let i = 0; i < Object.keys(accounts).length; i++) {
    console.log('\n' + accounts[i].address + ':');
    resultsLogger(accounts[i], 'INITIAL_BALANCE_TRANSFER', 'node')
      resultsLogger(accounts[i], 'INITIAL_BALANCE_CHECK', 'node')
      resultsLogger(accounts[i], 'MIGRATION_ALLOWANCE_APPROVAL', 'node')
      resultsLogger(accounts[i], 'MIGRATION_ALLOWANCE_APPROVAL_CHECK', 'node')
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