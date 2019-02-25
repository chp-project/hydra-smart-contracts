var TierionNetworkToken = artifacts.require("TierionNetworkToken");
var ChainpointRegistry = artifacts.require("ChainpointRegistry");
var ChainpointQuorum = artifacts.require("ChainpointQuorum");

// CHP_HYDRA_DEV_MNEMONIC_PATH=

module.exports = function(deployer) {
  // deployment steps
  deployer.deploy(TierionNetworkToken).then(function() {
    return deployer.deploy(ChainpointRegistry, TierionNetworkToken.address);
  }).then(function() {
    return deployer.deploy(ChainpointQuorum, TierionNetworkToken.address, ChainpointRegistry.address);
  });
};