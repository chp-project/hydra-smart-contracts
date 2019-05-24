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
const { stakeNodes, checkNodeStakings, updateStakesNodes, unStakeNodes } = require('./lib/2_staking_actions');
const { approveCores, approveCoresMultiSig, stakeCores, checkCoreStakings, updateStakesCores, unStakeCores } = require('./lib/2a_core_staking_actions');

const privKeysArr = [
  {privateKey: "0xd74408108dea58b9a7c5157ca13f9168644fbbffda08a4ce0346640cafcfafb3", ip: '35.245.53.181'},
  {privateKey: "0xdddab7b4ec19893c86cddaa4eef5915907778e1a41764f9e90e5ef9a7603b30b", ip: '35.188.238.186'},
  {privateKey: "0xf7e39d12945311c58091f59c41a0842a1b874941a7c6a9b403379384115a33dd", ip: '35.245.211.97'},
  {privateKey: "0x4a9c3c814b485a6b9925b6ed4f72acafd036d2a84af568b2f35f123ec64ccdc2", ip: '35.245.9.90'},
  {privateKey: "0x0a0ecaef321662b73acd0a59123ff595dc95e838a4ccb1a2c335e2b7da1db6e1", ip: '35.245.89.209'},
  {privateKey: "0x1efb256136d6e50a46e53c14445cf8a59e970d754343731a71832a8803e92a16", ip: '35.245.207.91'},
  {privateKey: "0x284dedd0857f79114cd5c1a276b56783b8ef905be9f4eceb981fa26f49014a28", ip: '35.245.1.11'},
]
const accounts = (privKeysArr.length) ? accountsFromPrivKey(privKeysArr) : defaultAccounts

// TNT Amounts
const NODE_TNT_STAKE_AMOUNT = 500000000000;
const CORE_TNT_STAKE_AMOUNT = 2500000000000;

// Transfer TNT Tokens to Accounts
let creditAccountsNodes = R.curry(creditAccounts)('$TKN')(NODE_TNT_STAKE_AMOUNT);
const creditAccountsCores = R.curry(creditAccounts)('$TKN')(CORE_TNT_STAKE_AMOUNT);
// Check that balances of Nodes and Cores match the default amount of TNT that has been tranferred to each
const checkBalancesNodes = R.curry(checkBalances)('$TKN')(NODE_TNT_STAKE_AMOUNT);
const checkBalancesCores = R.curry(checkBalances)('$TKN')(CORE_TNT_STAKE_AMOUNT);
// Grant allowances to the ChainpointRegistry Contract on behalf of every Node or Core
const approveAllowancesNodes = R.curry(approveAllowances)('registry')(NODE_TNT_STAKE_AMOUNT);
const approveAllowancesCores = R.curry(approveAllowances)('registry')(CORE_TNT_STAKE_AMOUNT);
// Check allowances granted to the ChainpointRegistry Contract
const checkAllowancesNodes = R.curry(checkAllowances)('registry')(NODE_TNT_STAKE_AMOUNT);
const checkAllowancesCores = R.curry(checkAllowances)('registry')(CORE_TNT_STAKE_AMOUNT);
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

  const args = process.argv.slice(2);

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
  if (args.includes('--nodes')) await nodes(accounts);

  if (args.includes('--cores')) console.log('\n' + chalk.magenta('CORE ACTIONS:'));

  let cores = R.pipeP(
    tap(() => titleLogger('Transferring Tokens'), creditAccountsCores),
    tap(() => titleLogger('Checking Token Balances'), checkBalancesCores),
    tap(() => titleLogger('Approving Allowances'), approveAllowancesCores),
    tap(() => titleLogger('Checking Allowances'), checkAllowancesCores),
    tap(() => titleLogger('Approving Cores'), approveCores),
    tap(() => titleLogger('Cores Staking'), stakeCores),
    tap(() => titleLogger('Checking Cores Stakings'), _1checkCoreStakings),
    tap(() => titleLogger('Updating Cores Stakes'), updateStakesCores),
    tap(() => titleLogger('Checking Updated Cores Stakes'), _2checkCoreStakings),
    (accounts) => new Promise((resolve) => setTimeout(() => resolve(accounts), 120 * 1000)), // Wait for 120seconds before un-staking
    tap(() => titleLogger('Un-Staking Cores'), unStakeCores),
    tap(() => titleLogger('Checking Cores Un-stakings'), _3checkCoreStakings),
    tap(() => titleLogger('Approving Cores (Multi-sig)'), approveCoresMultiSig),
  )
  if (args.includes('--cores')) await cores(accounts);

  // 
  // Log results of E2E tests to stdout
  // 
  for (let i = 0; i < Object.keys(accounts).length; i++) {
    console.log('\n' + 'Account: ' + accounts[i].address);
    if (args.includes('--nodes')) {
      resultsLogger(accounts[i], 'INITIAL_BALANCE_TRANSFER', 'node')
      resultsLogger(accounts[i], 'INITIAL_BALANCE_CHECK', 'node')
      resultsLogger(accounts[i], 'REGISTRY_ALLOWANCE_APPROVAL', 'node')
      resultsLogger(accounts[i], 'REGISTRY_ALLOWANCE_APPROVAL_CHECK', 'node')
      resultsLogger(accounts[i], 'STAKE', 'node')
      resultsLogger(accounts[i], 'CHECK_STAKE', 'node')
      resultsLogger(accounts[i], 'UPDATED_STAKE', 'node')
      resultsLogger(accounts[i], 'CHECK_STAKE_UPDATED', 'node')
      resultsLogger(accounts[i], 'UN_STAKE', 'node')
      resultsLogger(accounts[i], 'CHECK_UN_STAKE', 'node')
    }
    
    if (args.includes('--cores')) {
      console.log('\n     ' + chalk.magenta('Core Actions:'))
      resultsLogger(accounts[i], 'STAKE', 'core')
      resultsLogger(accounts[i], 'CHECK_STAKE', 'core')
      resultsLogger(accounts[i], 'CHECK_STAKE_UPDATED', 'core')
      resultsLogger(accounts[i], 'UN_STAKE', 'core')
      resultsLogger(accounts[i], 'CHECK_UN_STAKE', 'core')
      resultsLogger(accounts[i], 'CORE_APPROVAL_MULTISIG', 'core')
    }
  }
})();