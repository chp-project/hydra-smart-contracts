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

function accountsFromPrivKey(privKeys = []) {
  const accounts = {};
  privKeys.unshift(null)

  for (let i = 0; i < privKeys.length; i++) {
    if (i === 0) {
      accounts[i] = ethers.Wallet.fromMnemonic(process.env.CHP_HYDRA_DEV_MNEMONIC, `${process.env.CHP_HYDRA_DEV_MNEMONIC_PATH}/${i}`);
    } else {
      accounts[i] = new ethers.Wallet(privKeys[i]);
    }
    accounts[i] = accounts[i].connect(provider);
  }

  return accounts;
}

module.exports.accountsFromPrivKey = accountsFromPrivKey