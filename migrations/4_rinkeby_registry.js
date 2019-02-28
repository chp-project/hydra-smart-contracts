const path = require('path');
const fs = require('fs');
var ChainpointRegistry = artifacts.require("ChainpointRegistry");

module.exports = function(deployer, network) {
  if (network === 'rinkeby') {
    deployer.deploy(ChainpointRegistry, fs.readFileSync(path.resolve('./e2e-testing/artifacts/rinkeby_token.txt'), 'utf8')).then(function() {
      fs.writeFileSync(path.resolve('./e2e-testing/artifacts/rinkeby_registry.txt'), ChainpointRegistry.address, 'utf8');
  
      return Promise.resolve();
    });
  }
  return Promise.resolve();
};