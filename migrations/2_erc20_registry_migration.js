const path = require('path');
const fs = require('fs');
var TierionNetworkToken = artifacts.require("TierionNetworkToken");
var ChainpointRegistry = artifacts.require("ChainpointRegistry");
var ChainpointFaucet = artifacts.require("ChainpointFaucet");

module.exports = function(deployer, network) {
  // deployment steps
  deployer.deploy(ChainpointFaucet).then(function() {
    fs.writeFileSync(path.resolve('./e2e-testing/artifacts/ropsten_faucet.txt'), ChainpointFaucet.address, 'utf8');
    return deployer.deploy(TierionNetworkToken, ChainpointFaucet.address).then(function() {
      fs.writeFileSync(path.resolve('./e2e-testing/artifacts/ropsten_token.txt'), TierionNetworkToken.address, 'utf8');
      return deployer.deploy(ChainpointRegistry, TierionNetworkToken.address);
    }).then(function() {
      fs.writeFileSync(path.resolve('./e2e-testing/artifacts/ropsten_registry.txt'), ChainpointRegistry.address, 'utf8');
    })
  })
};