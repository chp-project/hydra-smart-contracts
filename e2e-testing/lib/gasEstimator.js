const ethers = require('ethers');

const provider = (function() {
  if (process.env.ETH_ENVIRONMENT === 'development') return new ethers.providers.JsonRpcProvider("http://localhost:8545")
  else if (process.env.ETH_ENVIRONMENT === 'qa') return ethers.getDefaultProvider('ropsten')
  else return ethers.getDefaultProvider('ropsten')
})();

const account001 = new ethers.Wallet("77e2f62eeca451bb85f22a26bea960770124045af8319934010112b98f8a75e8", provider);
const account002 = new ethers.Wallet("30257e52cec8464ed7bc8a45ef62dcecb8ef478bdc47a5223323b7b4079da08d", provider);

const TOKEN_CONTRACT_ADDRESS = "0xD306cCbB98a7a7880036d7e56cD581310990f2CB";
const REGISTRY_CONTRACT_ADDRESS = "0x9730D05d17EfB6E0dc4Ddd3f0755627FBeb01C13";

let tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, require('../../build/contracts/TierionNetworkToken.json').abi, account001);
let registryContract = new ethers.Contract(REGISTRY_CONTRACT_ADDRESS, require('../../build/contracts/ChainpointRegistry.json').abi, account001);

debugger;

let result = tokenContract.mint.estimateGas(["0xc6a7897cc8f2e3b294844a07165573c6194324ab"], {from: '0xae9d2422C95c2253EeF6C015705C3777992f1959'});

console.log('====================================');
console.log(result, 'result');
console.log('====================================');