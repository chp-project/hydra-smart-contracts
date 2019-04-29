const fs = require('fs')
const path = require('path');
const _ = require('lodash')
const webpack = require('webpack')

const TierionNetworkToken = require(path.resolve('../artifacts/ethcontracts/TierionNetworkToken.json'))
const ChainpointRegistry = require(path.resolve('../artifacts/ethcontracts/ChainpointRegistry.json'))

const chainId = process.env.ETH_ENVIRONMENT === 'ROPSTEN' ? 3 : 3

console.log(_.get(TierionNetworkToken, `networks.${chainId}.address`), 'A')

module.exports = {
  entry: ['@babel/polyfill', './index.js'],
  target: 'node',
  devtool: "eval-source-map",
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
      ROPSTEN_TOKEN_CONTRACT_ADDRESS: _.get(TierionNetworkToken, `networks.${chainId}.address`),
      ROPSTEN_REGISTRY_CONTRACT_ADDRESS: _.get(ChainpointRegistry, `networks.${chainId}.address`)
    })
  ]
};