const path = require('path');
const fs = require('fs');
var ChainpointQuorum = artifacts.require("ChainpointQuorum");

module.exports = function(deployer, network) {
  if (network === 'rinkeby') {
    deployer.deploy(
      ChainpointQuorum, 
      fs.readFileSync(path.resolve('./e2e-testing/artifacts/rinkeby_token.txt'), 'utf8'),
      fs.readFileSync(path.resolve('./e2e-testing/artifacts/rinkeby_registry.txt'), 'utf8'),
    ).then(function() {
      fs.writeFileSync(path.resolve('./e2e-testing/artifacts/rinkeby_quorum.txt'), ChainpointQuorum.address, 'utf8');
  
      return Promise.resolve();
    });
  }
};