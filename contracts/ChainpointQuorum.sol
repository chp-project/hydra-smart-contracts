pragma solidity >=0.4.22 <0.6.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/lifecycle/Pausable.sol";

import "./ChainpointRegistry.sol";
import "./lib/ChainpointRegistryInterface.sol";
import "./lib/SafeMath.sol";
import "./lib/ERC20.sol";

contract ChainpointQuorum is Ownable, Pausable {
    using SafeMath for uint256;
  
    /// @title TNT Token Contract
    string public name = "Chainpoint Registry";
    
    /// @title TNT Token Contract
    /// @notice Standard ERC20 Token
    ERC20 private token;
    
    /// @title Chainpoint Registry
    /// @notice Chainpoint Registry Contract
    ChainpointRegistryInterface private chainpointRegistry;
    
    ///
    /// MAPPINGS
    ///
    /// @title Registered Ballots
    /// @notice Contains all registered ballots
    /// @dev Key is hash representation of the method name
    /// @dev Value is struct representing Ballot
    mapping (bytes32 => Ballot) private registeredBallots;
    
    /// @title Methods Voting Rounds
    /// @notice Contains all of the Voting Rounds that have been triggered as a result of invoking vote() with a method hash and a unique arguments hash
    /// @dev Key is hash representation of the method name
    /// @dev Value is struct representing VotingRound
    mapping (bytes32 => mapping(bytes32 => VotingRound)) methodVotingRounds;
    
    ///
    /// ARRAYS
    ///
    /// @title List of Registered Ballots
    /// @notice Convenient list of registered ballots for iteration
    bytes32[] registeredBallotsArr;
    
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
    /// @dev votingWindow Number of blocks that the voting round is open for
    /// @dev startBlock Block height in which voting window begins
    struct Ballot {
        bytes32 methodHash;
        BallotType ballotType;
        uint256 threshold;
        uint256 votingWindow;
        uint256 startBlock;
        bool isActive;
        bytes32[] votingRoundHashes;
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
        uint256 blockHeight;
    }
    
    ///
    /// MODIFIERS
    ///
    /// @notice only Staked Core Operators or Owner can call, otherwise throw
    modifier onlyOwnerOrCoreOperator() {
        require(msg.sender == owner() || chainpointRegistry.isHealthyCore(msg.sender), "must be owner or an active core operator");
        _;
    }
    
    constructor (address _token, address _registry) public {
        require(_token != address(0), "token address cannot be 0x0");
        token = ERC20(_token);
        chainpointRegistry = ChainpointRegistryInterface(_registry);
    }
    
    ///
    /// EVENTS 
    ///
    /// @notice emitted when a Voting Round is closed
    /// @param _voter address of the voter
    /// @param _method Hash of the smart contract method
    /// @param _hash Hash of the function arguments being voted on
    /// @param _blockHeight did vote pass as a result of consensus being achieved
    event Voted(
        address _voter,
        bytes32 _method,
        bytes32 _hash,
        uint256 _blockHeight,
        uint256 _votingRoundClosesAt
    );

    ///
    /// @notice emitted when a Voting Round is closed
    /// @param _method Hash of the smart contract method
    /// @param _hash Hash of the function arguments being voted on
    /// @param _hasConsensus did vote pass as a result of consensus being achieved
    /// @param _votes number of votes for particular method + hash combo
    /// @param _expired did the Voting Round expire
    /// @param _pruned did the Voting Round get pruned from storage
    event VotingRoundClosed(
        bytes32 _method,
        bytes32 _hash,
        bool _hasConsensus,
        uint256 _votes,
        bool _expired,
        bool _pruned
    );
    
    ///
    /// Register Ballot for method
    ///
    /// @notice Creates a Ballot for a smart contract method
    /// @param _method Name of the smart contract method
    /// @param _ballotType Enum (majority|threshold)
    /// @param _threshold Min. number of votes required for consesnsus
    /// @param _votingWindow Duration of voting windows expressed in number of blocks
    /// @return bool
    /// @dev msg.sender is expected to be the Core Operator
    /// @dev owner has ability to pause this operation indirectly
    function registerBallot(bytes32 _method, string memory _ballotType, uint256 _threshold, uint256 _votingWindow) public onlyOwner returns (bool) {
        require(registeredBallots[_method].isActive, 'method has a ballot registered already');
        require(_method.length > 0, "smart contract method name is required");
        require(_votingWindow > 0, "voting window must be greater than 0");
        
        bool majorityBallot = keccak256(abi.encode(_ballotType)) == keccak256("majority");
        bool thresholdBallot = keccak256(abi.encode(_ballotType)) == keccak256("majority");
        
        require(!majorityBallot && !thresholdBallot, "method type must be one of the following values: 1) majority, 2) threshold");
        
        if(thresholdBallot) {
            require(_threshold > 0, "when Ballot Type is set to threshold, a value greater than 0 is required");
        }
        
        Ballot storage b = registeredBallots[_method];
        
        b.methodHash = _method;
        if (majorityBallot) {
            b.ballotType = BallotType.majority;
        } else {
            b.ballotType = BallotType.threshold;
        }
        
        b.threshold = (thresholdBallot) ? _threshold : 0;
        b.votingWindow = _votingWindow;
        b.startBlock = block.number;
        b.isActive = true;
        
        registeredBallotsArr.push(_method);
        
        return true;
    }
  
    ///
    /// Update Ballot for specified method
    ///
    /// @notice Updates a Ballot for a smart contract method
    /// @param _method Name of the smart contract method
    /// @param _threshold Min. number of votes required for consesnsus
    /// @param _votingWindow Duration of voting windows expressed in number of blocks
    /// @return bool
    /// @dev msg.sender is expected to be the Core Operator
    /// @dev owner has ability to pause this operation indirectly
    function updateBallot(bytes32 _method, uint256 _threshold, uint256 _votingWindow) public onlyOwner returns (bool) {
        require(registeredBallots[_method].isActive, 'ballot has not been registered for the specified method');
        require(_votingWindow > 0, "voting window must be greater than 0");
        if (registeredBallots[_method].ballotType == BallotType.threshold) {
            require(_threshold > 0, "when Ballot Type is set to threshold, a value greater than 0 is required");
        }
        
        Ballot storage b = registeredBallots[_method];
        
        b.threshold = (registeredBallots[_method].ballotType == BallotType.threshold) ? _threshold : 0;
        b.votingWindow = _votingWindow;
        
        return true;
    }

    ///
    /// Delete Ballot for specified method
    ///
    /// @notice Deletes a Ballot for a smart contract method
    /// @param _method Name of the smart contract method
    /// @return bool
    /// @dev msg.sender is expected to be the Core Operator
    /// @dev owner has ability to pause this operation indirectly
    function deleteBallot(bytes32 _method) public onlyOwner returns (bool) {
        require(registeredBallots[_method].isActive, 'ballot has not been registered for the specified method');
        
        Ballot storage b = registeredBallots[_method];
        delete registeredBallots[_method];
        
        return true;
    }
    
    ///
    /// Register a Vote
    ///
    /// @notice Submits a vote to be included in a voting round for the smart contract method specified
    /// @param _method Name of the smart contract method
    /// @param _hash Hash of the arguments the Core operator voting wants to invoke the specified method with
    /// @return bool
    /// @dev msg.sender is expected to be the Core Operator
    /// @dev owner has ability to pause this operation indirectly
    function vote(bytes32 _method, bytes32 _hash) public onlyOwnerOrCoreOperator returns (bool, bool) {
        require(registeredBallots[_method].isActive, 'ballot has not been registered for the specified method');
        
        VotingRound storage vr = methodVotingRounds[_method][_hash];
        
        // Check Voting Round exists based on the value of _hash, if it doesn't create a VotingRound and register a vote
        if (vr.startBlock > 0) {
            // Voting Round exists, check to see if round is still open; if so, register the vote
            if (block.number <= vr.endBlock) {
                vr.votes.push(Vote(msg.sender, block.number));
                
                emit Voted(msg.sender, _method, _hash, block.number, vr.endBlock);
            }
        } else {
            // Voting Round does NOT exist, create a Voting Round and register a vote
            registeredBallots[_method].votingRoundHashes.push(_hash);
            vr.startBlock = block.number;
            vr.endBlock = block.number.add(registeredBallots[_method].votingWindow);
            vr.votes.push(Vote(msg.sender, block.number));
            
            emit Voted(msg.sender, _method, _hash, block.number, vr.endBlock);
        }
        
        return _hasConsensus(_method, _hash);
    }
    
    ///
    /// Prune Ballots
    ///
    /// @notice This method must be explicitly invoked to prune Voting Rounds that have expired (aka timeout) and no longer to be persisted within the contract
    /// @return bool
    /// @dev msg.sender is expected to be the Core Operator or Owner, and can be called at the discretion of any authorized party
    /// @dev owner has ability to pause this operation indirectly
    function pruneBallots() public onlyOwnerOrCoreOperator returns (bool) {
        for (uint i=0; i < registeredBallotsArr.length; i++) {
            Ballot storage b = registeredBallots[registeredBallotsArr[i]];
            
            for (uint j=0; j < b.votingRoundHashes.length; j++) {
                VotingRound storage vr = methodVotingRounds[registeredBallotsArr[i]][b.votingRoundHashes[j]];
                
                // Check to see if current block height > VotingRound.endBlock, if so, go ahead and prune the Voting Rounds for the registered ballot
                if (block.number > vr.endBlock) {
                    _pruneBallot(registeredBallotsArr[i], b.votingRoundHashes[j]);
                }
            }
        }
        
        return true;
    }
    
    ///
    /// Has Voting Round for particular method reached consensus?
    ///
    /// @notice This method will determine if a Voting Round has successfully resolved with a consensus amongst Core Operators
    /// @return (bool consensus, bool votingRoundExpired)
    /// @dev msg.sender is expected to be the Core Operator
    /// @dev owner has ability to pause this operation indirectly
    function _hasConsensus(bytes32 _method, bytes32 _hash) private onlyOwnerOrCoreOperator returns (bool consensus, bool votingRoundExpired) {
        VotingRound storage vr = methodVotingRounds[_method][_hash];
        // Check based on BallotType
        if (registeredBallots[_method].ballotType == BallotType.threshold) {
            bool consensus = (vr.votes.length >= registeredBallots[_method].threshold);
            bool votingRoundExpired = (block.number <= vr.endBlock);
            bool votingRoundPruned;
            uint256 votes = vr.votes.length;
            
            if (consensus || votingRoundExpired) {
                votingRoundPruned = true;
                require(_pruneBallot(_method, _hash), "failed to prune voting round"); 
            }
            emit VotingRoundClosed(_method, _hash, consensus, votes, votingRoundExpired, votingRoundPruned);
            
            return (consensus, votingRoundExpired);
        } else { // BallotType == majority
            bool consensus;
            bool votingRoundExpired = (block.number <= vr.endBlock);
            bool votingRoundPruned;
            uint256 votes = vr.votes.length;
            uint256 numOfCores = chainpointRegistry.getCoreCount();
             
            // Calculate consensus for "majority" Electoral System
            if (numOfCores == 1) {
                consensus = (votes == 1);
            } else if (numOfCores == 2) {
                consensus = (votes == 2);
            } else {
                uint256 majority = numOfCores.div(2).add(1);
                consensus = (votes >= majority);
            }
            
            if (consensus || votingRoundExpired) {
                votingRoundPruned = true;
                require(_pruneBallot(_method, _hash), "failed to prune voting round"); 
            }
            
            emit VotingRoundClosed(_method, _hash, consensus, votes, votingRoundExpired, votingRoundPruned);
            
            return (consensus, votingRoundExpired);
        } // ***END {else}
        
    }
    
    ///
    /// Prune Ballot
    ///
    /// @notice Will prune Voting Rounds for the provided method and hash vote
    /// @param _method Name of the smart contract method
    /// @param _hash Hash of the arguments the Core operator voting wants to invoke the specified method with
    /// @return bool
    /// @dev msg.sender is expected to be the Core Operator
    /// @dev owner has ability to pause this operation indirectly
    function _pruneBallot(bytes32 _method, bytes32 _hash) private onlyOwnerOrCoreOperator returns (bool) {
        delete methodVotingRounds[_method][_hash];
        
        return true;
    }
}