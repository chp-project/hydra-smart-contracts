const path = require('path');
const fs = require('fs');
const ethers = require('ethers');

async function generateDonorWallets() {
  let wallets = Array.apply(null, Array(10)).map(_ => {
    let w = ethers.Wallet.createRandom({ extraEntropy: ethers.utils.formatBytes32String(`${Date.now()}`) });

    return { address: w.address, privateKey: w.privateKey };
  });
  fs.writeFileSync(path.resolve(__dirname + '../../artifacts/wallets.json'), JSON.stringify(wallets));
}

module.exports = generateDonorWallets;
