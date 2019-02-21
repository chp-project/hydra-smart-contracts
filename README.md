# Chainpoint Smart Contracts

### Ropsten Chain (QA)

| Contract  | Address |
| ------------- | ------------- |
| TierionNetworkToken (TNT)  | [0xcBC9D2A75D2a02222Cd4d067B805999445cF4a48](https://ropsten.etherscan.io/address/0xcBC9D2A75D2a02222Cd4d067B805999445cF4a48) |
| ChainpointRegistry | [0x316e8C0189cC319711903fDaEB1BB029D5766F0A](https://ropsten.etherscan.io/address/0x316e8C0189cC319711903fDaEB1BB029D5766F0A) |

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