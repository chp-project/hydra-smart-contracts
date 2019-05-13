pragma solidity >=0.4.22 <0.6.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

import "./lib/ERC20.sol";
import "./lib/SafeMath.sol";

/**
 * @title Chainpoint Faucet
 * @dev Faucet contract for $TKN & the Chainpoint Network
 *
 */
contract ChainpointFaucet is Ownable, Pausable {
  using SafeMath for uint256;

  /// @title Chainpoint Faucet Contract
  string public name = "Chainpoint Faucet";
  /// @title Total supply
  uint256 totalSupply;
  /// @title INITIAL_SUPPLY
  uint256 public INITIAL_SUPPLY = 100000000000000; // 1M TNT specified in Grains
  /// @title Minting Interval (in # of blocks)
  uint256 public subscriptionInterval = 60; // 60(blocks) should take ~15mins
  /// @title Nodes Last Subscription Issued in block height
  uint256 lastSubscribedAtBlock = 0;
  /// @title The Dispersement amount for each call to subscribe()
  /// @notice Standard ERC20 Token
  uint256 public DISPERSEMENT_AMOUNT = 550000000000; // 5500 TNT specified in grains (enough TNT for min. stake + usage token)
  
  /// @title TNT Token Contract
  /// @notice Standard ERC20 Token
  ERC20 private token;

  ///
  /// MAPPINGS
  ///
  /// @title Growing list of Subscribers
  /// @notice Contains all of the past Subscribers that have been dispersed $TKNs to register with the Chainpoint Network
  /// @dev Key is ethereum account for Subscriber
  /// @dev Value is bool indicating that a Subscriber has already been dispersed $TKNs, and can only subscribe once
  mapping (address => bool) public subscribers;

  /// @notice Constructor sets the finite totalSupply of the Faucet which has been minted to the Faucet Contract when the $TKN Contract was deployed
  constructor () public {
      totalSupply = INITIAL_SUPPLY;
  }

  /**
   * @dev Invoked by future Chainpoint Node Operators which disperses min. registration amount into Chainpoint Network
   * @dev Can only be invoked by contract owner
   * @return Boolean indicating result of method execution
   */
  function subscribe() public whenNotPaused returns(bool) {
    require(lastSubscribedAtBlock == 0 || block.number >= lastSubscribedAtBlock.add(subscriptionInterval), "subscriptions are issued on a set interval of every 60 blocks");

    totalSupply = totalSupply.sub(DISPERSEMENT_AMOUNT);
    subscribers[msg.sender] = true; // Blacklist msg.sender to only allow one subscription per EOA

    // Update LastMintedAt block & time
    lastSubscribedAtBlock = block.number;

    require(token.transfer(msg.sender, DISPERSEMENT_AMOUNT));
    
    return true;
  }

  /**
   * @dev Returns remaining totalSupply available for dispersement
   * @return uint256 remaining totalSupply
   */
  function getTotalSupply() public view returns(uint256) {
    return totalSupply;
  }

  // lastSubscribedAtBlock
  /**
   * @dev Returns the block in which a successful dispersement took place
   * @return uint256 lastSubscribedAtBlock
   */
  function getLastSubscribedAtBlock() public view returns(uint256) {
    return lastSubscribedAtBlock;
  }

  /**
   * @dev Returns whether or not the ETH Address has already subscribed to the Faucet
   * @param _addr The address to check subscription status of
   * @return bool Subscription status
   */
  function isSubscribed(address _addr) public view returns(bool) {
    return subscribers[_addr];
  }

  /**
   * @dev Sets the contract address for the $TKN Contract
   * @param _tokenAddr The contract address of the $TKN Contract
   * @dev Can only be invoked by contract owner
   * @return Boolean indicating result of method execution
   */
  function setToken(address _tokenAddr) public onlyOwner returns(bool) {
    require(_tokenAddr != address(0));
    
    token = ERC20(_tokenAddr);
    
    return true;
  }
}