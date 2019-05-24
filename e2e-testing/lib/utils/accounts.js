const ethers = require('ethers');
const provider = require('./provider');

function accounts() {
  const accts = {};

  for (let i = 0; i <= 9; i++) {
    accts[i] = ethers.Wallet.fromMnemonic(process.env.CHP_HYDRA_DEV_MNEMONIC, `${process.env.CHP_HYDRA_DEV_MNEMONIC_PATH}/${i}`);
    accts[i] = accts[i].connect(provider);
  }

  return accts;
}

function accountsFromPrivKey(privKeys = []) {
  const accounts = {};
  privKeys.unshift(null)

  for (let i = 0; i < privKeys.length; i++) {
    if (i === 0) {
      accounts[i] = ethers.Wallet.fromMnemonic(process.env.CHP_HYDRA_DEV_MNEMONIC, `${process.env.CHP_HYDRA_DEV_MNEMONIC_PATH}/${i}`);
    } else {
      accounts[i] = new ethers.Wallet(privKeys[i].privateKey);
      accounts[i].metadata = { ip: privKeys[i].ip}
    }
    accounts[i] = accounts[i].connect(provider);
  }

  return accounts;
}

module.exports.accounts = accounts()
module.exports.accountsFromPrivKey = accountsFromPrivKey