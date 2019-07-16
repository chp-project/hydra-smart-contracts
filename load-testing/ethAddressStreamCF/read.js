const {Datastore} = require('@google-cloud/datastore');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const R = require('ramda')
const _ = require('lodash')
const chalk = require('chalk')
const provider = require('../../e2e-testing/lib/utils/provider');
const tap = require('../../e2e-testing/lib/utils/tap');
const titleLogger = require('../../e2e-testing/lib/utils/titleLogger');
const resultsLogger = require('../../e2e-testing/lib/utils/resultsLogger');
const defaultAccounts = require('../../e2e-testing/lib/utils/accounts').accounts;
const { creditAccounts, creditAccountsEth, creditAccountsAsync, creditAccountsEthAsync, checkBalances } = require('../../e2e-testing/lib/1_accounts_scaffolding');

const adapter = new FileSync('db.json')
const db = low(adapter)

// TNT Amounts
const NODE_TNT_STAKE_AMOUNT = 550000000000;
const NODE_ETH_AMOUNT = '0.005';

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

async function getItem() {
  const projectId = 'tierion-iglesias';
  const datastore = new Datastore({
    projectId: projectId,
  });
}

async function batchDelete(accts) {
  const projectId = 'tierion-iglesias';
  const datastore = new Datastore({
    projectId: projectId,
  });

  for (let i = 0; i < accts.length; i++) {
    const key = _.get(accts[i], 'datastore.KEY', datastore.key(['EthAddress', accts[i].addr]));
    
    await datastore.delete(key);
  }
  console.log(chalk.green('Eth Addresses deleted: ' + accts.length))
}


async function main() {
  const args = process.argv.slice(2);
  const accounts = [defaultAccounts[0]]

  // Transfer ETH in parallel
  if (args.includes('--eth')) {
    // Read ETH Addresses from (DataStore: EthAddresses) and create a slice of the first 200elems to persist to local cache
    let batchAddresses = await read()
    let batchAddressesSlice = batchAddresses.splice(0, 100)
    // Persist 'batchAddressesSlice' to local cache
    db.set('stagingBatchAddresses', batchAddressesSlice).write()
    

    // Push EthAddresses to accounts
    batchAddressesSlice.forEach(currVal => accounts.push({ address: currVal.addr}))

    const accountsDictionary = accounts.reduce((acc, currVal, idx) => {
      acc[idx] = currVal
      
      return acc
    }, {})
    await Promise.all([creditAccountsEthAsync(NODE_ETH_AMOUNT, accountsDictionary)])
  }
  
  // Transfer $TKNs in parallel && Batch delete EthAddresses from DataStore: EthAddresses
  if (args.includes('--tkn')) {
    // Retrieve 'batchAddressesSlice' from local cache
    let batchAddressesSlice = db.get('stagingBatchAddresses').value()

    // Push EthAddresses to accounts
    batchAddressesSlice.forEach(currVal => accounts.push({ address: currVal.addr}))

    const accountsDictionary = accounts.reduce((acc, currVal, idx) => {
      acc[idx] = currVal
      
      return acc
    }, {})

    await Promise.all([creditAccountsAsync(NODE_TNT_STAKE_AMOUNT, accountsDictionary)])

    console.log('====================================');
    console.log(batchAddressesSlice.length);
    console.log('====================================');
    await batchDelete(batchAddressesSlice)
    db.unset('stagingBatchAddresses', batchAddressesSlice).write()
  }

  if (args.includes('--delete')) {
    let batchAddressesSlice = db.get('stagingBatchAddresses').value()

    console.log('====================================');
    console.log(batchAddressesSlice.length);
    console.log('====================================');

    await batchDelete(batchAddressesSlice)
    db.unset('stagingBatchAddresses', batchAddressesSlice).write()
  }

  let nodes = R.pipeP(
    tap(() => titleLogger('Checking Token Balances'), checkBalancesNodes),
  )
  await nodes(accounts);


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