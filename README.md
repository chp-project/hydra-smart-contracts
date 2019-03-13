# Chainpoint Smart Contracts

### Ropsten Chain (QA)

| Contract  | Address |
| ------------- | ------------- |
| TierionNetworkToken (TNT)  | [0xdDe28788b332610562995C053f87aFc30624CCdB](https://ropsten.etherscan.io/address/0xdDe28788b332610562995C053f87aFc30624CCdB) |
| ChainpointRegistry | [0x59511d3A20b31978146486fb14C747C77230A521](https://ropsten.etherscan.io/address/0x59511d3A20b31978146486fb14C747C77230A521) |
| ChainpointQuorum | [0xbFE448Dd6b0569ae16D103Fc79b58Cb5cC959141](https://ropsten.etherscan.io/address/0xbFE448Dd6b0569ae16D103Fc79b58Cb5cC959141) |

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



