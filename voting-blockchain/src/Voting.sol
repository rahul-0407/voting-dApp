// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

interface IZKVerifier {
    function verifyProof(
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c,
        uint256[4] memory input
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
        address[] allowedVoters;
        mapping(address => bool) hasVoted;
        mapping(uint256 => uint256) votesByIndex;
        mapping(bytes32 => bool) nullifierUsed;
        uint256 totalVotes;
    }

    // store a array of all polls
    Poll[] public allPolls;

    // to find an poll with pollId
    mapping(string => uint256) public pollIndex;
    mapping(string => bool) public pollExists;

    // to find polls created by any user
    mapping(address => string[]) public userCreatedPolls;
    mapping(address => string[]) public userVotedPolls;

    IZKVerifier public zkVerifier;

    event PollCreated(string indexed pollId, address indexed creator, Visibility visible, VotingMode votingMode);
    event AllowedVotersAdded(string indexed pollId, address[] voters);
    event VoteCasted(string indexed pollId, address indexed voter, uint256 optionIndex);
    event AnonymousVoteCasted(string indexed pollId, bytes32 nullifier);
    event PollEnded(string indexed pollId, string winningOption, uint256 winningVotes);

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
        require(_startTime >= block.timestamp, "Start time must be in future");
        require(_endTime > _endTime, "End time must be after start time");

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
        newPoll.allowedVoters = new address[](0);
        newPoll.totalVotes = 0;

        for (uint256 i = 0; i < _options.length; i++) {
            newPoll.votesByIndex[i] = 0;
        }

        pollIndex[_pollId] = index;
        pollExists[_pollId] = true;
        userCreatedPolls[msg.sender].push(_pollId);

        emit PollCreated(_pollId, msg.sender, _visible, _votingMode);
    }

    function addAllowedVoter(string memory _pollId, address[] memory _voters) external onlyCreator(_pollId) {
        uint256 index = pollIndex[_pollId];
        Poll storage poll = allPolls[index];

        require(poll.visible == Visibility.Private, "Its not an private poll");

        for (uint256 i = 0; i < _voters.length; i++) {
            require(_voters[i] != address(0), "Invalid voter address");
            poll.allowedVoters.push(_voters[i]);
        }

        emit AllowedVotersAdded(_pollId, _voters);
    }


    // Standard voting 
    function vote(string memory _pollId, string memory _optionIndex) external pollActive(_pollId) {
        uint256 index = pollIndex[_pollId];
        Poll storage poll = allPolls[index];

        require(poll.votingMode == VotingMode.Standard, "This poll requires anonymous voting");
        require(!poll.hasVoted[msg.sender], "Already voted");
        require(_optionIndex < poll.options.length, "Invalid option index");
        // require(isValidOption(poll, _option), "Invalid option");

        if (poll.visible == Visibility.Private) {
            require(isAllowedVoter(poll, msg.sender), "Not authorized to vote in this private poll");
        }

        poll.hasVoted[msg.sender] = true;
        poll.votesByIndex[_optionIndex]++;
        poll.totalVotes++;
        userVotedPolls[msg.sender].push(_pollId)


        emit VoteCasted(_pollId, msg.sender, _optionIndex);

        if(block.timestamp >= poll.endTime) {
            terminatePoll(_pollId, index);
        }
    }


    // ZK ANONYMOUS VOTING
    function voteAnonymous(string memory _pollId, uint256 _optionIndex, bytes32 _nullifier,  uint256[2] memory a, uint256[2][2] memory b, uint256[2] memory c) external {
        
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

        string memory winningOption = "";
        uint256 maxVotes = 0;

        for(uint256 i=0; i<poll.options.length;i++){
            string memory option = poll.options[i];
            if(poll.votes[option]>maxVotes){
                maxVotes = poll.votes[option];
                winningOption = option;
            }
        }

        emit PollEnded(_pollId, winningOption, maxVotes);
    }

    // function isValidOption(Poll storage _poll, string memory _option) internal view returns (bool) {
    //     for (uint256 i = 0; i < _poll.options.length; i++) {
    //         if (keccak256(bytes(_poll.options[i])) == keccak256(bytes(_option))) {
    //             return true;
    //         }
    //     }
    //     return false;
    // }

    function isAllowedVoter(Poll storage _poll, address _voter) internal view returns (bool) {
        for (uint256 i = 0; i < _poll.allowedVoters.length; i++) {
            if (_poll.allowedVoters[i] == _voter) {
                return true;
            }
        }
        return false;
    }

    struct PollData{
        string pollId;
        address creator;
        string question;
        string[] options;
        Visibility visible;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        uint256 totalVotes;
        bool hasVoted;
        uint256[] voteCounts;
    }

    function getAllPublicPolls(address _user) external view returns(PollData[] memory) {
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
            myPolls[i] = _createPollData(poll, _user, true); // Show results for creator
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
            votedPolls[i] = _createPollData(poll, _user, true); // Show results if voted
        }
        
        return votedPolls;
    }

    function _createPollData(Poll storage _poll, address _user, bool _showResults) internal view returns(PollData memory) {
        uint256[] memory voteCounts = new uint256[](_poll.options.length);

        if (_showResults || !_poll.isActive || _poll.hasVoted[_user]) {
            for (uint256 i = 0; i < _poll.options.length; i++) {
                voteCounts[i] = _poll.votes[_poll.options[i]];
            }
        }

        return PollData({
            pollId: _poll.pollId,
            creator: _poll.creator,
            question: _poll.question,
            options: _poll.options,
            visible: _poll.visible,
            startTime: _poll.startTime,
            endTime: _poll.endTime,
            isActive: _poll.isActive,
            totalVotes: _poll.totalVotes,
            hasVoted: _poll.hasVoted[_user],
            voteCounts: voteCounts

        });
    }

    fucnction getPollDetail(string memory ,pollId, address user) external view return (PollData memory) {
        require(pollExists[_pollId], "Poll does not exist");
        uint256 index = pollIndex[_pollId];
        Poll storage poll = allPolls[index];

        if(poll.visible == Visibility.Private){
            require(poll.creator == user || isAllowedVoter(poll, user), "Not authorized to view the private polls");
        }

        boll showResult = poll.creator == user || poll.hasVoted[user];
        return _createPollData(poll, user, showResult);
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
        
        if (poll.visible == Visibility.Private && !isAllowedVoter(poll, _user)) {
            return (false, "Not authorized to vote in this private poll");
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
            
            // Count public active polls
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
