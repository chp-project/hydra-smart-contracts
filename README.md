# Chainpoint Smart Contracts

### Ropsten Chain (QA)

| Contract  | Address |
| ------------- | ------------- |
| TierionNetworkToken (TNT)  | [0x9105a3b44075bb0BE3E5A328Fc14367ce88bd27f](https://ropsten.etherscan.io/address/0x9105a3b44075bb0BE3E5A328Fc14367ce88bd27f) |
| ChainpointRegistry | [0x0e30923DfBA8fEB7418A63b2Be8Ed78B8B387b88](https://ropsten.etherscan.io/address/0x0e30923DfBA8fEB7418A63b2Be8Ed78B8B387b88) |

<!-- ### Kovan Chain (STAGING) -->

### ChainpointRegistry Spec

> Implements: Pausable

```js
function stake(bytes32 _nodeIp, bytes32 _nodePublicKey, uint256 _amount, uint256 _duration) public returns (bool);
```


