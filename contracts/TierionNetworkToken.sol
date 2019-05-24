pragma solidity >=0.4.22 <0.6.0;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";
import "openzeppelin-solidity/contracts/cryptography/ECDSA.sol";
import "bytes/BytesLib.sol";
import "./lib/ERC20.sol";
import "./lib/ERC20Basic.sol";
import "./lib/SafeMath.sol";
import "./ChainpointRegistry.sol";
import "./ChainpointMigration.sol";

/**
 * @title Basic token
 * @dev Basic version of StandardToken, with no allowances. 
 */
contract BasicToken is ERC20Basic {
  using SafeMath for uint256;

  mapping(address => uint256) balances;

  /**
   * @dev transfer token for a specified address
   * @param _to The address to transfer to.
   * @param _value The amount to be transferred.
   */
  function transfer(address _to, uint256 _value) public returns(bool) {
    balances[msg.sender] = balances[msg.sender].sub(_value);
    balances[_to] = balances[_to].add(_value);
    emit Transfer(msg.sender, _to, _value);
    return true;
  }

  /**
   * @dev Gets the balance of the specified address.
   * @param _owner The address to query the the balance of. 
   * @return An uint256 representing the amount owned by the passed address.
   */
  function balanceOf(address _owner) public view returns(uint256 balance) {
    return balances[_owner];
  }

}

/**
 * @title Standard ERC20 token
 *
 * @dev Implementation of the basic standard token.
 * @dev https://github.com/ethereum/EIPs/issues/20
 * @dev Based on code by FirstBlood: https://github.com/Firstbloodio/token/blob/master/smart_contract/FirstBloodToken.sol
 */
contract StandardToken is ERC20, BasicToken {
  using SafeMath for uint256;

  mapping(address => mapping(address => uint256)) public allowed;


  /**
   * @dev Transfer tokens from one address to another
   * @param _from address The address which you want to send tokens from
   * @param _to address The address which you want to transfer to
   * @param _value uint256 the amout of tokens to be transfered
   */
  function transferFrom(address _from, address _to, uint256 _value) public returns(bool) {
    // Check is not needed because sub(_allowance, _value) will already throw if this condition is not met
    // require (_value <= _allowance);
    
    balances[_from] = balances[_from].sub(_value);
    allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
    balances[_to] = balances[_to].add(_value);

    emit Transfer(_from, _to, _value);
    
    return true;
  }

  /**
   * @dev Aprove the passed address to spend the specified amount of tokens on behalf of msg.sender.
   * @param _spender The address which will spend the funds.
   * @param _value The amount of tokens to be spent.
   */
  function approve(address _spender, uint256 _value) public returns(bool) {

    // To change the approve amount you first have to reduce the addresses`
    //  allowance to zero by calling `approve(_spender, 0)` if it is not
    //  already 0 to mitigate the race condition described here:
    //  https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
    require((_value == 0) || (allowed[msg.sender][_spender] == 0));

    allowed[msg.sender][_spender] = _value;
    emit Approval(msg.sender, _spender, _value);
    return true;
  }

  /**
   * @dev Function to check the amount of tokens that an owner allowed to a spender.
   * @param _owner address The address which owns the funds.
   * @param _spender address The address which will spend the funds.
   * @return A uint256 specifing the amount of tokens still avaible for the spender.
   */
  function allowance(address _owner, address _spender) public view returns(uint256 remaining) {
    return allowed[_owner][_spender];
  }

}

/**
 * @title Tierion Network Token
 * @dev ERC20 Tierion Network Token (TNT)
 *
 * TNT Tokens are divisible by 1e8 (100,000,000) base
 * units referred to as 'Grains'.
 *
 * TNT are displayed using 8 decimal places of precision.
 *
 * 1 TNT is equivalent to:
 *   100000000 == 1 * 10**8 == 1e8 == One Hundred Million Grains
 *
 * 1 Billion TNT (total supply) is equivalent to:
 *   100000000000000000 == 1000000000 * 10**8 == 1e17 == One Hundred Quadrillion Grains
 *
 * All initial TNT Grains are assigned to the creator of
 * this contract.
 *
 */
