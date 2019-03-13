const path = require('path');
const fs = require('fs');
var TierionNetworkToken = artifacts.require("TierionNetworkToken");
var ChainpointRegistry = artifacts.require("ChainpointRegistry");
var ChainpointQuorum = artifacts.require("ChainpointQuorum");

module.exports = function(deployer, network) {
  // deployment steps
  deployer.deploy(TierionNetworkToken).then(function() {
    fs.writeFileSync(path.resolve(__dirname, 'e2e-testing/artifacts/ropsten_token.txt'), TierionNetworkToken.address, 'utf8');
    return deployer.deploy(ChainpointRegistry, TierionNetworkToken.address);
  }).then(function() {
    fs.writeFileSync(path.resolve(__dirname, 'e2e-testing/artifacts/ropsten_registry.txt'), ChainpointRegistry.address, 'utf8');
    return deployer.deploy(ChainpointQuorum, TierionNetworkToken.address, ChainpointRegistry.address);
  }).then(() => {
    fs.writeFileSync(path.resolve(__dirname, 'e2e-testing/artifacts/ropsten_quorum.txt'), ChainpointQuorum.address, 'utf8');
    return;
  })
};