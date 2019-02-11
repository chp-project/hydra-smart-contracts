pragma solidity >=0.4.22 <0.6.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

import "./ChainpointRegistry.sol";
import "./lib/ChainpointRegistryInterface.sol";
import "./lib/SafeMath.sol";
import "./lib/ERC20.sol";

contract ChainpointQuorum {
    using SafeMath for uint256;
  
    /// @title TNT Token Contract
    string public name = "Chainpoint Registry";
    
    /// @title TNT Token Contract
    /// @notice Standard ERC20 Token
    ERC20 private token;
    
    /// @title TNT Token Contract
    /// @notice Standard ERC20 Token
    ChainpointRegistryInterface private chainpointRegistry;
    
    ///
    /// MAPPINGS
    ///
    /// @title Registered Ballots
    /// @notice Contains all Chainpoint Nodes that have staked and are participating in the Chainpoint Network
    /// @dev Key is ethereum account for Chainpoint Node owner
    /// @dev Value is struct representing Node attributes
    mapping (string => Ballot) private registeredBallots;
    
    mapping (string => mapping(bytes32 => VotingRound)) methodVotingRounds;
    
    ///
    /// TYPES 
    ///
    /// @title BallotType
    /// @notice BallotType is an enum that only supports two values: majority or threshold
    enum BallotType {majority, threshold}
    
    /// @title Ballot
    /// @notice Ballot struct which contains all relevant ballot parameters
    /// @dev method name of the method that needs Quorum capability
    /// @dev ballotType Enum (majority|threshold)
    /// @dev numOfVoters is the amount of TNT the node has staked
    /// @dev votingWindow Number of blocks that the voting round is open for
    /// @dev startBlock Block height in which voting window begins
    struct Ballot {
        string method;
        BallotType ballotType;
        uint256 numOfVoters;
        uint256 threshold;
        uint256 votingWindow;
        uint256 startBlock;
        bool isActive;
    }
    
    struct VotingRound {
        uint256 startBlock;
        uint256 endBlock;
        Vote[] votes;
    }
    
    /// @title Vote
    /// @notice Ballot struct which contains all relevant ballot parameters
    /// @dev voter Address of the party submitting a vote
    /// @dev block Block height at which the vote was registered
    struct Vote {
        address voter;
        uint256 block;
    }
    
    constructor (address _token, address _registry) public {
        require(_token != address(0), "token address cannot be 0x0");
        token = ERC20(_token);
        chainpointRegistry = ChainpointRegistryInterface(_registry);
    }
    
    ///
    /// Register Ballot for method
    ///
    /// @notice Creates a Ballot for a smart contract method
    /// @param _method Name of the smart contract method
    /// @param _ballotType Enum (majority|threshold)
    /// @param _threshold Min. number of votes required for consesnsus
    /// @param _votingWindow Duration of voting windows expressed in number of blocks
    /// @return Core
    /// @dev msg.sender is expected to be the Core Operator
    /// @dev tokens will be deducted from the Core Operator and added to the balance of the ChainpointRegistry Address
    /// @dev owner has ability to pause this operation indirectly
    function registerBallot(string memory _method, string memory _ballotType, int256 _threshold, int256 _votingWindow) public returns (bool) {
        require(registeredBallots[_method].isActive, 'method has a ballot registered already');
        
        Ballot storage b = registeredBallots[_method];
        
        // c.coreIp = _coreIp;
        
        
    }
  
}