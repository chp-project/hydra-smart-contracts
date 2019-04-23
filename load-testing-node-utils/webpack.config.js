const fs = require('fs')
const path = require('path');
const webpack = require('webpack')

module.exports = {
  entry: ['@babel/polyfill', './index.js'],
  target: 'node',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  plugins: [
    new webpack.BannerPlugin({banner: '#!/usr/bin/env node', raw: true}),
    new webpack.EnvironmentPlugin({
      ETH_ENVIRONMENT: 'ROPSTEN', // use 'development' unless process.env.NODE_ENV is defined
      ROPSTEN_TOKEN_CONTRACT_ADDRESS: fs.readFileSync(path.resolve('../artifacts/ethcontracts/token.txt'), 'utf8'),
      ROPSTEN_REGISTRY_CONTRACT_ADDRESS: fs.readFileSync(path.resolve('../artifacts/ethcontracts/registry.txt'), 'utf8')
    })
  ]
};