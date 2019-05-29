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
const { creditAccounts, approveAllowances} = require('./lib/1_accounts_scaffolding');
const { approveCores, approveCoresMultiSig, stakeCores, unStakeCores } = require('./lib/2a_core_staking_actions');
const { setChpRegistry, mint, mintThrowSameSig, mintThrowMissingSig, mintThrowWrongSig, mintCores } = require('./lib/3_tnt_mint');

const CORE_TNT_STAKE_AMOUNT = 2500000000000;

const creditAccountsCores = R.curry(creditAccounts)('$TKN')(CORE_TNT_STAKE_AMOUNT);
const approveAllowancesCores = R.curry(approveAllowances)('registry')(CORE_TNT_STAKE_AMOUNT);

// These PrivKeys are those being used by testnet Cores
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

async function main() {
  // Chainpoint Hydra Smart Contract Testing Suite
  cliHelloLogger();

  let actions = R.pipeP(
    tap(() => titleLogger('Set Chainpoint Registry contract addresses and bootstrap'), setChpRegistry),
    tap(() => titleLogger('Transferring Tokens'), creditAccountsCores),
    tap(() => titleLogger('Approving Allowances'), approveAllowancesCores),
    tap(() => titleLogger('Approving Cores'), approveCores),
    tap(() => titleLogger('Cores Staking'), stakeCores),
    tap(() => titleLogger('Invoke mint() MINT_THROW_SAME_SIG'), mintThrowSameSig),
    tap(() => titleLogger('Invoke mint() MINT_MISSING_SIG'), mintThrowMissingSig),
    tap(() => titleLogger('Invoke mint() MINT_THROW_WRONG_SIG'), mintThrowWrongSig),
    tap(() => titleLogger('Invoke mint()'), mint)
    tap(() => titleLogger('Invoke mintCores()'), mintCores)
    tap(() => titleLogger('Approving Cores (Multi-sig)'), approveCoresMultiSig),
  )
  await actions(accounts);

  for (let i = 0; i < Object.keys({0: accounts[0], 1: accounts[1]}).length; i++) {
    console.log('\n' + accounts[i].address + ':');
    resultsLogger(accounts[i], 'SET_CHP_REGISTRY_CONTRACT', 'mint.token');
    resultsLogger(accounts[i], 'MINT_THROW_SAME_SIG', 'mint.token');
    resultsLogger(accounts[i], 'MINT_MISSING_SIG', 'mint.token');
    resultsLogger(accounts[i], 'MINT_THROW_WRONG_SIG', 'mint.token');
    resultsLogger(accounts[i], 'MINT_INVOKED', 'mint.token');
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