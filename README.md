# Chainpoint Smart Contracts

### Ropsten Chain (QA)

| Contract  | Address |
| ------------- | ------------- |
| TierionNetworkToken (TNT)  | [0xcF8EE11ef3E6846701eFde105AB0EF60A46d55C1](https://ropsten.etherscan.io/address/0xcF8EE11ef3E6846701eFde105AB0EF60A46d55C1) |
| ChainpointRegistry | [0x2aaDDFD5290421A770Fb880B87B376B465E0950d](https://ropsten.etherscan.io/address/0x2aaDDFD5290421A770Fb880B87B376B465E0950d) |

<!-- ### Kovan Chain (STAGING) -->

### ChainpointRegistry Spec

> Implements: Pausable

```js
function stake(bytes32 _nodeIp, bytes32 _nodePublicKey, uint256 _amount, uint256 _duration) public returns (bool);
```


