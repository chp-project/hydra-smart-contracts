pragma solidity >=0.4.22 <0.6.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

import "./lib/ERC20.sol";
import "./lib/SafeMath.sol";


contract ChainpointRegistry is Ownable, Pausable {
    using SafeMath for uint256;
    
    /// @title TNT Token Contract
    string public name = "Chainpoint Registry";
    
    address public registryAddress = address(this);
    
    /// @title TNT Token Contract
    /// @notice Standard ERC20 Token
    ERC20 public token;
    
    // @title Chainpoint Quorum Smart Contract address
    address quorumContractAddress;

    uint256 public NODE_STAKING_AMOUNT = 500000000000; // 5000 TNT specified in grains
    uint256 public NODE_STAKING_DURATION = 120; // 2mins specified in seconds TODO: fix for PROD
    
    uint256 public CORE_STAKING_AMOUNT = 2500000000000; // 25,000 TNT specified in grains
    uint256 public CORE_STAKING_DURATION = 120; // 10mins specified in seconds TODO: fix for PROD
    
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
    
    /// @title Registered Node IP Addresses
    /// @notice Contains all the Public IP Addresses corresponding to Staked Nodes
    /// @dev Key is the sum of the public IP address
    /// @dev Value is a boolean (defaults to false) which informs whether or not the IP address is being used
    mapping (uint32 => bool) public allocatedIps;
    
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
    /// @dev rewardsAddr is the ETH Address in which rewards will be sent to
    /// @dev amountStaked is the amount of TNT the node has staked
    struct Node {
      uint32 nodeIp;
      address rewardsAddr;
      bool isStaked;
      uint256 amountStaked;
      uint256 stakeLockedUntil;
    }
    
    /// @title Chainpoint Core Operator
    /// @notice Contains the Core Operator state on the Chainpoint network
    /// @dev coreIp is the IPV4 address of the Node
    /// @dev staked Node is actively staked
    /// @dev isHealthy Will always be true unless a Core is acting in bad faith and is therefore being punished by the rest of the Network
    /// @dev amountStaked is the amount of TNT the node has staked
    /// @dev stakeLockedUntil is the epoch timestamp up to when the Node is staked into the Chainpoint Network
    struct Core {
      uint32 coreIp;
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
        uint32 _nodeIp,
        address _rewardsAddr,
        uint256 _amountStaked,
        uint256 _duration
    );
    
    /// @notice emitted on successful update of a Node's stake
    /// @param _sender Node Operator staking a node
    /// @param _nodeIp is the Node's IP Address
    /// @param _amountStaked is the amount the Node has staked
    /// @param _duration is the epoch timestamp up to when the Node is staked into the Chainpoint Network
    event NodeStakeUpdated(
        address indexed _sender,
        uint32 _nodeIp,
        uint256 _amountStaked,
        uint256 _duration
    );

    /// @notice emitted on successful un-staking of a Node
    /// @param _sender Node Operator staking a node
    /// @param _nodeIp is the Node's IP Address
    /// @param _amountStaked is the amount the Node has staked
    event NodeUnStaked(
        address indexed _sender,
        uint32 _nodeIp,
        uint256 _amountStaked
    );

    /// @notice emitted on successful Node staking
    /// @param _sender Core Operator staking a node
    /// @param _coreIp IP address of Core Node
    /// @param _isHealthy Is Core Operator currently Active
    /// @param _amountStaked is the total amount of TNT the Node has staked
    /// @param _duration is the epoch timestamp up to when the Node is staked into the Chainpoint Network
    event CoreStaked(
        address indexed _sender,
        uint32 _coreIp,
        bool _isHealthy,
        uint256 _amountStaked,
        uint256 _duration
    );
    
    /// @notice emitted on successful Node staking
    /// @param _sender Core Operator staking a node
    /// @param _coreIp IP address of Core Node
    /// @param _isHealthy Is Core Operator currently Active
    /// @param _amountStaked is the total amount of TNT the Node has staked
    /// @param _duration is the epoch timestamp up to when the Node is staked into the Chainpoint Network
    event CoreStakeUpdated(
        address indexed _sender,
        uint32 _coreIp,
        bool _isHealthy,
        uint256 _amountStaked,
        uint256 _duration
    );

    /// @notice emitted on successful un-staking of a Core
    /// @param _sender Core Operator whom is un-staking a Core
    /// @param _coreIp is the Cores's IP Address
    /// @param _amountStaked is the amount the Core has staked
    event CoreUnStaked(
        address indexed _sender,
        uint32 _coreIp,
        uint256 _amountStaked
    );
    
    ///
    /// Chainpoint Node staking
    ///
    /// @notice Allows a Node to stake into the Chainpoint Network
    /// @param _nodeIp is the IPV4 address of the Node
    /// @param _rewardsAddr is ETH Address in which rewards will be sent to
    /// @return true if successful, otherwise false
    function stake(uint32 _nodeIp, address _rewardsAddr) public whenNotPaused returns (bool) {
        require(_addNodeToRegistry(_nodeIp, _rewardsAddr), "node did not stake into the chainpoint network");
        
        emit NodeStaked(
            msg.sender,
            _nodeIp,
            _rewardsAddr,
            NODE_STAKING_AMOUNT,
            NODE_STAKING_DURATION
        );
        
        require(token.transferFrom(msg.sender, address(this), NODE_STAKING_AMOUNT), "transferFrom failed");

        return true;
    }
    
    ///
    /// Chainpoint Core staking overloaded function definitions
    ///
    /// @notice Allows a Node to stake into the Chainpoint Network
    /// @param _coreIp is the IPV4 address of the Node
    /// @return true if successful, otherwise false
    function stakeCore(uint32 _coreIp) public whenNotPaused returns (bool) {
        require(_addCoreToRegistry(_coreIp), "node did not stake into the chainpoint network");
        
        emit CoreStaked(
            msg.sender,
            _coreIp,
            true,
            CORE_STAKING_AMOUNT,
            CORE_STAKING_DURATION
        );
        
        require(token.transferFrom(msg.sender, address(this), CORE_STAKING_AMOUNT), "transferFrom failed");

        return true;
    }
    
    ///
    /// Update Node Information
    ///
    /// @notice Allows a Node renew their stake into the Chainpoint Network
    /// @param _nodeIp is the new IP address of the staked Chainpoint Node
    /// @return true if successful, otherwise false
    /// @dev msg.sender is expected to be the Node Operator
    /// @dev tokens will be deducted from the Node Operator and added to the balance of the ChainpointRegistry Address
    /// @dev owner has ability to pause this operation
    function updateStake(uint32 _nodeIp) public whenNotPaused returns (bool) {
        require(nodes[msg.sender].isStaked, "node has not staked into the Chainpoint network");
        require(_nodeIp != 0, "node IP address is required");
        
        Node storage n = nodes[msg.sender];
        if (n.nodeIp != _nodeIp) {
            require(allocatedIps[_nodeIp] == false, "Public IP Address is already in use");
            n.nodeIp = _nodeIp;

            emit NodeStakeUpdated(
                msg.sender,
                n.nodeIp,
                n.amountStaked,
                n.stakeLockedUntil
            );
        }

        return true;
    }
    
    ///
    /// Update Core Information
    ///
    /// @notice Allows a Core to update their metadata
    /// @param _coreIp is the new IP address of the staked Core Operator
    /// @return true if successful, otherwise false
    /// @dev msg.sender is expected to be the Node Operator
    /// @dev tokens will be deducted from the Node Operator and added to the balance of the ChainpointRegistry Address
    /// @dev owner has ability to pause this operation
    function updateStakeCore(uint32 _coreIp) public whenNotPaused returns (bool) {
        require(cores[msg.sender].isStaked, "core has not staked into the Chainpoint network");
        require(_coreIp != 0, "core IP address is required");
        
        Core storage c = cores[msg.sender];
        // If updating public IP Address, ensure that it is unique
        if (c.coreIp != _coreIp) {
            require(allocatedIps[_coreIp] == false, "Public IP Address is already in use");
            c.coreIp = _coreIp;

            emit CoreStakeUpdated(
                msg.sender,
                c.coreIp,
                c.isHealthy,
                c.amountStaked,
                c.stakeLockedUntil
            );
        }

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
        require(nodes[msg.sender].isStaked == true, "node has not staked into the Chainpoint network");
        require(now >= nodes[msg.sender].stakeLockedUntil, "tokens are timelocked");

        Node storage n = nodes[msg.sender];
        uint32 nodeIp = n.nodeIp;
        uint256 amountStaked = n.amountStaked;

        delete allocatedIps[nodeIp];
        delete nodes[msg.sender];
        
        require(token.transfer(msg.sender, amountStaked), "transfer failed");

        emit NodeUnStaked(
            msg.sender,
            nodeIp,
            amountStaked
        );
        
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

        Core storage c = cores[msg.sender];
        
        delete allocatedIps[cores[msg.sender].coreIp];
        delete cores[msg.sender];
        
        require(token.transfer(msg.sender, cores[msg.sender].amountStaked), "transferFrom failed");
        
        emit CoreUnStaked(
            msg.sender,
            c.coreIp,
            c.amountStaked
        );

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
    function isHealthyCore(address _address) public view returns (bool) {
        return cores[_address].isHealthy;
    }
    
    ///
    /// Get White-listed Core Operators
    ///
    /// @notice Will return true if _address is pushed to whitelistedCoresArr, else if the _address is already included in the list return false
    /// @return bool if successful, otherwise false
    /// @dev msg.sender is expected to be the Node Operator
    /// @dev owner has ability to pause this operation
    function whitelistCore(address _address) public onlyOwnerOrCoreOperator returns (bool) {
        require(_address != address(0));
        
        whitelistedCoresArr.push(_address);
        
        return true;
    }
    
    ///
    /// Add node to registry 
    ///
    /// @notice Adds a Node to the staking registry
    /// @param _nodeIp is the IPV4 address of the Node
    /// @param _rewardsAddr is the ETH Address in which rewards will be sent to
    /// @return Node
    /// @dev msg.sender is expected to be the Node Operator
    /// @dev tokens will be deducted from the Node Operator and added to the balance of the ChainpointRegistry Address
    /// @dev owner has ability to pause this operation
    function _addNodeToRegistry(uint32 _nodeIp, address _rewardsAddr) internal returns (bool) {
        require(!nodes[msg.sender].isStaked, "node has already staked. invoke renewStake() method to renew");
        require(_nodeIp != 0 && allocatedIps[_nodeIp] == false, "node IP address is required");
        
        uint256 stakeLockedUntil = now + NODE_STAKING_DURATION;
        
        Node storage n = nodes[msg.sender];
        
        n.nodeIp = _nodeIp;
        n.rewardsAddr = _rewardsAddr;
        n.isStaked = true;
        n.amountStaked = NODE_STAKING_AMOUNT;
        n.stakeLockedUntil = stakeLockedUntil;

        // Allocate IP Address to ensure uniqueness
        allocatedIps[_nodeIp] = true;
        
        return true;
    }
    
    ///
    /// Add Core to Registry 
    ///
    /// @notice Adds a Core to the staking registry
    /// @param _coreIp is the IPV4 address of the Core
    /// @return Core
    /// @dev msg.sender is expected to be the Core Operator
    /// @dev tokens will be deducted from the Core Operator and added to the balance of the ChainpointRegistry Address
    /// @dev owner has ability to pause this operation indirectly
    function _addCoreToRegistry(uint32 _coreIp) internal returns (bool) {
        require(!cores[msg.sender].isStaked, "core has already staked. invoke updateStake() method to update");
        require(_coreIp != 0 && allocatedIps[_coreIp] == false, "node IP address is required");
        
        uint256 stakeLockedUntil = now + CORE_STAKING_DURATION;
        
        Core storage c = cores[msg.sender];
        
        c.coreIp = _coreIp;
        c.isStaked = true;
        c.isHealthy = true;
        c.amountStaked = CORE_STAKING_AMOUNT;
        c.stakeLockedUntil = stakeLockedUntil;

        // Allocate IP to ensure uniqueness
        allocatedIps[_coreIp] = true;
        
        return true;
    }
}
