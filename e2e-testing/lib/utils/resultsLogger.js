const _ = require('lodash');
const chalk = require('chalk');
const logSymbols = require('log-symbols');

module.exports = function(account, testCase, entity) {
  const resultObj = _.get(account, `e2eTesting.${entity}.${testCase}`, 'defer')

  if (resultObj.passed === true) {
    console.log('   ' + chalk.green(logSymbols.success) + ' ' + chalk.gray(testCase) + ` (gas used: ${resultObj.gasUsed})`);
  } else if (resultObj.passed === false) {
    console.log('   ' + chalk.red(logSymbols.error) + ' ' + chalk.dim.red(testCase) + ` (gas used: ${resultObj.gasUsed})`);
  } else {
    console.log('   ' + chalk.yellow(logSymbols.warning) + ' ' + chalk.gray(testCase) + ` (gas used: ${resultObj.gasUsed})`);
  }
}