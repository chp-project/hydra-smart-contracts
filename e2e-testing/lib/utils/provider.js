const ethers = require('ethers');

module.exports = (function() {
  if (process.env.ETH_ENVIRONMENT === 'development') return new ethers.providers.JsonRpcProvider("http://localhost:8545")
  else if (process.env.ETH_ENVIRONMENT === 'ropsten') return ethers.getDefaultProvider('ropsten')
  else if (process.env.ETH_ENVIRONMENT === 'rinkeby') return ethers.getDefaultProvider('rinkeby')
  else return ethers.getDefaultProvider('ropsten')
})();