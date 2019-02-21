# Chainpoint Smart Contracts

### Ropsten Chain (QA)

| Contract  | Address |
| ------------- | ------------- |
| TierionNetworkToken (TNT)  | [0x61AFCf2BD208CB0aAe05e4233Ba518FB953b1A2e](https://ropsten.etherscan.io/address/0x61AFCf2BD208CB0aAe05e4233Ba518FB953b1A2e) |
| ChainpointRegistry | [0x9193e4B496658BA1c3Cf87c34F077Fa129b23901](https://ropsten.etherscan.io/address/0x9193e4B496658BA1c3Cf87c34F077Fa129b23901) |

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