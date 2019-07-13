const ChainpointFaucet = artifacts.require("ChainpointFaucet");
const TierionNetworkToken = artifacts.require("TierionNetworkToken");
const ChainpointRegistry = artifacts.require("ChainpointRegistry");
const ethers = require('ethers');
const web3 = require('web3');

contract("TierionNetworkToken", async (accounts) => {
  it("should put 1000000000 * (10 ** 8) Grains in the first account", async () => {
    let faucetContract = await ChainpointFaucet.deployed();
    let tokenContract = await TierionNetworkToken.deployed();
    
    let balance = await tokenContract.balanceOf.call(faucetContract.address);
    let balance1 = await tokenContract.balanceOf.call(accounts[0]);

    assert.equal(balance.valueOf(), 1000000 * (10 ** 8));
    assert.equal(balance1.valueOf(), 100000000000000000);
  });

  it("should return 1000000 * (10 ** 8) Grains as totalSupply", async () => {
    let tokenContract = await TierionNetworkToken.deployed();
    let balance = await tokenContract.totalSupply.call();

    assert.equal(balance.valueOf(), 100000000000000000 + 1000000 * (10 ** 8));
  });

  it("should transfer 500000000000 Grains from Account #0 -> Account #1", async () => {
    let tokenContract = await TierionNetworkToken.deployed();
    await tokenContract.transfer(accounts[1], 500000000000, { from: accounts[0] })
    let balance = await tokenContract.balanceOf.call(accounts[1]);
    assert.equal(balance.valueOf(), 500000000000);
  });

  it("should grant allowance of 500000000000 Grains to Account #0 on behalf of Account #1", async () => {
    let tokenContract = await TierionNetworkToken.deployed();
    let registryContract = await ChainpointRegistry.deployed();

    await tokenContract.approve(accounts[0], 500000000000, { from: accounts[1] })
    let allowance = await tokenContract.allowance(accounts[1], accounts[0]);

    assert.equal(allowance.valueOf(), 500000000000);
  });

  it("should transfer 500000000000 grains from Account #1 -> Account #0 after allowance has been granted", async () => {
    let tokenContract = await TierionNetworkToken.deployed();
    let registryContract = await ChainpointRegistry.deployed();

    await tokenContract.transferFrom(accounts[1], accounts[0], 500000000000, { from: accounts[0] })
    let balance = await tokenContract.balanceOf.call(accounts[0]);

    assert.equal(balance.valueOf(), 500000000000);
  });

});