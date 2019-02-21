const ethers = require('ethers');
const provider = require('./provider');

module.exports = (function() {
  const accounts = {};

  for (let i = 0; i <= 9; i++) {
    accounts[i] = ethers.Wallet.fromMnemonic(process.env.CHP_HYDRA_DEV_MNEMONIC, `${process.env.CHP_HYDRA_DEV_MNEMONIC_PATH}/${i}`);
    accounts[i] = accounts[i].connect(provider);
  }

  return accounts;
})();