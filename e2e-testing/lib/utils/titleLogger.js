const chalk = require('chalk');

module.exports = function (heading) {
  console.log('\n' + chalk.yellow(`${heading}:`));
}