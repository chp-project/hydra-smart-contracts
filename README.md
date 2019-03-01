# Chainpoint Smart Contracts

### Ropsten Chain (QA)

| Contract  | Address |
| ------------- | ------------- |
| TierionNetworkToken (TNT)  | [0x2eE08480BC7C3038Ab4Fc5089372Eb62c35a0b3B](https://ropsten.etherscan.io/address/0x2eE08480BC7C3038Ab4Fc5089372Eb62c35a0b3B) |
| ChainpointRegistry | [0x3dAaee9c001256159b540a61FBe33C8cA751cf6D](https://ropsten.etherscan.io/address/0x3dAaee9c001256159b540a61FBe33C8cA751cf6D) |
| ChainpointQuorum | [0x8c2A693D68e80E59bEA1959C8e08Ba4cc71e07c1](https://ropsten.etherscan.io/address/0x8c2A693D68e80E59bEA1959C8e08Ba4cc71e07c1) |

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



