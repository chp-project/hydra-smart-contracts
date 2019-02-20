const ethers = require('ethers');
const provider = require('./lib/utils/provider');
const accounts = require('./lib/1_accounts');

// const account001 = new ethers.Wallet("77e2f62eeca451bb85f22a26bea960770124045af8319934010112b98f8a75e8", provider);
// const account002 = new ethers.Wallet("30257e52cec8464ed7bc8a45ef62dcecb8ef478bdc47a5223323b7b4079da08d", provider);
const account001 = accounts[0]
const account002 = accounts[1]

const TOKEN_CONTRACT_ADDRESS = "0x9105a3b44075bb0BE3E5A328Fc14367ce88bd27f";
const REGISTRY_CONTRACT_ADDRESS = "0xBCFD345565283689d21EB1bA6ea88f58d193fd5d";

// Deployment is asynchronous, so we use an async IIFE
(async function() {
  // Notice we pass in "Hello World" as the parameter to the constructor
  let tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, require('../build/contracts/TierionNetworkToken.json').abi, account001);
  // Deploy Registry contract
  let registryContract = new ethers.Contract(REGISTRY_CONTRACT_ADDRESS, require('../build/contracts/ChainpointRegistry.json').abi, account001);
  
  ///
  /// Check balance of Owner
  ///
  let res1 = await tokenContract.balanceOf(account001.address);

  console.log('====================================');
  console.log(res1.toString(), 'res1');
  console.log('====================================');

  let res2 = await tokenContract.transfer("0xc6a7897cc8f2e3b294844a07165573c6194324ab", 500000000000);
  await res2.wait();

  let res3 = await tokenContract.balanceOf(account001.address);
  let res3a = await tokenContract.balanceOf("0xc6a7897cc8f2e3b294844a07165573c6194324ab");

  console.log('====================================');
  console.log(res3.toString(), res3a.toString(), 'res3');
  console.log('====================================');

  ///
  /// Assume Account002 identity to grant allowance for Registry contract of 5000TNT
  ///
  let contractAccount002 = tokenContract.connect(account002);

  let res4 = await contractAccount002.approve(REGISTRY_CONTRACT_ADDRESS, 500000000000);
  await res4.wait();

  let res5 = await contractAccount002.allowance("0xc6a7897cc8f2e3b294844a07165573c6194324ab", REGISTRY_CONTRACT_ADDRESS);

  console.log('====================================');
  console.log(res5.toString(), 'res5 -> ontractAccount002.allowance');
  console.log('====================================');

  ///
  /// Assume Account002 identity, who is a Node Operator, to stake into the Registry
  ///
  let registryAccount001 = registryContract.connect(account001);
  let registryAccount002 = registryContract.connect(account002);

  let result_node_staking = await registryAccount002.stake("0xc5bd25dd2f64a2f6db33ee6871fc833f82ac5fc9fecc4e0770be3c68b61bb0a0", "0xc5bd25dd2f64a2f6db33ee6871fc833f82ac5fc9fecc4e0770be3c68b61bb0a0");
  await result_node_staking.wait();

  let result_node_staking_confirmation = await registryAccount002.nodes("0xc6a7897cc8f2e3b294844a07165573c6194324ab");

  console.log('====================================');
  console.log(result_node_staking_confirmation, 'result_node_staking_confirmation');
  console.log('====================================');

  let whitelistCore = await registryAccount001.whitelistCore("0xc6a7897cc8f2e3b294844a07165573c6194324ab");
  await whitelistCore.wait();

  console.log('====================================');
  console.log(whitelistCore, 'whitelistCore');
  console.log('====================================');

  let result_node_update_stake = await registryAccount002.updateStake("0x48656c6c6f20576f726c64210000000000000000000000000000000000000000", "0x48656c6c6f20576f726c64210000000000000000000000000000000000000000");
  await result_node_update_stake.wait();
  
  let result_node_update_stake_confirmation = await registryAccount002.nodes("0xc6a7897cc8f2e3b294844a07165573c6194324ab");

  console.log('====================================');
  console.log(result_node_update_stake_confirmation, 'result_node_update_stake_confirmation');
  console.log('====================================');

  await (new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, 150 * 1000); // 2.5mins
  }));

  let result_node_un_stake = await registryAccount002.unStake();
  await result_node_un_stake.wait();

  let result_node_un_stake_confirmation = await registryAccount002.nodes("0xc6a7897cc8f2e3b294844a07165573c6194324ab");

  console.log('====================================');
  console.log(result_node_un_stake_confirmation, 'result_node_un_stake_confirmation');
  console.log('====================================');

})();