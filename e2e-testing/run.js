const ethers = require('ethers');
const R = require('ramda');
const _ = require('lodash');
const chalk = require('chalk');
const cliHelloLogger = require('./lib/utils/cliHelloLogger');
const resultsLogger = require('./lib/utils/resultsLogger');
const titleLogger = require('./lib/utils/titleLogger');
const provider = require('./lib/utils/provider');
const accounts = require('./lib/utils/accounts');
const { creditAccounts, checkBalances, approveAllowances, checkAllowances} = require('./lib/1_accounts_scaffolding');
const { stakeNodes, checkNodeStakings, updateStakesNodes, unStakeNodes } = require('./lib/2_staking_actions');

// Transfer TNT Tokens to Accounts
let creditAccountsNodes = R.curry(creditAccounts)(500000000000);
const creditAccountsCores = R.curry(creditAccounts)(2500000000000);
// Check that balances of Nodes and Cores match the default amount of TNT that has been tranferred to each
const checkBalancesNodes = R.curry(checkBalances)(500000000000);
const checkBalancesCores = R.curry(checkBalances)(2500000000000);
// Grant allowances to the ChainpointRegistry Contract on behalf of every Node or Core
const approveAllowancesNodes = R.curry(approveAllowances)(500000000000);
const approveAllowancesCores = R.curry(approveAllowances)(2500000000000);
// Check allowances granted to the ChainpointRegistry Contract
const checkAllowancesNodes = R.curry(checkAllowances)(500000000000);
const checkAllowancesCores = R.curry(checkAllowances)(2500000000000);
// Several actions will mutate the state of a Node Staking, check that each state mutation is applied correctly
const _1checkNodeStakings = R.curry(checkNodeStakings)('CHECK_STAKE');
const _2checkNodeStakings = R.curry(checkNodeStakings)('CHECK_STAKE_UPDATED');
const _3checkNodeStakings = R.curry(checkNodeStakings)('CHECK_UN_STAKE');

const tap = (fn1, fn2) => {
  return function(...args) {
    fn1();

    return fn2(...args);
  }
}

(async function() {
  // Chainpoint Hydra Smart Contract Testing Suite
  cliHelloLogger();

  let nodes = R.pipeP(
    tap(() => titleLogger('Transferring Tokens'), creditAccountsNodes),
    tap(() => titleLogger('Checking Token Balances'), checkBalancesNodes),
    tap(() => titleLogger('Approving Allowances'), approveAllowancesNodes),
    tap(() => titleLogger('Checking Allowances'), checkAllowancesNodes),
    tap(() => titleLogger('Nodes Staking'), stakeNodes),
    tap(() => titleLogger('Checking Nodes Stakings'), _1checkNodeStakings),
    tap(() => titleLogger('Updating Nodes Stakes'), updateStakesNodes),
    tap(() => titleLogger('Checking Updated Nodes Stakes'), _2checkNodeStakings),
    (accounts) => new Promise((resolve) => setTimeout(() => resolve(accounts), 120 * 1000)), // Wait for 120seconds before un-staking
    tap(() => titleLogger('Un-Staking Nodes'), unStakeNodes),
    tap(() => titleLogger('Checking Nodes Un-stakings'), _3checkNodeStakings),
  )
  await nodes(accounts);

  // 
  // Log results of E2E tests to stdout
  // 
  for (let i = 0; i < Object.keys(accounts).length; i++) {
    console.log('\n' + 'Account: ' + accounts[i].address);
    resultsLogger(accounts[i], 'INITIAL_BALANCE_TRANSFER')
    resultsLogger(accounts[i], 'INITIAL_BALANCE_CHECK')
    resultsLogger(accounts[i], 'REGISTRY_ALLOWANCE_APPROVAL')
    resultsLogger(accounts[i], 'REGISTRY_ALLOWANCE_APPROVAL_CHECK')
    resultsLogger(accounts[i], 'STAKE')
    resultsLogger(accounts[i], 'CHECK_STAKE')
    resultsLogger(accounts[i], 'CHECK_STAKE_UPDATED')
    resultsLogger(accounts[i], 'UN_STAKE')
    resultsLogger(accounts[i], 'CHECK_UN_STAKE')
  }
})();