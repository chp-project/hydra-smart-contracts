# Chainpoint Smart Contracts

### Ropsten Chain (QA)

| Contract  | Address |
| ------------- | ------------- |
| TierionNetworkToken (TNT)  | [0x08fDc2a013C497103E44c0f3786c4209E27F0E78](https://ropsten.etherscan.io/address/0x08fDc2a013C497103E44c0f3786c4209E27F0E78) |
| ChainpointRegistry | [0xe867371f85F259014C5c2f7CdD3DB349D5Fef67B](https://ropsten.etherscan.io/address/0xe867371f85F259014C5c2f7CdD3DB349D5Fef67B) |
| ChainpointQuorum | [0xce70e2FbD34F4C60fbE9ebcBF8327b6Ea6ada979](https://ropsten.etherscan.io/address/0xce70e2FbD34F4C60fbE9ebcBF8327b6Ea6ada979) |

<!-- ### Kovan Chain (STAGING)

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