pragma solidity >=0.4.22 <0.6.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

import "./lib/ERC20.sol";
import "./lib/ERC20Mint.sol";
import "./lib/SafeMath.sol";

/**
 * @title Chainpoint Migration
 * @dev Faucet contract for $TKN & the Chainpoint Network
 *
 */
contract ChainpointMigration is Ownable, Pausable {
  using SafeMath for uint256;

  /// @title Chainpoint Migration Contract
  string public name = "Chainpoint Migration";
  
  /// @title OLD TNT Token Contract
  /// @notice Standard ERC20 Token
  ERC20 private oldToken;
  /// @title NEW $TKN Token Contract
  /// @notice Standard ERC20 Token
  ERC20Mint private newToken;

  ///
  /// MAPPINGS
  ///
  /// @title Growing list of Subscribers
  /// @notice Contains all of the past Subscribers that have been dispersed $TKNs to register with the Chainpoint Network
  /// @dev Key is ethereum account for Subscriber
  /// @dev Value is bool indicating that a Subscriber has already been dispersed $TKNs, and can only subscribe once
  mapping (address => bool) public subscribers;

  /// @notice Constructor sets the finite totalSupply of the Faucet which has been minted to the Faucet Contract when the $TKN Contract was deployed
  constructor (address _oldToken) public {
      require(_oldToken != address(0), "token address cannot be 0x0");
        oldToken = ERC20(_oldToken);
  }

  ///
  /// EVENTS 
  ///
  /// @notice emitted on successful Token Migration
  /// @param _sender Node Operator staking a node
  /// @param _amount is the epoch timestamp up to when the Node is staked into the Chainpoint Network
  event Exchange(
    address indexed _sender,
    uint256 _amount
  );

  /**
   * @dev Invoked by future Chainpoint Node Operators which disperses min. registration amount into Chainpoint Network
   * @dev Can only be invoked by contract owner
   * @return Boolean indicating result of method execution
   */
  function exchange(uint256 _amount) public whenNotPaused returns(bool) {
    require(_amount > 0, "Amount has to be greater than 0");

    // Burn Old Tokens by sending to 0x00...0
    require(oldToken.transferFrom(msg.sender, address(this), _amount), "transferFrom failed");
    // Mint corresponding amount of new $TKNs
    require(newToken.mintForExchange(msg.sender, _amount), "mintForExchange failed");

    emit Exchange(
      msg.sender,
      _amount
    );
    
    return true;
  }

  /**
   * @dev Sets the contract address for the $TKN Contract
   * @param _tokenAddr The contract address of the $TKN Contract
   * @dev Can only be invoked by contract owner
   * @return Boolean indicating result of method execution
   */
  function setToken(address _tokenAddr) public onlyOwner returns(bool) {
    require(_tokenAddr != address(0));
    
    newToken = ERC20Mint(_tokenAddr);
    
    return true;
  }
}