const ethers = require('ethers');
const R = require('ramda');
const _ = require('lodash');
const chalk = require('chalk');
const async = require('async')
const tap = require('./lib/utils/tap');
const cliHelloLogger = require('./lib/utils/cliHelloLogger');
const resultsLogger = require('./lib/utils/resultsLogger');
const titleLogger = require('./lib/utils/titleLogger');
const provider = require('./lib/utils/provider');
const defaultAccounts = require('./lib/utils/accounts').accounts;
const {accountsFromPrivKey} = require('./lib/utils/accounts');
const {generateDonorWalletsBulk} = require('./lib/0_eth_donor_wallets');
const { creditAccounts, creditAccountsEth, creditAccountsAsync, creditAccountsEthAsync, checkBalances, approveAllowances, checkAllowances} = require('./lib/1_accounts_scaffolding');
const { stakeNodes, checkNodeStakings } = require('./lib/2_staking_actions');

const accounts = Object.assign({}, generateDonorWalletsBulk(5))
accounts[0] = defaultAccounts[0]

// TNT Amounts
const NODE_TNT_STAKE_AMOUNT = 500000000000;
const NODE_ETH_AMOUNT = '0.02';

// Transfer TNT Tokens to Accounts
let creditAccountsNodes = R.curry(creditAccounts)(NODE_TNT_STAKE_AMOUNT);
let creditAccountsNodesEth = R.curry(creditAccountsEth)(NODE_ETH_AMOUNT);

// Check that balances of Nodes and Cores match the default amount of TNT that has been tranferred to each
const checkBalancesNodes = R.curry(checkBalances)(NODE_TNT_STAKE_AMOUNT);
// Grant allowances to the ChainpointRegistry Contract on behalf of every Node or Core
const approveAllowancesNodes = R.curry(approveAllowances)(NODE_TNT_STAKE_AMOUNT);
// Check allowances granted to the ChainpointRegistry Contract
const checkAllowancesNodes = R.curry(checkAllowances)(NODE_TNT_STAKE_AMOUNT);

(async function() {
  // Chainpoint Hydra Smart Contract Testing Suite
  cliHelloLogger();

  // Transfer $TKNs & ETH in parallel
  await Promise.all([
    creditAccountsAsync(NODE_TNT_STAKE_AMOUNT, accounts),
    creditAccountsEthAsync(NODE_ETH_AMOUNT, accounts)
  ])
  // Check $TKN balance and approve spending allowance to the Chainpoint Registry Contract
  let nodes = R.pipeP(
    tap(() => titleLogger('Checking Token Balances'), checkBalancesNodes),
    tap(() => titleLogger('Approving Allowances'), approveAllowancesNodes),
    tap(() => titleLogger('Checking Allowances'), checkAllowancesNodes)
  )
  await nodes(accounts);

  // Stake Nodes in bulk
  console.log('\n' + chalk.magenta('Staking Nodes (bulk):'));

  delete accounts[0]
  async.parallel(
    Object.keys(accounts).map(idx => {
      return (cb) => {
        stakeNodes(Object.assign({}, {0: accounts[idx]}, {[1]: accounts[idx]}))
          .then(res => cb(null, res))
          .catch(err => cb(err, null))
      }
    }),
    function (err, results) {
      if (err) {
        console.error(err, 'err')
      } else {
        console.log('====================================');
        console.log('Nodes Staked successfully');
        console.log('====================================');
      }
    }
  )

})();