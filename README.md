# Chainpoint Smart Contracts

### Ropsten Chain (QA)

| Contract  | Address |
| ------------- | ------------- |
| TierionNetworkToken (TNT)  | [0xC58f7d9a97bE0aC0084DBb2011Da67f36A0deD9F](https://ropsten.etherscan.io/address/0xC58f7d9a97bE0aC0084DBb2011Da67f36A0deD9F) |
| ChainpointRegistry | [0x5AfdE9fFFf63FF1f883405615965422889B8dF29](https://ropsten.etherscan.io/address/0x5AfdE9fFFf63FF1f883405615965422889B8dF29) |
| ChainpointQuorum | [0xa39454DF0aa7E38d86E2106920D57d0643e7c8D7](https://ropsten.etherscan.io/address/0xa39454DF0aa7E38d86E2106920D57d0643e7c8D7) |

### Rinkeby Chain (STAGING)

| Contract  | Address |
| ------------- | ------------- |
| TierionNetworkToken (TNT)  | [0x4Eb6b957cEaB790eA30667Ff85aB6199247147a6](https://rinkeby.etherscan.io/address/0x4Eb6b957cEaB790eA30667Ff85aB6199247147a6) |
| ChainpointRegistry | [0xb759bce43567C6d202aD40f1E026cf6460aB6857](https://rinkeby.etherscan.io/address/0xb759bce43567C6d202aD40f1E026cf6460aB6857) |
| ChainpointQuorum | [0x1f61DA415c68bf2593F4eb40f5ecaB9c514cf109](https://rinkeby.etherscan.io/address/0x1f61DA415c68bf2593F4eb40f5ecaB9c514cf109) |

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
export <ETH_ENVIRONMENT>_QUORUM_CONTRACT_ADDRESS=""
```

> NOTE: The `CHP_HYDRA_DEV_MNEMONIC` will be provided securely via Signal to any engineer working within this repo.



