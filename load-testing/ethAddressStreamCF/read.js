const {Datastore} = require('@google-cloud/datastore');
const R = require('ramda')
const chalk = require('chalk')
const provider = require('../../e2e-testing/lib/utils/provider');
const tap = require('../../e2e-testing/lib/utils/tap');
const titleLogger = require('../../e2e-testing/lib/utils/titleLogger');
const resultsLogger = require('../../e2e-testing/lib/utils/resultsLogger');
const defaultAccounts = require('../../e2e-testing/lib/utils/accounts').accounts;
const { creditAccounts, creditAccountsEth, creditAccountsAsync, creditAccountsEthAsync, checkBalances } = require('../../e2e-testing/lib/1_accounts_scaffolding');

// TNT Amounts
const NODE_TNT_STAKE_AMOUNT = 600000000000;
const NODE_ETH_AMOUNT = '0.02';

// Transfer TNT Tokens to Accounts
let creditAccountsNodes = R.curry(creditAccounts)('$TKN')(NODE_TNT_STAKE_AMOUNT);
let creditAccountsNodesEth = R.curry(creditAccountsEth)(NODE_ETH_AMOUNT);

// Check that balances of Nodes and Cores match the default amount of TNT that has been tranferred to each
const checkBalancesNodes = R.curry(checkBalances)('$TKN')(NODE_TNT_STAKE_AMOUNT);

async function read() {
  const projectId = 'tierion-iglesias';
  const datastore = new Datastore({
    projectId: projectId,
  });

  const query = datastore.createQuery('EthAddress')

  const [results] = await datastore.runQuery(query);

  return results
}

async function batchDelete(accts) {
  const projectId = 'tierion-iglesias';
  const datastore = new Datastore({
    projectId: projectId,
  });

  for (let i = 0; i < accts.length; i++) {
    const key = accts[i][datastore.KEY];
    
    await datastore.delete(key);
  }
  console.log(chalk.green('Eth Addresses deleted: ' + accts.length))
}


async function main() {
  const accounts = [defaultAccounts[0]]

  // Read ETH Addresses from DataStore: EthAddresses
  let batchAddresses = await read()

  // Push EthAddresses to accounts
  batchAddresses.forEach(currVal => accounts.push({ address: currVal.addr}))

  const accountsDictionary = accounts.reduce((acc, currVal, idx) => {
    acc[idx] = currVal
    
    return acc
  }, {})

  // Transfer $TKNs & ETH in parallel
  await Promise.all([
    creditAccountsAsync(NODE_TNT_STAKE_AMOUNT, accountsDictionary),
    creditAccountsEthAsync(NODE_ETH_AMOUNT, accountsDictionary)
  ])

  let nodes = R.pipeP(
    tap(() => titleLogger('Checking Token Balances'), checkBalancesNodes),
  )
  await nodes(accounts);

  // Batch delete EthAddresses from DataStore: EthAddresses
  await batchDelete(batchAddresses)

  // Display Results
  for (let i = 1; i < Object.keys(accounts).length; i++) {
    console.log('\n' + 'Account: ' + accounts[i].address);
    resultsLogger(accounts[i], 'INITIAL_BALANCE_CHECK', 'node')
  }
}

main()
  .then(results => {
    console.log(results, 'results')
  })
  .catch(err => {
    console.error(err)
  })

module.exports.read = read