contract TierionNetworkToken is StandardToken, Ownable, Pausable {
    using ECDSA for bytes32;
    using BytesLib for bytes;
    
    string public name = 'Tierion Network Token'; // Set the token name for display
    string public symbol = 'TNT'; // Set the token symbol for display
    uint8 public decimals = 8; // Set the number of decimals for display
    uint256 public INITIAL_SUPPLY = 2000000 * 10 ** uint256(decimals); // 1M TNT specified in Grains
    uint256 public mintAmount = 2000 * 10 ** uint256(decimals); // 2000 TNT specified in Grains

    ///
    /// Minting Parameters
    ///
    /// @title Minting Interval (in # of blocks)
    uint256 public mintingInterval = 5760; // 86,400 (seconds in 1 day) / 15 (average block time in seconds)
    /// @title Nodes Last Token Minting timestamp
    uint256 public nodeLastMintedAt = 0;
    /// @title Nodes Last Token Minting block height
    uint256 public nodeLastMintedAtBlock = 0;
    /// @title Cores Last Token Minting timestamp
    uint256 coreLastMintedAt = 0;
    /// @title Cores Last Token Minting block height
    uint256 public coreLastMintedAtBlock = 0;
    
    /// @title Chainpoint Registry
    /// @notice Chainpoint Registry Contract
    ChainpointRegistry public chainpointRegistry;

    /// @title Chainpoint Migration
    /// @notice Chainpoint Migration Contract
    ChainpointMigration public migrationContract;

    mapping(uint256 => mapping(address => bool)) public coreMintingSignaturesUsed;
  
    ///
    /// MODIFIERS
    ///
    /// @notice only Staked Core Operators or Owner can call, otherwise throw
    modifier onlyCoreOperator() {
      require(chainpointRegistry.isHealthyCore(msg.sender), "must be owner or an active core operator");
      _;
    }

    /// @notice only Staked Core Operators or Owner can call, otherwise throw
    modifier onlyChainpointMigrationContract() {
      require(msg.sender == address(migrationContract), "only Migration Contract can invoke this method");
      _;
    }

  /**
   * @dev TierionNetworkToken Constructor
   * Runs only on initial contract creation.
   */
  constructor(address _faucetAddr, address _migrationAddr) public {
    totalSupply = INITIAL_SUPPLY; // Set the total supply
    balances[_faucetAddr] = INITIAL_SUPPLY.div(2); // 1M $TKNs is minted to Chainpoint Faucet
    balances[msg.sender] = INITIAL_SUPPLY.div(2); // 1M 1M $TKNs is minted to Chainpoint/Tierion for bootstrapping Network

    migrationContract = ChainpointMigration(_migrationAddr); // Set CHP Migration Contract
  }
  
  ///
  /// EVENTS 
  ///
  /// @notice emitted on successful token minting
  /// @param _nodes number of Node Operators that were rewarded tokens
  /// @param _mintAmount is the total number of tokens rewarded to each Node Operator
  /// @param _blockHeight The block height in which token minting occurred
  event Mint(
      address[] _nodes,
      uint256 _mintAmount,
      uint256 _blockHeight
  );
  
  /// @notice emitted on successful purchasing of usage
  /// @param _buyer node operator that is purchasing network usage
  /// @param _value amount of TNT being spent on future network usage
  event UsagePurchased(
      address _buyer,
      uint256 _value
  );

  event MintCores(
    uint256 _recoveredSigs,
    uint256 _majority
  );

  /**
   * @dev Transfer token for a specified address when not paused
   * @param _to The address to transfer to.
   * @param _value The amount to be transferred.
   */
  function transfer(address _to, uint256 _value) public whenNotPaused returns(bool) {
    require(_to != address(0));
    return super.transfer(_to, _value);
  }

  /**
   * @dev Transfer tokens from one address to another when not paused
   * @param _from address The address which you want to send tokens from
   * @param _to address The address which you want to transfer to
   * @param _value uint256 the amount of tokens to be transferred
   */
  function transferFrom(address _from, address _to, uint256 _value) public whenNotPaused returns(bool) {
    require(_to != address(0));
    return super.transferFrom(_from, _to, _value);
  }

  /**
   * @dev Aprove the passed address to spend the specified amount of tokens on behalf of msg.sender when not paused.
   * @param _spender The address which will spend the funds.
   * @param _value The amount of tokens to be spent.
   */
  function approve(address _spender, uint256 _value) public whenNotPaused returns(bool) {
    return super.approve(_spender, _value);
  }
  
  /**
   * @dev Mint tokens and send to the address provided
   * @param _nodes The addresses of Nodes which will receive the funds.
   * @dev only Chainpoint Core Operators can invoke this method
   */
  function mint(address[] memory _nodes, bytes32 _hash, bytes memory signature1, bytes memory signature2, bytes memory signature3, bytes memory signature4, bytes memory signature5, bytes memory signature6) public whenNotPaused onlyCoreOperator returns(bool) {
      require(nodeLastMintedAtBlock == 0 || block.number >= nodeLastMintedAtBlock.add(mintingInterval), "minting occurs at the specified minting interval");
      require(_nodes.length <= 72, "list of 72 or fewer nodes is required");
      // Check signature uniqueness
      require(!signature1.equal(signature2) && !signature1.equal(signature3) && !signature1.equal(signature4) && !signature1.equal(signature5) && !signature1.equal(signature6), 'Signatures must be signed by different Cores');
      require(!signature2.equal(signature3) && !signature2.equal(signature4) && !signature2.equal(signature5) && !signature2.equal(signature6), 'Signatures must be signed by different Cores');
      require(!signature3.equal(signature4) && !signature3.equal(signature5) && !signature3.equal(signature6), 'Signatures must be signed by different Cores');
      require(!signature4.equal(signature5) && !signature4.equal(signature6), 'Signatures must be signed by different Cores');
      require(!signature5.equal(signature6), 'Signatures must be signed by different Cores');

      // Validate parameters provided
      bytes32 nodesHash = keccak256(abi.encodePacked(_nodes));
      require(nodesHash.toEthSignedMessageHash() == _hash, "supplied toEthSignedMessageHash does not equal value calculated");
      
      // Recover Signer addresses and verify they are staked Core Operators
      bytes[6] memory signatures = [signature1, signature2, signature3, signature4, signature5, signature6];
      for(uint8 i=0; i < signatures.length; i++) {
          require(chainpointRegistry.isHealthyCore(_hash.recover(signatures[i])), "signer is not a staked core operator");
      }

      // Update LastMintedAt block & time
      nodeLastMintedAtBlock = block.number;
      nodeLastMintedAt = now;
      
      // Iterate through list of Nodes and award tokens
      for(uint8 i=0; i < _nodes.length; i++) {
          _mint(_nodes[i], mintAmount);
      }
      
      emit Mint(_nodes, mintAmount, block.number);
      
      return true;
  }

  function mintCores(address[] memory _cores, bytes32 _hash, bytes[126] memory sigs) public whenNotPaused returns (bool) {
    bytes memory btsNull = new bytes(0);

    // Validate parameters provided
    bytes32 coresHash = keccak256(abi.encodePacked(_cores));
    require(coresHash.toEthSignedMessageHash() == _hash, "_hash supplied toEthSignedMessageHash does not equal value calculated");

    uint256 recoveredSigs = 0;
    // TODO: hardcoded for now
    uint256 majority = uint256(6).div(2).add(1);

    // Recover Signer addresses and verify they are staked Core Operators
    for(uint8 i=0; i < sigs.length; i++) {
      if(sigs[i].equal(btsNull))
        break;

      address recoveredAddress = _hash.recover(sigs[i]);
      require(chainpointRegistry.isHealthyCore(recoveredAddress), "signer is not a staked core operator");

      if(coreMintingSignaturesUsed[block.number][recoveredAddress] == false) {
        coreMintingSignaturesUsed[block.number][recoveredAddress] = true;

        recoveredSigs = recoveredSigs.add(1);
      }
    }

    // Number of valid recovered signatures must be greater than or equal to the majority before minting
    // require(recoveredSigs >= majority, "quorum was not reached");
    // Iterate through list of Nodes and award tokens
    for(uint8 i=0; i < _cores.length; i++) {
        _mint(_cores[i], mintAmount);
    }

    emit MintCores(recoveredSigs, majority);

    return true;
  }

  /**
   * @dev Purchase Usage tokens, will burn tokens and emit a UsagePurchased & Transfer event
   * @param _value The amount of tokens to be spent.
   * @dev Chainpoint Nodes will be invoking this method to purchase access to the Network
   * @return Boolean indicating result of method execution
   */
  function purchaseUsage(uint256 _value) public returns (bool) {
      _burn(msg.sender, _value);
      
      emit UsagePurchased(msg.sender, _value);
      
      return true;
  }

  /**
   * @dev Token Migration Mint new tokens for migrator
   * @param _amount The amount of tokens to be minted as a result of a migration.
   * @dev TNT token holders will be invoking during token migration process
   * @return Boolean indicating result of method execution
   */
  function mintForExchange(address _to, uint256 _amount) public returns (bool) {
    _mint(_to, _amount);

    // TODO: emit TokensMigrated Event

    return true;
  }

  /**
   * @dev Sets the contract address for the Chainpoint Registry
   * @param _addr The contract address of the Chainpoint Registry
   * @dev Can only be invoked by contract owner
   * @return Boolean indicating result of method execution
   */
  function setChainpointRegistry(address _addr) public onlyOwner returns(bool) {
      require(_addr != address(0));
      
      chainpointRegistry = ChainpointRegistry(_addr);
      
      return true;
  }

  /**
   * @dev Gets the balance of the specified address.
   * @param _account The account which is burning tokens
   * @param _value The number of tokens to burn
   * @dev Internal function that is called within - purchaseUsage()
   */
  function _burn(address _account, uint256 _value) internal {
    require(_account != address(0));

    totalSupply = totalSupply.sub(_value);
    balances[_account] = balances[_account].sub(_value);
    
    emit Transfer(_account, address(0), _value);
  }

  /**
    * @dev Internal function that mints an amount of the token and credits the account provided
    * @param _account The account that will receive the created tokens.
    * @param _value The amount of tokens minted
    */
  function _mint(address _account, uint256 _value) internal {
    require(_account != address(0));

    totalSupply = totalSupply.add(_value);
    balances[_account] = balances[_account].add(_value);
    emit Transfer(address(0), _account, _value);
  }
  
  function recover(bytes32 hash, bytes memory signature) public pure returns (address) {
    return hash.recover(signature);
  }

  function toEthSignedMessageHash(bytes32 hash) public pure returns (bytes32) {
    return hash.toEthSignedMessageHash();
  }

  function isMigrationContract() public view returns (bool) {
    return (msg.sender == address(migrationContract));
  }
}
