// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

interface IZKVerifier {
    function verifyProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[5] memory input  // ✅ CHANGED: 4 → 5 to match Verifier
    ) external view returns (bool);
}

contract PollFactory {
    enum VotingMode{
        Standard,
        Anonymous
    }

    enum Visibility {
        Public,
        Private
    }

    struct Poll {
        string pollId;
        address creator;
        string question;
        string[] options;
        Visibility visible;
        VotingMode votingMode;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        mapping(address => bool) hasVoted;
        mapping(uint256 => uint256) votesByIndex;
        mapping(bytes32 => bool) nullifierUsed;
        uint256 totalVotes;
    }

    Poll[] public allPolls;
    mapping(string => uint256) public pollIndex;
    mapping(string => bool) public pollExists;
    mapping(address => string[]) public userCreatedPolls;
    mapping(address => string[]) public userVotedPolls;

    IZKVerifier public zkVerifier;

    event PollCreated(string indexed pollId, address indexed creator, Visibility visible, VotingMode votingMode);
    event VoteCasted(string indexed pollId, address indexed voter, uint256 optionIndex);
    event AnonymousVoteCasted(string indexed pollId, bytes32 nullifier);
    event PollEnded(string indexed pollId, uint256 winningOptionIndex, uint256 winningVotes);

    constructor(address _zkVerifier) {
        zkVerifier = IZKVerifier(_zkVerifier);
    }

    modifier onlyCreator(string memory _pollId) {
        require(pollExists[_pollId], "Poll does not exist");
        uint256 index = pollIndex[_pollId];
        require(allPolls[index].creator == msg.sender, "Only poll creator can perform this action");
        _;
    }

    modifier validPollId(string memory _pollId) {
        require(bytes(_pollId).length > 0, "Poll ID can not be empty");
        require(!pollExists[_pollId], "Poll already exist");
        _;
    }

    modifier pollActive(string memory _pollId) {
        require(pollExists[_pollId], "Poll does not exist");
        uint256 index = pollIndex[_pollId];
        Poll storage poll = allPolls[index];
        require(poll.isActive, "Poll is not active");
        require(block.timestamp >= poll.startTime, "Poll has not started");
        require(block.timestamp <= poll.endTime, "Poll has ended");
        _;
    }

    function createPoll(
        string memory _pollId,
        string memory _question,
        string[] memory _options,
        Visibility _visible,
        VotingMode _votingMode,
        uint256 _startTime,
        uint256 _endTime
    ) external validPollId(_pollId) {
        require(bytes(_question).length > 0, "Question cannot be empty");
        require(_options.length >= 2 && _options.length <= 10, "Must be two Options");
        require(_startTime > block.timestamp, "Start time must be in future");
        require(_endTime > _startTime, "End time must be after start time");

        allPolls.push();
        uint256 index = allPolls.length - 1;

        Poll storage newPoll = allPolls[index];
        newPoll.pollId = _pollId;
        newPoll.creator = msg.sender;
        newPoll.question = _question;
        newPoll.options = _options;
        newPoll.visible = _visible;
        newPoll.votingMode = _votingMode;
        newPoll.startTime = _startTime;
        newPoll.endTime = _endTime;
        newPoll.isActive = true;
        newPoll.totalVotes = 0;

        for (uint256 i = 0; i < _options.length; i++) {
            newPoll.votesByIndex[i] = 0;
        }

        pollIndex[_pollId] = index;
        pollExists[_pollId] = true;
        userCreatedPolls[msg.sender].push(_pollId);

        emit PollCreated(_pollId, msg.sender, _visible, _votingMode);
    }

    // Standard voting 
    function vote(string memory _pollId, uint256  _optionIndex) external pollActive(_pollId) {
        uint256 index = pollIndex[_pollId];
        Poll storage poll = allPolls[index];

        require(poll.votingMode == VotingMode.Standard, "This poll requires anonymous voting");
        require(!poll.hasVoted[msg.sender], "Already voted");
        require(_optionIndex < poll.options.length, "Invalid option index");

        poll.hasVoted[msg.sender] = true;
        poll.votesByIndex[_optionIndex]++;
        poll.totalVotes++;
        userVotedPolls[msg.sender].push(_pollId);

        emit VoteCasted(_pollId, msg.sender, _optionIndex);

        if(block.timestamp >= poll.endTime) {
            terminatePoll(_pollId, index);
        }
    }

    // ✅ FIXED: ZK ANONYMOUS VOTING - Now matches circuit output
    function voteAnonymous(
        string memory _pollId, 
        uint256 _optionIndex, 
        bytes32 _nullifier,  
        uint256[2] memory a, 
        uint256[2][2] memory b, 
        uint256[2] memory c
    ) external pollActive(_pollId) {
        uint256 index = pollIndex[_pollId];
        Poll storage poll = allPolls[index];

        require(poll.votingMode == VotingMode.Anonymous, "This poll uses standard voting");
        require(!poll.nullifierUsed[_nullifier], "Already voted with this nullifier");
        require(_optionIndex < poll.options.length, "Invalid option index");

        // ✅ FIXED: Public inputs now match circuit output order
        // Circuit outputs: [contractAddress, pollIdHash, optionIndex, nullifier, optionIndexOut]
        uint256[5] memory publicInputs = [
            uint256(uint160(address(this))),      // [0] contractAddress
            uint256(keccak256(bytes(_pollId))),   // [1] pollIdHash
            _optionIndex,                          // [2] optionIndex (matches circuit)
            uint256(_nullifier),                   // [3] nullifier (matches circuit output)
            _optionIndex                           // [4] optionIndexOut (duplicate for verification)
        ];

        require(zkVerifier.verifyProof(a, b, c, publicInputs), "Invalid ZK Proof");

        poll.nullifierUsed[_nullifier] = true;
        poll.votesByIndex[_optionIndex]++;
        poll.totalVotes++;

        emit AnonymousVoteCasted(_pollId, _nullifier);

        if (block.timestamp >= poll.endTime) {
            terminatePoll(_pollId, index);
        }
    }

    function endPoll(string memory _pollId) external {
        require(pollExists[_pollId],"Poll does not exist");

        uint256 index = pollIndex[_pollId];
        Poll storage poll = allPolls[index];

        require(poll.isActive,"Poll already ended");

        require(
            block.timestamp >= poll.endTime || msg.sender == poll.creator,
            "Poll not yet ended or not creator"
        );
        
        terminatePoll(_pollId, index);
    }

    function terminatePoll(string memory _pollId, uint256 _index) internal {
        Poll storage poll = allPolls[_index];
        poll.isActive = false;

        uint256 winningOptionIndex = 0;
        uint256 maxVotes = 0;

        for (uint256 i = 0; i < poll.options.length; i++) {
            if (poll.votesByIndex[i] > maxVotes) {
                maxVotes = poll.votesByIndex[i];
                winningOptionIndex = i;
            }
        }

        emit PollEnded(_pollId, winningOptionIndex, maxVotes);
    }

    struct PollData {
        string pollId;
        address creator;
        string question;
        string[] options;
        Visibility visible;
        VotingMode votingMode;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        uint256 totalVotes;
        bool hasVoted;
        uint256[] voteCounts;
    }

    function getAllPublicPolls(address _user) 
        external 
        view 
        returns (PollData[] memory) 
    {
        uint256 count = 0;
        for (uint256 i = 0; i < allPolls.length; i++) {
            if (allPolls[i].visible == Visibility.Public && 
                allPolls[i].isActive && 
                block.timestamp >= allPolls[i].startTime && 
                block.timestamp <= allPolls[i].endTime) {
                count++;
            }
        }

        PollData[] memory publicPolls = new PollData[](count);
        uint256 index = 0;

        for (uint256 i = 0; i < allPolls.length; i++) {
            Poll storage poll = allPolls[i];
            if (poll.visible == Visibility.Public && 
                poll.isActive && 
                block.timestamp >= poll.startTime && 
                block.timestamp <= poll.endTime) {
                
                publicPolls[index] = _createPollData(poll, _user, false);
                index++;
            }
        }

        return publicPolls;
    }

    function getMyCreatedPolls(address _user) 
        external 
        view 
        returns (PollData[] memory) 
    {
        string[] memory pollIds = userCreatedPolls[_user];
        PollData[] memory myPolls = new PollData[](pollIds.length);

        for (uint256 i = 0; i < pollIds.length; i++) {
            uint256 index = pollIndex[pollIds[i]];
            Poll storage poll = allPolls[index];
            myPolls[i] = _createPollData(poll, _user, true);
        }

        return myPolls;
    }

    function getMyVotedPolls(address _user) 
        external 
        view 
        returns (PollData[] memory) 
    {
        string[] memory pollIds = userVotedPolls[_user];
        PollData[] memory votedPolls = new PollData[](pollIds.length);

        for (uint256 i = 0; i < pollIds.length; i++) {
            uint256 index = pollIndex[pollIds[i]];
            Poll storage poll = allPolls[index];
            votedPolls[i] = _createPollData(poll, _user, true);
        }

        return votedPolls;
    }

    function _createPollData(
        Poll storage _poll,
        address _user,
        bool _showResults
    ) internal view returns (PollData memory) {
        uint256[] memory voteCounts = new uint256[](_poll.options.length);

        if (_showResults || !_poll.isActive || _poll.hasVoted[_user]) {
            for (uint256 i = 0; i < _poll.options.length; i++) {
                voteCounts[i] = _poll.votesByIndex[i];
            }
        }

        return PollData({
            pollId: _poll.pollId,
            creator: _poll.creator,
            question: _poll.question,
            options: _poll.options,
            visible: _poll.visible,
            votingMode: _poll.votingMode,
            startTime: _poll.startTime,
            endTime: _poll.endTime,
            isActive: _poll.isActive,
            totalVotes: _poll.totalVotes,
            hasVoted: _poll.hasVoted[_user],
            voteCounts: voteCounts
        });
    }

    function getPollDetails(
        string memory _pollId, 
        address _user
    ) external view returns (PollData memory) {
        require(pollExists[_pollId], "Poll does not exist");
        uint256 index = pollIndex[_pollId];
        Poll storage poll = allPolls[index];

        bool showResults = poll.creator == _user || poll.hasVoted[_user];
        return _createPollData(poll, _user, showResults);
    }

    function getPollResults(string memory _pollId) 
        external 
        view 
        returns (string[] memory options, uint256[] memory voteCounts) 
    {
        require(pollExists[_pollId], "Poll does not exist");
        uint256 index = pollIndex[_pollId];
        Poll storage poll = allPolls[index];

        options = poll.options;
        voteCounts = new uint256[](options.length);

        for (uint256 i = 0; i < options.length; i++) {
            voteCounts[i] = poll.votesByIndex[i];
        }
    }

    function hasUserVoted(string memory _pollId, address _user) 
        external 
        view 
        returns (bool) 
    {
        require(pollExists[_pollId], "Poll does not exist");
        uint256 index = pollIndex[_pollId];
        return allPolls[index].hasVoted[_user];
    }

    function isNullifierUsed(string memory _pollId, bytes32 _nullifier) 
        external 
        view 
        returns (bool) 
    {
        require(pollExists[_pollId], "Poll does not exist");
        uint256 index = pollIndex[_pollId];
        return allPolls[index].nullifierUsed[_nullifier];
    }

    function canUserVote(string memory _pollId, address _user) 
        external 
        view 
        returns (bool canVote, string memory reason) 
    {
        if (!pollExists[_pollId]) {
            return (false, "Poll does not exist");
        }

        uint256 index = pollIndex[_pollId];
        Poll storage poll = allPolls[index];

        if (!poll.isActive) {
            return (false, "Poll has ended");
        }

        if (block.timestamp < poll.startTime) {
            return (false, "Poll has not started yet");
        }

        if (block.timestamp > poll.endTime) {
            return (false, "Poll time has expired");
        }

        if (poll.hasVoted[_user]) {
            return (false, "Already voted in this poll");
        }

        return (true, "Can vote");
    }

    function getTotalPolls() external view returns (uint256) {
        return allPolls.length;
    }

    function getPollsByStatus(address _user) 
        external 
        view 
        returns (
            uint256 activeCount,
            uint256 endedCount,
            uint256 createdCount,
            uint256 votedCount
        ) 
    {
        createdCount = userCreatedPolls[_user].length;
        votedCount = userVotedPolls[_user].length;

        for (uint256 i = 0; i < allPolls.length; i++) {
            Poll storage poll = allPolls[i];

            if (poll.visible == Visibility.Public) {
                if (poll.isActive && 
                    block.timestamp >= poll.startTime && 
                    block.timestamp <= poll.endTime) {
                    activeCount++;
                } else {
                    endedCount++;
                }
            }
        }
    }
}