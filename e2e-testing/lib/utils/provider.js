const ethers = require('ethers');

module.exports = (function() {
  if (process.env.ETH_ENVIRONMENT === 'DEVELOPMENT') return new ethers.providers.JsonRpcProvider("http://localhost:8545")
  else if (process.env.ETH_ENVIRONMENT === 'GANACHE') return new ethers.providers.JsonRpcProvider("http://localhost:7545")
  else if (process.env.ETH_ENVIRONMENT === 'ROPSTEN') return ethers.getDefaultProvider('ropsten')
  else if (process.env.ETH_ENVIRONMENT === 'RINKEBY') return ethers.getDefaultProvider('rinkeby')
  else return ethers.getDefaultProvider('ropsten')
})();