const _ = require('lodash');
const chalk = require('chalk');
const logSymbols = require('log-symbols');

module.exports = function(account, testCase, entity) {
  const result = _.get(account, `e2eTesting.${entity}.${testCase}`, 'defer')

  if (result === true) {
    console.log('   ' + chalk.green(logSymbols.success) + ' ' + chalk.gray(testCase));
  } else if (result === false) {
    console.log('   ' + chalk.red(logSymbols.error) + ' ' + chalk.dim.red(testCase));
  } else {
    console.log('   ' + chalk.yellow(logSymbols.warning) + ' ' + chalk.gray(testCase));
  }
}