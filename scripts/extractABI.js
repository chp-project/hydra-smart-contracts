const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const abi = require(`../build/contracts/${args[1]}.json`).abi;

fs.writeFileSync(path.resolve(`./build/contracts/${args[1]}.abi`), JSON.stringify(abi));