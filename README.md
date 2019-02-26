# Chainpoint Smart Contracts

### Ropsten Chain (QA)

| Contract  | Address |
| ------------- | ------------- |
| TierionNetworkToken (TNT)  | [0x471c811a7949859Cd748C890F10541cd332c640B](https://ropsten.etherscan.io/address/0x471c811a7949859Cd748C890F10541cd332c640B) |
| ChainpointRegistry | [0x6Eb270a9a5D02112215359b0d2aaE93652526A66](https://ropsten.etherscan.io/address/0x6Eb270a9a5D02112215359b0d2aaE93652526A66) |
| ChainpointQuorum | [0x8dB2c20b8DD65B808Ed2Cd4EBB7c5Fbae2f0182c](https://ropsten.etherscan.io/address/0x8dB2c20b8DD65B808Ed2Cd4EBB7c5Fbae2f0182c) |

<!-- ### Rinkeby Chain (STAGING)

| Contract  | Address |
| ------------- | ------------- |
| TierionNetworkToken (TNT)  | [0xB0713EDb6Bb0c5b9156f97D129C7945362fBfE7D](https://rinkeby.etherscan.io/address/0xB0713EDb6Bb0c5b9156f97D129C7945362fBfE7D) |
| ChainpointRegistry | [0x1AFDaF7eb8dA7Dd8E4aA62C2C75f835FD77cC270](https://rinkeby.etherscan.io/address/0x1AFDaF7eb8dA7Dd8E4aA62C2C75f835FD77cC270) |
| ChainpointQuorum | [0x4C10314849b7e9efc19b9EBF324E6268d07F1D16](https://rinkeby.etherscan.io/address/0x4C10314849b7e9efc19b9EBF324E6268d07F1D16) | -->

### ChainpointRegistry Spec

> Implements: Pausable

```js
function stake(bytes32 _nodeIp, bytes32 _nodePublicKey, uint256 _amount, uint256 _duration) public returns (bool);
```

# Testing

Environment Variables Needed:
```
export CHP_HYDRA_DEV_MNEMONIC=""
export CHP_HYDRA_DEV_MNEMONIC_PATH="m/44'/60'/0'/0"
export ETH_ENVIRONMENT=""
export <ETH_ENVIRONMENT>_TOKEN_CONTRACT_ADDRESS=""
export <ETH_ENVIRONMENT>_REGISTRY_CONTRACT_ADDRESS=""
```