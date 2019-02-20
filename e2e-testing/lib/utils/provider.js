const ethers = require('ethers');

module.exports = (function() {
  if (process.env.ETH_ENVIRONMENT === 'development') return new ethers.providers.JsonRpcProvider("http://localhost:8545")
  else if (process.env.ETH_ENVIRONMENT === 'qa') return ethers.getDefaultProvider('ropsten')
  else return ethers.getDefaultProvider('ropsten')
})();