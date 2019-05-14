const path = require('path');
const fs = require('fs');
var TierionNetworkToken = artifacts.require("TierionNetworkToken");
var ChainpointRegistry = artifacts.require("ChainpointRegistry");
var ChainpointFaucet = artifacts.require("ChainpointFaucet");
var ChainpointMigration = artifacts.require("ChainpointMigration");
var OldTNT = artifacts.require("OldTNT");

module.exports = async function(deployer, network) {
  // 1. Deploy Faucet
  await deployer.deploy(ChainpointFaucet)
  fs.writeFileSync(path.resolve('./e2e-testing/artifacts/ropsten_faucet.txt'), ChainpointFaucet.address, 'utf8');

  // 2. Deploy OldTNT
  await deployer.deploy(OldTNT)
  fs.writeFileSync(path.resolve('./e2e-testing/artifacts/ropsten_old_token.txt'), OldTNT.address, 'utf8');

  // 3. Deploy CHP Migration
  await deployer.deploy(ChainpointMigration, OldTNT.address)
  fs.writeFileSync(path.resolve('./e2e-testing/artifacts/ropsten_migration.txt'), ChainpointMigration.address, 'utf8');

  // 4. Deploy New $TKN
  await deployer.deploy(TierionNetworkToken, ChainpointFaucet.address, ChainpointMigration.address)
  fs.writeFileSync(path.resolve('./e2e-testing/artifacts/ropsten_token.txt'), TierionNetworkToken.address, 'utf8');

  // 5. Deploy Registry
  await deployer.deploy(ChainpointRegistry, TierionNetworkToken.address);
  fs.writeFileSync(path.resolve('./e2e-testing/artifacts/ropsten_registry.txt'), ChainpointRegistry.address, 'utf8');
};