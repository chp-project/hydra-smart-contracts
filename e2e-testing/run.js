const ethers = require('ethers');
const R = require('ramda');
const _ = require('lodash');
const chalk = require('chalk');
const tap = require('./lib/utils/tap');
const cliHelloLogger = require('./lib/utils/cliHelloLogger');
const resultsLogger = require('./lib/utils/resultsLogger');
const titleLogger = require('./lib/utils/titleLogger');
const provider = require('./lib/utils/provider');
const accounts = require('./lib/utils/accounts');
const { creditAccounts, checkBalances, approveAllowances, checkAllowances} = require('./lib/1_accounts_scaffolding');
const { stakeNodes, checkNodeStakings, updateStakesNodes, unStakeNodes } = require('./lib/2_staking_actions');
const { stakeCores, checkCoreStakings, updateStakesCores, unStakeCores } = require('./lib/2a_core_staking_actions');

// TNT Amounts
const NODE_TNT_STAKE_AMOUNT = 500000000000;
const CORE_TNT_STAKE_AMOUNT = 2500000000000;

// Transfer TNT Tokens to Accounts
let creditAccountsNodes = R.curry(creditAccounts)(NODE_TNT_STAKE_AMOUNT);
const creditAccountsCores = R.curry(creditAccounts)(CORE_TNT_STAKE_AMOUNT - NODE_TNT_STAKE_AMOUNT);
// Check that balances of Nodes and Cores match the default amount of TNT that has been tranferred to each
const checkBalancesNodes = R.curry(checkBalances)(NODE_TNT_STAKE_AMOUNT);
const checkBalancesCores = R.curry(checkBalances)(CORE_TNT_STAKE_AMOUNT);
// Grant allowances to the ChainpointRegistry Contract on behalf of every Node or Core
const approveAllowancesNodes = R.curry(approveAllowances)(NODE_TNT_STAKE_AMOUNT);
const approveAllowancesCores = R.curry(approveAllowances)(CORE_TNT_STAKE_AMOUNT);
// Check allowances granted to the ChainpointRegistry Contract
const checkAllowancesNodes = R.curry(checkAllowances)(NODE_TNT_STAKE_AMOUNT);
const checkAllowancesCores = R.curry(checkAllowances)(CORE_TNT_STAKE_AMOUNT);
// Several actions will mutate the state of a Node & Core Staking, check that each state mutation is applied correctly
const _1checkNodeStakings = R.curry(checkNodeStakings)('CHECK_STAKE');
const _2checkNodeStakings = R.curry(checkNodeStakings)('CHECK_STAKE_UPDATED');
const _3checkNodeStakings = R.curry(checkNodeStakings)('CHECK_UN_STAKE');

const _1checkCoreStakings = R.curry(checkCoreStakings)('CHECK_STAKE');
const _2checkCoreStakings = R.curry(checkCoreStakings)('CHECK_STAKE_UPDATED');
const _3checkCoreStakings = R.curry(checkCoreStakings)('CHECK_UN_STAKE');

(async function() {
  // Chainpoint Hydra Smart Contract Testing Suite
  cliHelloLogger();

  let nodes = R.pipeP(
    tap(() => titleLogger('Transferring Tokens'), creditAccountsNodes),
    tap(() => titleLogger('Checking Token Balances'), checkBalancesNodes),
    tap(() => titleLogger('Approving Allowances'), approveAllowancesCores),
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

  console.log('\n' + chalk.pink('Cores:'));

  let cores = R.pipeP(
    tap(() => titleLogger('Transferring Tokens'), creditAccountsCores),
    tap(() => titleLogger('Checking Token Balances'), checkBalancesCores),
    tap(() => titleLogger('Approving Allowances'), approveAllowancesCores),
    tap(() => titleLogger('Checking Allowances'), checkAllowancesCores),
    tap(() => titleLogger('Cores Staking'), stakeCores),
    tap(() => titleLogger('Checking Cores Stakings'), _1checkCoreStakings),
    tap(() => titleLogger('Updating Cores Stakes'), updateStakesCores),
    tap(() => titleLogger('Checking Updated Cores Stakes'), _2checkCoreStakings),
    (accounts) => new Promise((resolve) => setTimeout(() => resolve(accounts), 120 * 1000)), // Wait for 120seconds before un-staking
    tap(() => titleLogger('Un-Staking Cores'), unStakeCores),
    tap(() => titleLogger('Checking Cores Un-stakings'), _3checkCoreStakings),
  )
  await cores(accounts);

  // 
  // Log results of E2E tests to stdout
  // 
  for (let i = 0; i < Object.keys(accounts).length; i++) {
    console.log('\n' + 'Account: ' + accounts[i].address);
    resultsLogger(accounts[i], 'INITIAL_BALANCE_TRANSFER', 'node')
    resultsLogger(accounts[i], 'INITIAL_BALANCE_CHECK', 'node')
    resultsLogger(accounts[i], 'REGISTRY_ALLOWANCE_APPROVAL', 'node')
    resultsLogger(accounts[i], 'REGISTRY_ALLOWANCE_APPROVAL_CHECK', 'node')
    resultsLogger(accounts[i], 'STAKE', 'node')
    resultsLogger(accounts[i], 'CHECK_STAKE', 'node')
    resultsLogger(accounts[i], 'CHECK_STAKE_UPDATED', 'node')
    resultsLogger(accounts[i], 'UN_STAKE', 'node')
    resultsLogger(accounts[i], 'CHECK_UN_STAKE', 'node')
    
    console.log('   ' + chalk.magenta('Core:'))

    resultsLogger(accounts[i], 'INITIAL_BALANCE_TRANSFER', 'core')
    resultsLogger(accounts[i], 'INITIAL_BALANCE_CHECK', 'core')
    resultsLogger(accounts[i], 'REGISTRY_ALLOWANCE_APPROVAL', 'core')
    resultsLogger(accounts[i], 'REGISTRY_ALLOWANCE_APPROVAL_CHECK', 'core')
    resultsLogger(accounts[i], 'STAKE', 'core')
    resultsLogger(accounts[i], 'CHECK_STAKE', 'core')
    resultsLogger(accounts[i], 'CHECK_STAKE_UPDATED', 'core')
    resultsLogger(accounts[i], 'UN_STAKE', 'core')
    resultsLogger(accounts[i], 'CHECK_UN_STAKE', 'core')
  }
})();