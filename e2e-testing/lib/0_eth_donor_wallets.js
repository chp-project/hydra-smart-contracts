const path = require('path');
const fs = require('fs');
const ethers = require('ethers');
const provider = require('./utils/provider');

async function generateDonorWallets() {
  let wallets = Array.apply(null, Array(10)).map(_ => {
    let w = ethers.Wallet.createRandom({ extraEntropy: ethers.utils.formatBytes32String(`${Date.now()}`) });

    return { address: w.address, privateKey: w.privateKey };
  });
  fs.writeFileSync(path.resolve(__dirname + '../../artifacts/wallets.json'), JSON.stringify(wallets));
}

function generateDonorWalletsBulk(count) {
  let accts = {};

  for (let i = 1; i <= count; i++) {
    let w = ethers.Wallet.createRandom({ extraEntropy: ethers.utils.formatBytes32String(`${Date.now()}`) });
    accts[i] = w.connect(provider);
  }

  return accts;
}

module.exports.generateDonorWallets = generateDonorWallets;
module.exports.generateDonorWalletsBulk = generateDonorWalletsBulk;