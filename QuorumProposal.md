# Brainstorming Quorum Specification

Introducing a generic Smart Contract that would "decorate" methods in a smart contract providing a simple voting mechanism. The premise of introducing such functionality is to "short-circuit" method calls that have not registered enough votes to reach a quorum. 

## Concepts

**Ballot:**
A Ballot is created (registered) for each method in your smart contract that you would like to decorate with the capabi

----------

**Voting Round:**
Are implicitly created upon receiving a unique hash. Voting rounds have a specified duration (in blocks). When registering a ballot, you must specify how long (# of block) the voting window will remain open. If enough votes are registered with the same hash provided within the round's voting window to reach a quorum, the result from invoking the `vote()` method will resolve successfully and allow the smart contract method to finish executing.

----------

**Vote:** Ethereum Addresses, whether contracts or externally owned accounts can only vote once. All votes carry the same weight. A vote is registered by invoking the `vote()` method exposed by the Quorum Smart Contract and accepts two arguments: 1) `msg.sender`, 2) keccak256 hash of argument(s) passed into the method upon invocation

> Conceptually, it's easier to reason with this functionality when thinking along the lines of "you are voting for this method to be executed only when a quorum has been reached over the value of the arguments provided to this method." You are indirectly voting over whether or not this method runs. More importantly you are voting on the arguments that are provided to the method being invoked.

----------

**Supported Electoral Systems:** (One of the following electoral systems must be provided upon registering a ballot for a method in your smart contract)
1. Majority - Where a 50%-plus-one-vote is required
2. Threshold - Where M is the threshold of votes required to pass, and N is the total number of votes

> NOTE: Once you've registered a ballot and specified the electoral system that is to be used, you will NOT be able to migrate to a different electoral system. 

----------

## Smart Contract API:
* registerBallot()
* updateBallot()
* deleteBallot()
* pruneVotingRounds()
* vote()

## Types:

```
type Ballot {
  string method;
  BallotType type;
  uint256 numOfVoters;
  uint256 threshold;
  uint256 votingWindow;
  uint256 startBlock;
}
```

```
enum BallotType {majority, threshold}
```

```
type Vote {
  address voter;
  bytes32 hash;
}
```

## registerBallot()

This method which will be invoked inside of the smart contract constructor willing to inherit the functionality that the 'Quorum Smart Contract' provides. The `registerBallot()` method will be invoked for each method in your smart contract that you want to 'decorate' with voting capabilities.

```
function registerBallot(string method, string type, uint256 numOfVoters, int256 threshold, int256 votingWindow) public returns (bool);
```

|   Properties   |  Description | Required | Type   |
|:--------------:|:------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|:--------:|--------|
| method | Name of the method you wish to decorate with Quroum functionality. | yes | string |
| type | Electoral System - Only accepted values are "majority" or "threshold". | yes | string |
| numOfVoters | The total number of registerd votes allowed to participate in voting rounds (NOTE: this number can be updated). | yes | int256 |
| threshold | Specify the number of votes required to achieve consensus. Only applies to "threshold" ballots. Provide a value of `0` if using a different type of ballot. | yes | int256 |
| votingWindow | Number of blocks before voting round is closed | yes | int256 |

#### For example:
```
contract SampleContract {
  constructor() public {
    registerBallot('mintReward', 'majority', 1, 0, 50) // (<method_name>, <election_type>, <num_of_voters>, <threshold>, <voting_window>)
    registerBallot('revokeReward', 'threshold', 5, 3, 50) // (<method_name>, <election_type>, <num_of_voters>, <threshold>, <voting_window>)
  }
  ...
}
```

<br/>

## updateBallot()

```
function updateBallot(string method, uint256 numOfVoters, int256 threshold, int256 votingWindow) public returns (bool);
```

This method will allow you to update an existing ballot. The only available parameters which are allowed to be updated are as follows: a) numOfVoters, b) threshold, c) votingWindow. As has been noted before, once a ballot has been registered, you cannot change the Electory System type. This method should be invoked after an authorization mechanism of your choice has resolved successfully. The only guardrail provided by this contract by default is whether this method is being invoked by the smart contract "Owner".

<br/>

## deleteBallot()

```
function updateBallot(string method) public returns (bool);
```

This method will "soft" delete an existing registered ballot. Meaning that a call to vote on a particular method will always resolve to `true` and thus never short-circuit. As with the `updateBallot()` method, this method should be invoked after an authorization mechanism of your choice has resolved successfully. The only guardrail provided by this contract by default is whether this method is being invoked by the smart contract "Owner".

<br/>

## pruneVotingRounds()

```
function pruneVotingRounds(string[] methods) public returns (bool);
```

This method should be invoked periodically to prune stale voting rounds. For voting rounds that never achieved consensus and have lasted longer than the max allowed voting window (number of blocks that specifies the duration of the voting round) remove them from storage. This method is automatically invoked from within the `vote()` method when a voting round resolves successfully after achieving consensus, but for voting rounds that expire and do NOT achieve consensus, you will want to invoke this method periodically to remove stale data from smart contract storage.

<br/>

## vote()

```
function vote(string method, address voter, bytes32 hash) public returns (bool);
```

The `vote()` method will be used to register a vote for a particular voting round based on the hash provided. New voting rounds are triggered by supplying a unique hash as the second argument of this function. The method will return a value of `true` if consensus has been reached based on the criteria of the Ballot's electoral system specified upon registering the ballot.

<br>

> Example:
```
contract MyTestContract is Quorum {
  QuorumInterface private quorum;

  constructor(address _quorum) {
    quorum = QuorumInterface(_quorum);
    quorum.registerBallot('mintReward', 'majority', 1, 0, 50) // (<method_name>, <election_type>, <num_of_voters>, <threshold>, <voting_window>)
  }

  function mintReward(address _addr, uint256 _amount) public returns (bool) {
    require(quorum.vote('mintReward', msg.sender, abi.encode(_addr, _amount)), "consensus has not been achieved")
    ...
    ...
  }
}
```
