var TierionNetworkToken = artifacts.require("TierionNetworkToken");
var ChainpointRegistry = artifacts.require("ChainpointRegistry");

module.exports = function(deployer) {
  // deployment steps
  deployer.deploy(TierionNetworkToken).then(function() {
    return deployer.deploy(ChainpointRegistry, TierionNetworkToken.address);
  });
};