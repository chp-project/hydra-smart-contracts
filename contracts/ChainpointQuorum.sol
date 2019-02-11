pragma solidity >=0.4.22 <0.6.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

import "./lib/SafeMath.sol";

contract ChainpointQuorum {
    using SafeMath for uint256;
  
    /// @title TNT Token Contract
    string public name = "Chainpoint Registry";
    
    ///
    /// MAPPINGS
    ///
    /// @title Registered Chainpoint Nodes
    /// @notice Contains all Chainpoint Nodes that have staked and are participating in the Chainpoint Network
    /// @dev Key is ethereum account for Chainpoint Node owner
    /// @dev Value is struct representing Node attributes
    mapping (string => Ballot) private registeredBallots;
    
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
    }
  
}