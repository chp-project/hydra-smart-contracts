const path = require('path');
const fs = require('fs');
var TierionNetworkToken = artifacts.require("TierionNetworkToken");

module.exports = function(deployer, network) {
  if (network === 'rinkeby') {
    deployer.deploy(TierionNetworkToken).then(function() {
      fs.writeFileSync(path.resolve('./e2e-testing/artifacts/rinkeby_token.txt'), TierionNetworkToken.address, 'utf8');
  
      return Promise.resolve();
    });
  }
};