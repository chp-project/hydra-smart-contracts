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
const { creditAccounts, approveAllowances} = require('./lib/1_accounts_scaffolding');
const { stakeCores, unStakeCores } = require('./lib/2a_core_staking_actions');
const { setChpQuorumAndBootstrap, checkRegisteredBallots, mint } = require('./lib/3_tnt_quorum');

const CORE_TNT_STAKE_AMOUNT = 2500000000000;

const creditAccountsCores = R.curry(creditAccounts)(CORE_TNT_STAKE_AMOUNT);
const approveAllowancesCores = R.curry(approveAllowances)(CORE_TNT_STAKE_AMOUNT);

(async function () {
  // Chainpoint Hydra Smart Contract Testing Suite
  cliHelloLogger();

  let actions = R.pipeP(
    // tap(() => titleLogger('Set Chainpoint Quorum contract and bootstrap'), setChpQuorumAndBootstrap),
    tap(() => titleLogger('Transferring Tokens'), creditAccountsCores),
    tap(() => titleLogger('Approving Allowances'), approveAllowancesCores),
    tap(() => titleLogger('Cores Staking'), stakeCores),
    tap(() => titleLogger('Check Registered Ballot for mint()'), checkRegisteredBallots),
    tap(() => titleLogger('Invoke mint()'), mint)
  )
  await actions({0: accounts[0], 1: accounts[1]});

  for (let i = 0; i < Object.keys(accounts).length; i++) {
    console.log(accounts[i].address + ':');
    resultsLogger(accounts[i], 'SET_CHP_QUORUM_CONTRACT', 'quorum.token');
    resultsLogger(accounts[i], 'MINT_BALLOT_REGISTERED', 'quorum.token');
    resultsLogger(accounts[i], 'MINT_INVOKED', 'quorum.token');
  }
  
})();