pragma solidity >=0.4.22 <0.6.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

contract ChainpointRegistryInterface is Ownable, Pausable {
    // EVENTS
    event NodeStaked(
        address indexed _sender,
        bytes32 _nodeIp,
        bytes32 _nodePublicKey,
        uint256 _amountStaked,
        uint256 _duration
    );
    
    event NodeStakeUpdated(
        address indexed _sender,
        bytes32 _nodeIp,
        bytes32 _publicKey,
        uint256 _amountStaked,
        uint256 _duration
    );
    
    event CoreStaked(
        address indexed _sender,
        bytes32 _coreIp,
        bytes32 _corePublicKey,
        bool _isHealthy,
        uint256 _amountStaked,
        uint256 _duration
    );
    
    event CoreStakeUpdated(
        address indexed _sender,
        bytes32 _coreIp,
        bytes32 _corePublicKey,
        bool _isHealthy,
        uint256 _amountStaked,
        uint256 _duration
    );
    
    // Variables
    address[] public coresArr;
    
    // Methods
    function stake(bytes32 _nodeIp, bytes32 _nodePublicKey, uint256 _amount) public returns (bool);
    function stakeCore(bytes32 _coreIp, bytes32 _corePublicKey, uint256 _amount) public returns (bool);
    function updateStake(bytes32 _nodeIp, bytes32 _nodePublicKey) public returns (bool);
    function updateStakeCore(bytes32 _coreIp, bytes32 _corePublicKey, bool _isCore) public returns (bool);
    function unStake() public returns (bool);
    function unStakeCore() public returns (bool);
    function totalStakedFor(address addr) public view returns (uint256 amount, uint256 unlocks_at);
    function isHealthyCore(address _address) public returns (bool);
    function getCoreCount() public view returns (uint256);
}