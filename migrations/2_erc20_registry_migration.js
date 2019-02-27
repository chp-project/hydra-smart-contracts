var TierionNetworkToken = artifacts.require("TierionNetworkToken");
var ChainpointRegistry = artifacts.require("ChainpointRegistry");
var ChainpointQuorum = artifacts.require("ChainpointQuorum");

module.exports = function(deployer, network) {
  // deployment steps
  deployer.deploy(TierionNetworkToken).then(function() {
    return deployer.deploy(ChainpointRegistry, TierionNetworkToken.address);
  }).then(function() {
    return deployer.deploy(ChainpointQuorum, TierionNetworkToken.address, ChainpointRegistry.address);
  });
};