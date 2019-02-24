# Chainpoint Smart Contracts

### Ropsten Chain (QA)

| Contract  | Address |
| ------------- | ------------- |
| TierionNetworkToken (TNT)  | [0xB0713EDb6Bb0c5b9156f97D129C7945362fBfE7D](https://ropsten.etherscan.io/address/0xB0713EDb6Bb0c5b9156f97D129C7945362fBfE7D) |
| ChainpointRegistry | [0x1AFDaF7eb8dA7Dd8E4aA62C2C75f835FD77cC270](https://ropsten.etherscan.io/address/0x1AFDaF7eb8dA7Dd8E4aA62C2C75f835FD77cC270) |
| ChainpointQuorum | [0x4C10314849b7e9efc19b9EBF324E6268d07F1D16](https://ropsten.etherscan.io/address/0x4C10314849b7e9efc19b9EBF324E6268d07F1D16) |

<!-- ### Kovan Chain (STAGING) -->

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