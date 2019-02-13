pragma solidity >=0.4.22 <0.6.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

import "./lib/ERC20.sol";
import "./lib/SafeMath.sol";


contract ChainpointRegistry is Ownable, Pausable {
    using SafeMath for uint256;
    
    /// @title TNT Token Contract
    string public name = "Chainpoint Registry";
    
    /// @title TNT Token Contract
    /// @notice Standard ERC20 Token
    ERC20 public token;
    
    // @title Chainpoint Quorum Smart Contract address
    address quorumContractAddress;
    
    uint256 public MIN_STAKING_AMOUNT = 5000;
    uint256 public MIN_STAKING_DURATION = 600;
    
    ///
    /// MAPPINGS
    ///
    /// @title Registered Chainpoint Nodes
    /// @notice Contains all Chainpoint Nodes that have staked and are participating in the Chainpoint Network
    /// @dev Key is ethereum account for Chainpoint Node owner
    /// @dev Value is struct representing Node attributes
    mapping (address => Node) public nodes;
    
    /// @title Registered Chainpoint Cores
    /// @notice Contains all Chainpoint Core Operators that have staked and are running the Chainpoint Network
    /// @dev Key is ethereum account for Chainpoint Node owner
    /// @dev Value is struct representing Node attributes
    mapping (address => Core) public cores;
    
    /// @title Staking Rates
    /// @notice Contains Staking rates and their corresponding time extension measure in seconds
    /// @dev Key number of TNT tokens
    /// @dev Value staking duration
    mapping (string => mapping(uint256 => uint256)) stakingRates;
    
    /// @title Registered Chainpoint Cores Array
    /// @notice Convenient iterable data structure containing a list of Core Operators
    /// @dev Value Address of the registered Core
    address[] public coresArr;
    
    /// @title White-listed Chainpoint Cores Array
    /// @notice List of white-listed Cores that are able to stake, but have not done so
    /// @dev Value Address of the white-listed Core
    address[] public whitelistedCoresArr;
    
    ///
    /// TYPES 
    ///
    /// @title Chainpoint Node
    /// @notice Contains the Node state on the Chainpoint network
    /// @dev nodeIp is the IPV4 address of the Node
    /// @dev nodePublicKey is the public key of the Node
    /// @dev amountStaked is the amount of TNT the node has staked
    struct Node {
      bytes32 nodeIp;
      bytes32 nodePublicKey;
      bool isStaked;
      uint256 amountStaked;
      uint256 stakeLockedUntil;
    }
    
    /// @title Chainpoint Core Operator
    /// @notice Contains the Core Operator state on the Chainpoint network
    /// @dev coreIp is the IPV4 address of the Node
    /// @dev corePublicKey is the public key of the Node
    /// @dev staked Node is actively staked
    /// @dev isHealthy Will always be true unless a Core is acting in bad faith and is therefore being punished by the rest of the Network
    /// @dev amountStaked is the amount of TNT the node has staked
    /// @dev stakeLockedUntil is the epoch timestamp up to when the Node is staked into the Chainpoint Network
    struct Core {
      bytes32 coreIp;
      bytes32 corePublicKey;
      bool isStaked;
      bool isHealthy;
      uint256 amountStaked;
      uint256 stakeLockedUntil;
    }
    
    ///
    /// MODIFIERS
    ///
    /// @notice only Staked Core Operators or Owner can call, otherwise throw
    modifier onlyOwnerOrCoreOperator() {
        require(msg.sender == owner() || cores[msg.sender].isHealthy, "must be owner or an active core operator");
        _;
    }
    
    modifier onlyOwnerOrQuorum() {
        require(msg.sender == owner() || msg.sender == quorumContractAddress, "must be owner or quorum contract");
        _;
    }

    /// @notice only Core Operators can call, otherwise throw
    modifier onlyCoreOperator() {
        require(cores[msg.sender].isHealthy, "must be core operator");
        _;
    }
    
    /// @notice Constructor sets the ERC Token contract and initial values for network fees
    /// @param _token is the Atonomi Token contract address (must be ERC20)
    constructor (address _token) public {
        require(_token != address(0), "token address cannot be 0x0");
        token = ERC20(_token);
        
        // TODO: Replace hardcoded stakingRates initialization with values provided by SettingsInterface
        stakingRates["defaultNodeStake"][0] = 5000;
        stakingRates["defaultNodeDuration"][0] = 600; // (seconds)
        stakingRates["defaultCoreStake"][0] = 10000;
        stakingRates["defaultCoreDuration"][0] = 600; // (seconds)
        
        stakingRates["nodes"][5000] = 600; // (seconds)
        stakingRates["cores"][10000] = 600; // (seconds)
    }
    
    ///
    /// EVENTS 
    ///
    /// @notice emitted on successful Node staking
    /// @param _sender Node Operator staking a node
    /// @param _amountStaked is the total amount of TNT the Node has staked
    /// @param _duration is the epoch timestamp up to when the Node is staked into the Chainpoint Network
    event NodeStaked(
        address indexed _sender,
        bytes32 _nodeIp,
        bytes32 _nodePublicKey,
        uint256 _amountStaked,
        uint256 _duration
    );
    
    /// @notice emitted on successful staking renewal
    /// @param _sender Node Operator staking a node
    /// @param _nodeIp is the Node's IP Address
    /// @param _nodeIp is the Node's Public Key
    /// @param _amountStaked is the amount the Node has staked
    /// @param _duration is the epoch timestamp up to when the Node is staked into the Chainpoint Network
    event NodeStakeUpdated(
        address indexed _sender,
        bytes32 _nodeIp,
        bytes32 _publicKey,
        uint256 _amountStaked,
        uint256 _duration
    );
    
    /// @notice emitted on successful Node staking
    /// @param _sender Core Operator staking a node
    /// @param _coreIp IP address of Core Node
    /// @param _corePublicKey Core Operator public key
    /// @param _isHealthy Is Core Operator currently Active
    /// @param _amountStaked is the total amount of TNT the Node has staked
    /// @param _duration is the epoch timestamp up to when the Node is staked into the Chainpoint Network
    event CoreStaked(
        address indexed _sender,
        bytes32 _coreIp,
        bytes32 _corePublicKey,
        bool _isHealthy,
        uint256 _amountStaked,
        uint256 _duration
    );
    
    /// @notice emitted on successful Node staking
    /// @param _sender Core Operator staking a node
    /// @param _coreIp IP address of Core Node
    /// @param _corePublicKey Core Operator public key
    /// @param _isHealthy Is Core Operator currently Active
    /// @param _amountStaked is the total amount of TNT the Node has staked
    /// @param _duration is the epoch timestamp up to when the Node is staked into the Chainpoint Network
    event CoreStakeUpdated(
        address indexed _sender,
        bytes32 _coreIp,
        bytes32 _corePublicKey,
        bool _isHealthy,
        uint256 _amountStaked,
        uint256 _duration
    );
    
    ///
    /// Chainpoint Node staking
    ///
    /// @notice Allows a Node to stake into the Chainpoint Network
    /// @param _nodeIp is the IPV4 address of the Node
    /// @param _nodePublicKey is the public key of the Node
    /// @param _amount is the amount of TNT the node has staked
    /// @return true if successful, otherwise false
    function stake(bytes32 _nodeIp, bytes32 _nodePublicKey, uint256 _amount) public whenNotPaused returns (bool) {
        require(_addNodeToRegistry(_nodeIp, _nodePublicKey, _amount), "node did not stake into the chainpoint network");
        
        emit NodeStaked(
            msg.sender,
            _nodeIp,
            _nodePublicKey,
            _amount,
            stakingRates["nodes"][_amount]
        );
        
        require(token.transferFrom(msg.sender, address(this), _amount), "transferFrom failed");

        return true;
    }
    
    ///
    /// Chainpoint Core staking overloaded function definitions
    ///
    /// @notice Allows a Node to stake into the Chainpoint Network
    /// @param _coreIp is the IPV4 address of the Node
    /// @param _corePublicKey is the public key of the Node
    /// @param _amount is the amount of TNT the node has staked
    /// @return true if successful, otherwise false
    function stakeCore(bytes32 _coreIp, bytes32 _corePublicKey, uint256 _amount) public whenNotPaused returns (bool) {
        require(_addCoreToRegistry(_coreIp, _corePublicKey, _amount), "node did not stake into the chainpoint network");
        
        emit CoreStaked(
            msg.sender,
            _coreIp,
            _corePublicKey,
            true,
            _amount,
            stakingRates["cores"][_amount]
        );
        
        require(token.transferFrom(msg.sender, address(this), _amount), "transferFrom failed");

        return true;
    }
    
    ///
    /// Update Node Information
    ///
    /// @notice Allows a Node renew their stake into the Chainpoint Network
    /// @param _nodeIp is the new IP address of the staked Chainpoint Node
    /// @param _nodePublicKey the new Public Key of the staked Chainpoint Node
    /// @return true if successful, otherwise false
    /// @dev msg.sender is expected to be the Node Operator
    /// @dev tokens will be deducted from the Node Operator and added to the balance of the ChainpointRegistry Address
    /// @dev owner has ability to pause this operation
    function updateStake(bytes32 _nodeIp, bytes32 _nodePublicKey) public whenNotPaused returns (bool) {
        require(nodes[msg.sender].isStaked, "node has not staked into the Chainpoint network");
        require(_nodeIp != 0, "node IP address is required");
        require(_nodePublicKey != 0, "node public key is required is required");
        
        Node storage n = nodes[msg.sender];
        n.nodeIp = _nodeIp;
        n.nodePublicKey = _nodePublicKey;
        
        emit NodeStakeUpdated(
            msg.sender,
            n.nodeIp,
            n.nodePublicKey,
            n.amountStaked,
            n.stakeLockedUntil
        );

        return true;
    }
    
    ///
    /// Update Core Information
    ///
    /// @notice Allows a Core to update their metadata
    /// @param _coreIp is the new IP address of the staked Core Operator
    /// @param _corePublicKey the new Public Key of the staked Chainpoint Node
    /// @param _isCore Core Operator
    /// @return true if successful, otherwise false
    /// @dev msg.sender is expected to be the Node Operator
    /// @dev tokens will be deducted from the Node Operator and added to the balance of the ChainpointRegistry Address
    /// @dev owner has ability to pause this operation
    function updateStakeCore(bytes32 _coreIp, bytes32 _corePublicKey, bool _isCore) public whenNotPaused returns (bool) {
        require(_isCore, "core parameter was not provided");
        require(cores[msg.sender].isStaked, "core has not staked into the Chainpoint network");
        require(_coreIp != 0, "core IP address is required");
        require(_corePublicKey != 0, "core public key is required");
        
        Core storage c = cores[msg.sender];
        c.coreIp = _coreIp;
        c.corePublicKey = _corePublicKey;
        
        emit CoreStakeUpdated(
            msg.sender,
            c.coreIp,
            c.corePublicKey,
            c.isHealthy,
            c.amountStaked,
            c.stakeLockedUntil
        );

        return true;
    }
    
    ///
    /// Un-Stake a Node, tokens must no longer be timelocked
    ///
    /// @notice Allows a Node un-stake from the Chainpoint Network given that stakeLockedUntil duration has elapsed
    /// @return true if successful, otherwise false
    /// @dev msg.sender is expected to be the Node Operator
    /// @dev tokens that were previously timelocked will be transferred back to the Node Operator
    /// @dev owner has ability to pause this operation
    function unStake() public whenNotPaused returns (bool) {
        require(nodes[msg.sender].isStaked, "node has not staked into the Chainpoint network");
        require(now >= nodes[msg.sender].stakeLockedUntil, "tokens are timelocked");
        
        require(token.transfer(msg.sender, nodes[msg.sender].amountStaked), "transferFrom failed");
        delete nodes[msg.sender];
        
        return true;
    }
    
    ///
    /// Un-Stake a Core, tokens must no longer be timelocked
    ///
    /// @notice Allows a Core to un-stake from the Chainpoint Network given that stakeLockedUntil duration has elapsed
    /// @return true if successful, otherwise false
    /// @dev msg.sender is expected to be the Node Operator
    /// @dev tokens that were previously timelocked will be transferred back to the Core Operator
    /// @dev owner has ability to pause this operation
    function unStakeCore() public whenNotPaused returns (bool) {
        require(cores[msg.sender].isStaked, "core has not staked into the Chainpoint network");
        require(now >= cores[msg.sender].stakeLockedUntil, "tokens are timelocked");
        
        require(token.transfer(msg.sender, cores[msg.sender].amountStaked), "transferFrom failed");
        delete cores[msg.sender];
        
        return true;
    }
    
    ///
    /// Get tokens staked
    ///
    /// @param addr Address of Node Operator
    /// @notice Returns the amount of tokens that a Node Operator has staked and the timestamp as to when the tokens are locked
    /// @return true if successful, otherwise false
    /// @dev msg.sender is expected to be the Node Operator
    /// @dev owner has ability to pause this operation
    function totalStakedFor(address addr) public view returns (uint256 amount, uint256 unlocks_at) {
        require(nodes[addr].isStaked, "node has not staked into the Chainpoint network");
        
        return (nodes[addr].amountStaked, nodes[addr].stakeLockedUntil);
    }
    
    ///
    /// Get Count of staked Core Operators
    ///
    /// @notice Returns length of coresArr
    /// @return uint256 of the length of coresArr
    function getCoreCount() public view returns (uint256) {
        return coresArr.length;
    }
    
    ///
    /// Is Core healthy?
    ///
    /// @notice Returns whether or not a Core is healthy
    /// @return bool if successful, otherwise false
    /// @dev msg.sender is expected to be the Node Operator
    /// @dev owner has ability to pause this operation
    function isHealthyCore(address _address) public returns (bool) {
        return cores[msg.sender].isHealthy;
    }
    
    ///
    /// Get White-listed Core Operators
    ///
    /// @notice Returns the amount of tokens that a Node Operator has staked and the timestamp as to when the tokens are locked
    /// @return address[] if successful, otherwise false
    /// @dev msg.sender is expected to be the Node Operator
    /// @dev owner has ability to pause this operation
    function whitelistCore(address _address) public onlyOwnerOrCoreOperator returns (bool) {
        bool exists;
        
        for (uint i = 0; i < whitelistedCoresArr.length; i++) {
            if (whitelistedCoresArr[i] == _address) {
                break;
            }
        }
        whitelistedCoresArr.push(_address);
        
        return true;
    }
    
    ///
    /// Add node to registry 
    ///
    /// @notice Adds a Node to the staking registry
    /// @param _nodeIp is the IPV4 address of the Node
    /// @param _nodePublicKey is the public key of the Node
    /// @param _amount is the amount of TNT the node has staked
    /// @return Node
    /// @dev msg.sender is expected to be the Node Operator
    /// @dev tokens will be deducted from the Node Operator and added to the balance of the ChainpointRegistry Address
    /// @dev owner has ability to pause this operation
    function _addNodeToRegistry(bytes32 _nodeIp, bytes32 _nodePublicKey, uint256 _amount) internal returns (bool) {
        require(!nodes[msg.sender].isStaked, "node has already staked. invoke renewStake() method to renew");
        require(_nodeIp != 0, "node IP address is required");
        require(_nodePublicKey != 0, "node public key is required is required");
        require(_amount >= stakingRates["defaultNodeStake"][0], "minimum staking amount not met");
        require(stakingRates["nodes"][_amount] != 0);
        
        uint256 stakeLockedUntil = now + stakingRates["nodes"][_amount];
        
        Node storage n = nodes[msg.sender];
        
        n.nodeIp = _nodeIp;
        n.nodePublicKey = _nodePublicKey;
        n.isStaked = true;
        n.amountStaked = _amount;
        n.stakeLockedUntil = stakeLockedUntil;
        
        return true;
    }
    
    ///
    /// Add Core to Registry 
    ///
    /// @notice Adds a Core to the staking registry
    /// @param _coreIp is the IPV4 address of the Core
    /// @param _corePublicKey is the public key of the Core Operator
    /// @param _amount is the amount of TNT the Core has staked
    /// @return Core
    /// @dev msg.sender is expected to be the Core Operator
    /// @dev tokens will be deducted from the Core Operator and added to the balance of the ChainpointRegistry Address
    /// @dev owner has ability to pause this operation indirectly
    function _addCoreToRegistry(bytes32 _coreIp, bytes32 _corePublicKey, uint256 _amount) internal returns (bool) {
        require(!cores[msg.sender].isStaked, "core has already staked. invoke updateStake() method to update");
        require(_coreIp != 0, "node IP address is required");
        require(_corePublicKey != 0, "node public key is required is required");
        require(_amount >= stakingRates["defaultCoreStake"][0], "minimum staking amount not met");
        
        uint256 stakeLockedUntil = now + stakingRates["defaultCoreDuration"][0];
        
        Core storage c = cores[msg.sender];
        
        c.coreIp = _coreIp;
        c.corePublicKey = _corePublicKey;
        c.isStaked = true;
        c.isHealthy = true;
        c.amountStaked = _amount;
        c.stakeLockedUntil = stakeLockedUntil;
        
        return true;
    }
}
