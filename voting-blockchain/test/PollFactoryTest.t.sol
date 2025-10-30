// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/PollFactory.sol";

contract PollFactoryTest is Test {
    PollFactory public pollFactory;

    address public owner;
    address public user1;
    address public user2;
    address public user3;

    uint256 public startTime;
    uint256 public endTime;

    event PollCreated(
        string indexed pollId,
        address indexed creator,
        PollFactory.Visibility visible,
        uint256 startTime,
        uint256 endTime
    );
    event AllowedVotersAdded(string indexed pollId, address[] voters);
    event VoteCasted(string indexed pollId, address indexed voter, string option);
    event PollEnded(string indexed pollId, string winningOption, uint256 winningVotes);

    function setUp() public {
        pollFactory = new PollFactory();

        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");

        startTime = block.timestamp + 100;
        endTime = block.timestamp + 3600;
    }

    // ============ POLL CREATION TESTS ============

    function test_CreatePublicPoll() public {
        string memory pollId = "poll1";
        string memory question = "What is your favorite color?";
        string[] memory options = new string[](3);
        options[0] = "Red";
        options[1] = "Blue";
        options[2] = "Green";

        vm.expectEmit(true, true, false, true);
        emit PollCreated(pollId, owner, PollFactory.Visibility.Public, startTime, endTime);

        pollFactory.createPoll(pollId, question, options, PollFactory.Visibility.Public, startTime, endTime);

        assertTrue(pollFactory.pollExists(pollId));
    }

    function test_CreatePrivatePoll() public {
        string memory pollId = "poll2";
        string memory question = "Team decision?";
        string[] memory options = new string[](2);
        options[0] = "Option A";
        options[1] = "Option B";

        pollFactory.createPoll(pollId, question, options, PollFactory.Visibility.Private, startTime, endTime);

        assertTrue(pollFactory.pollExists(pollId));
    }

    function test_RevertWhen_EmptyPollId() public {
        string[] memory options = new string[](2);
        options[0] = "A";
        options[1] = "B";

        vm.expectRevert("Poll ID can not be empty");
        pollFactory.createPoll("", "Question?", options, PollFactory.Visibility.Public, startTime, endTime);
    }

    function test_RevertWhen_DuplicatePollId() public {
        string memory pollId = "duplicate";
        string[] memory options = new string[](2);
        options[0] = "A";
        options[1] = "B";

        pollFactory.createPoll(pollId, "Question?", options, PollFactory.Visibility.Public, startTime, endTime);

        vm.expectRevert("Poll already exist");
        pollFactory.createPoll(pollId, "Another Question?", options, PollFactory.Visibility.Public, startTime, endTime);
    }

    function test_RevertWhen_EmptyQuestion() public {
        string[] memory options = new string[](2);
        options[0] = "A";
        options[1] = "B";

        vm.expectRevert("Question cannot be empty");
        pollFactory.createPoll("poll3", "", options, PollFactory.Visibility.Public, startTime, endTime);
    }

    function test_RevertWhen_LessThanTwoOptions() public {
        string[] memory options = new string[](1);
        options[0] = "Only One";

        vm.expectRevert("Must be two Options");
        pollFactory.createPoll("poll4", "Question?", options, PollFactory.Visibility.Public, startTime, endTime);
    }

    function test_RevertWhen_MoreThanTenOptions() public {
        string[] memory options = new string[](11);
        for (uint256 i = 0; i < 11; i++) {
            options[i] = string(abi.encodePacked("Option", vm.toString(i)));
        }

        vm.expectRevert("Must be two Options");
        pollFactory.createPoll("poll5", "Question?", options, PollFactory.Visibility.Public, startTime, endTime);
    }

    function test_RevertWhen_StartTimeInPast() public {
        string[] memory options = new string[](2);
        options[0] = "A";
        options[1] = "B";

        // Move time forward first
        vm.warp(block.timestamp + 1000);

        vm.expectRevert("Start time must be in future");
        pollFactory.createPoll(
            "poll6", "Question?", options, PollFactory.Visibility.Public, block.timestamp - 100, block.timestamp + 3600
        );
    }

    function test_AllowStartTimeEqualToCurrentTime() public {
        string[] memory options = new string[](2);
        options[0] = "A";
        options[1] = "B";

        // Start time equal to block.timestamp should be allowed
        pollFactory.createPoll(
            "poll6b", "Question?", options, PollFactory.Visibility.Public, block.timestamp, block.timestamp + 3600
        );

        assertTrue(pollFactory.pollExists("poll6b"));
    }

    function test_RevertWhen_EndTimeBeforeStartTime() public {
        string[] memory options = new string[](2);
        options[0] = "A";
        options[1] = "B";

        vm.expectRevert("End time must be after start time");
        pollFactory.createPoll(
            "poll7", "Question?", options, PollFactory.Visibility.Public, block.timestamp + 3600, block.timestamp + 100
        );
    }

    function test_TrackUserCreatedPolls() public {
        string[] memory options = new string[](2);
        options[0] = "A";
        options[1] = "B";

        pollFactory.createPoll("poll8", "Question?", options, PollFactory.Visibility.Public, startTime, endTime);

        PollFactory.PollData[] memory createdPolls = pollFactory.getMyCreatedPolls(owner);
        assertTrue(createdPolls.length > 0);
        assertEq(createdPolls[createdPolls.length - 1].pollId, "poll8");
    }

    // ============ ALLOWED VOTERS TESTS ============

    function test_AddAllowedVotersToPrivatePoll() public {
        string memory pollId = "privatePoll";
        string[] memory options = new string[](2);
        options[0] = "Yes";
        options[1] = "No";

        pollFactory.createPoll(pollId, "Private Question?", options, PollFactory.Visibility.Private, startTime, endTime);

        address[] memory voters = new address[](2);
        voters[0] = user1;
        voters[1] = user2;

        vm.expectEmit(true, false, false, true);
        emit AllowedVotersAdded(pollId, voters);

        pollFactory.addAllowedVoter(pollId, voters);
    }

    function test_RevertWhen_AddVotersToNonExistentPoll() public {
        address[] memory voters = new address[](1);
        voters[0] = user1;

        vm.expectRevert("Poll does not exist");
        pollFactory.addAllowedVoter("nonexistent", voters);
    }

    function test_RevertWhen_NonCreatorAddsVoters() public {
        string memory pollId = "privatePoll";
        string[] memory options = new string[](2);
        options[0] = "Yes";
        options[1] = "No";

        pollFactory.createPoll(pollId, "Private Question?", options, PollFactory.Visibility.Private, startTime, endTime);

        address[] memory voters = new address[](1);
        voters[0] = user2;

        vm.prank(user1);
        vm.expectRevert("Only poll creator can perform this action");
        pollFactory.addAllowedVoter(pollId, voters);
    }

    function test_RevertWhen_AddVotersToPublicPoll() public {
        string memory pollId = "publicPoll";
        string[] memory options = new string[](2);
        options[0] = "A";
        options[1] = "B";

        pollFactory.createPoll(pollId, "Public Question?", options, PollFactory.Visibility.Public, startTime, endTime);

        address[] memory voters = new address[](1);
        voters[0] = user1;

        vm.expectRevert("Its not an private poll");
        pollFactory.addAllowedVoter(pollId, voters);
    }

    function test_RevertWhen_InvalidVoterAddress() public {
        string memory pollId = "privatePoll";
        string[] memory options = new string[](2);
        options[0] = "Yes";
        options[1] = "No";

        pollFactory.createPoll(pollId, "Private Question?", options, PollFactory.Visibility.Private, startTime, endTime);

        address[] memory voters = new address[](1);
        voters[0] = address(0);

        vm.expectRevert("Invalid voter address");
        pollFactory.addAllowedVoter(pollId, voters);
    }

    // ============ VOTING TESTS ============

    function test_VoteOnPublicPoll() public {
        string memory pollId = "votePoll";
        string[] memory options = new string[](3);
        options[0] = "Option1";
        options[1] = "Option2";
        options[2] = "Option3";

        pollFactory.createPoll(pollId, "Vote Question?", options, PollFactory.Visibility.Public, startTime, endTime);

        vm.warp(startTime);

        vm.expectEmit(true, true, false, true);
        emit VoteCasted(pollId, user1, "Option1");

        vm.prank(user1);
        pollFactory.vote(pollId, "Option1");
    }

    function test_VoteOnPrivatePollWithAllowedVoter() public {
        string memory pollId = "privateVotePoll";
        string[] memory options = new string[](2);
        options[0] = "Yes";
        options[1] = "No";

        pollFactory.createPoll(pollId, "Private Vote?", options, PollFactory.Visibility.Private, startTime, endTime);

        address[] memory voters = new address[](2);
        voters[0] = user1;
        voters[1] = user2;
        pollFactory.addAllowedVoter(pollId, voters);

        vm.warp(startTime);

        vm.expectEmit(true, true, false, true);
        emit VoteCasted(pollId, user1, "Yes");

        vm.prank(user1);
        pollFactory.vote(pollId, "Yes");
    }

    function test_RevertWhen_UnauthorizedVoterOnPrivatePoll() public {
        string memory pollId = "privateVotePoll";
        string[] memory options = new string[](2);
        options[0] = "Yes";
        options[1] = "No";

        pollFactory.createPoll(pollId, "Private Vote?", options, PollFactory.Visibility.Private, startTime, endTime);

        address[] memory voters = new address[](1);
        voters[0] = user1;
        pollFactory.addAllowedVoter(pollId, voters);

        vm.warp(startTime);

        vm.prank(user3);
        vm.expectRevert("Not authorized to vote in this private poll");
        pollFactory.vote(pollId, "Yes");
    }

    function test_RevertWhen_VotingTwice() public {
        string memory pollId = "votePoll";
        string[] memory options = new string[](2);
        options[0] = "Option1";
        options[1] = "Option2";

        pollFactory.createPoll(pollId, "Vote Question?", options, PollFactory.Visibility.Public, startTime, endTime);

        vm.warp(startTime);

        vm.startPrank(user1);
        pollFactory.vote(pollId, "Option1");

        vm.expectRevert("Already voted");
        pollFactory.vote(pollId, "Option2");
        vm.stopPrank();
    }

    function test_RevertWhen_InvalidOption() public {
        string memory pollId = "votePoll";
        string[] memory options = new string[](2);
        options[0] = "Option1";
        options[1] = "Option2";

        pollFactory.createPoll(pollId, "Vote Question?", options, PollFactory.Visibility.Public, startTime, endTime);

        vm.warp(startTime);

        vm.prank(user1);
        vm.expectRevert("Invalid option");
        pollFactory.vote(pollId, "InvalidOption");
    }

    function test_RevertWhen_VotingOnInactivePoll() public {
        string memory pollId = "votePoll";
        string[] memory options = new string[](2);
        options[0] = "Option1";
        options[1] = "Option2";

        pollFactory.createPoll(pollId, "Vote Question?", options, PollFactory.Visibility.Public, startTime, endTime);

        vm.warp(startTime);

        pollFactory.endPoll(pollId);

        vm.prank(user1);
        vm.expectRevert("Poll is not active");
        pollFactory.vote(pollId, "Option1");
    }

    function test_RevertWhen_VotingBeforePollStarts() public {
        string memory pollId = "futurePoll";
        string[] memory options = new string[](2);
        options[0] = "A";
        options[1] = "B";

        uint256 futureStart = block.timestamp + 7200;

        pollFactory.createPoll(
            pollId, "Future Poll?", options, PollFactory.Visibility.Public, futureStart, futureStart + 3600
        );

        vm.prank(user1);
        vm.expectRevert("Poll has not started");
        pollFactory.vote(pollId, "A");
    }

    function test_RevertWhen_VotingAfterPollEnds() public {
        string memory pollId = "votePoll";
        string[] memory options = new string[](2);
        options[0] = "Option1";
        options[1] = "Option2";

        pollFactory.createPoll(pollId, "Vote Question?", options, PollFactory.Visibility.Public, startTime, endTime);

        vm.warp(endTime + 1);

        vm.prank(user1);
        vm.expectRevert("Poll has ended");
        pollFactory.vote(pollId, "Option1");
    }

    function test_UpdateTotalVotesCorrectly() public {
        string memory pollId = "votePoll";
        string[] memory options = new string[](2);
        options[0] = "Option1";
        options[1] = "Option2";

        pollFactory.createPoll(pollId, "Vote Question?", options, PollFactory.Visibility.Public, startTime, endTime);

        vm.warp(startTime);

        vm.prank(user1);
        pollFactory.vote(pollId, "Option1");

        vm.prank(user2);
        pollFactory.vote(pollId, "Option2");

        PollFactory.PollData[] memory polls = pollFactory.getMyVotedPolls(user1);

        bool found = false;
        for (uint256 i = 0; i < polls.length; i++) {
            if (keccak256(bytes(polls[i].pollId)) == keccak256(bytes(pollId))) {
                assertEq(polls[i].totalVotes, 2);
                found = true;
                break;
            }
        }
        assertTrue(found);
    }

    function test_TrackVotedPollsForUser() public {
        string memory pollId = "votePoll";
        string[] memory options = new string[](2);
        options[0] = "Option1";
        options[1] = "Option2";

        pollFactory.createPoll(pollId, "Vote Question?", options, PollFactory.Visibility.Public, startTime, endTime);

        vm.warp(startTime);

        vm.prank(user1);
        pollFactory.vote(pollId, "Option1");

        PollFactory.PollData[] memory votedPolls = pollFactory.getMyVotedPolls(user1);
        assertTrue(votedPolls.length > 0);

        bool found = false;
        for (uint256 i = 0; i < votedPolls.length; i++) {
            if (keccak256(bytes(votedPolls[i].pollId)) == keccak256(bytes(pollId))) {
                assertTrue(votedPolls[i].hasVoted);
                found = true;
                break;
            }
        }
        assertTrue(found);
    }

    // ============ ENDING POLL TESTS ============

    function test_CreatorCanEndPollBeforeEndTime() public {
        string memory pollId = "endPoll";
        string[] memory options = new string[](2);
        options[0] = "Win";
        options[1] = "Lose";

        pollFactory.createPoll(pollId, "End Poll Question?", options, PollFactory.Visibility.Public, startTime, endTime);

        vm.warp(startTime);

        vm.prank(user1);
        pollFactory.vote(pollId, "Win");

        vm.expectEmit(true, false, false, true);
        emit PollEnded(pollId, "Win", 1);

        pollFactory.endPoll(pollId);
    }

    function test_AnyoneCanEndPollAfterEndTime() public {
        string memory pollId = "endPoll";
        string[] memory options = new string[](2);
        options[0] = "Win";
        options[1] = "Lose";

        pollFactory.createPoll(pollId, "End Poll Question?", options, PollFactory.Visibility.Public, startTime, endTime);

        vm.warp(startTime);

        vm.prank(user1);
        pollFactory.vote(pollId, "Win");

        vm.prank(user2);
        pollFactory.vote(pollId, "Lose");

        vm.warp(endTime + 1);

        vm.prank(user3);
        pollFactory.endPoll(pollId);
    }

    function test_RevertWhen_EndingNonExistentPoll() public {
        vm.expectRevert("Poll does not exist");
        pollFactory.endPoll("nonexistent");
    }

    function test_RevertWhen_EndingAlreadyEndedPoll() public {
        string memory pollId = "endPoll";
        string[] memory options = new string[](2);
        options[0] = "Win";
        options[1] = "Lose";

        pollFactory.createPoll(pollId, "End Poll Question?", options, PollFactory.Visibility.Public, startTime, endTime);

        pollFactory.endPoll(pollId);

        vm.expectRevert("Poll already ended");
        pollFactory.endPoll(pollId);
    }

    function test_RevertWhen_NonCreatorEndsBeforeEndTime() public {
        string memory pollId = "endPoll";
        string[] memory options = new string[](2);
        options[0] = "Win";
        options[1] = "Lose";

        pollFactory.createPoll(pollId, "End Poll Question?", options, PollFactory.Visibility.Public, startTime, endTime);

        vm.prank(user1);
        vm.expectRevert("Poll not yet ended or not creator");
        pollFactory.endPoll(pollId);
    }

    function test_EmitCorrectWinningOption() public {
        string memory pollId = "endPoll";
        string[] memory options = new string[](2);
        options[0] = "Win";
        options[1] = "Lose";

        pollFactory.createPoll(pollId, "End Poll Question?", options, PollFactory.Visibility.Public, startTime, endTime);

        vm.warp(startTime);

        vm.prank(user1);
        pollFactory.vote(pollId, "Win");

        vm.prank(user2);
        pollFactory.vote(pollId, "Win");

        vm.prank(user3);
        pollFactory.vote(pollId, "Lose");

        vm.warp(endTime + 1);

        vm.expectEmit(true, false, false, true);
        emit PollEnded(pollId, "Win", 2);

        pollFactory.endPoll(pollId);
    }

    function test_AutomaticallyEndPollWhenVotingAtEndTime() public {
        string memory pollId = "endPoll";
        string[] memory options = new string[](2);
        options[0] = "Win";
        options[1] = "Lose";

        pollFactory.createPoll(pollId, "End Poll Question?", options, PollFactory.Visibility.Public, startTime, endTime);

        vm.warp(endTime);

        vm.expectEmit(true, false, false, true);
        emit PollEnded(pollId, "Win", 1);

        vm.prank(user1);
        pollFactory.vote(pollId, "Win");
    }

    // ============ GET POLLS TESTS ============

    function test_GetAllActivePublicPolls() public {
        string[] memory options = new string[](2);
        options[0] = "A";
        options[1] = "B";

        pollFactory.createPoll(
            "public1", "Public Question 1?", options, PollFactory.Visibility.Public, startTime, endTime
        );

        vm.prank(user1);
        pollFactory.createPoll(
            "public2", "Public Question 2?", options, PollFactory.Visibility.Public, startTime, endTime
        );

        pollFactory.createPoll(
            "private1", "Private Question?", options, PollFactory.Visibility.Private, startTime, endTime
        );

        vm.warp(startTime);

        PollFactory.PollData[] memory publicPolls = pollFactory.getAllPublicPolls(owner);

        assertEq(publicPolls.length, 2);
        assertEq(uint256(publicPolls[0].visible), uint256(PollFactory.Visibility.Public));
        assertEq(uint256(publicPolls[1].visible), uint256(PollFactory.Visibility.Public));
    }

    function test_GetUserCreatedPolls() public {
        string[] memory options = new string[](2);
        options[0] = "A";
        options[1] = "B";

        pollFactory.createPoll("poll1", "Question 1?", options, PollFactory.Visibility.Public, startTime, endTime);

        pollFactory.createPoll("poll2", "Question 2?", options, PollFactory.Visibility.Public, startTime, endTime);

        PollFactory.PollData[] memory myPolls = pollFactory.getMyCreatedPolls(owner);

        assertTrue(myPolls.length >= 2);

        bool foundPoll1 = false;
        for (uint256 i = 0; i < myPolls.length; i++) {
            if (keccak256(bytes(myPolls[i].pollId)) == keccak256(bytes("poll1"))) {
                foundPoll1 = true;
                break;
            }
        }
        assertTrue(foundPoll1);
    }

    function test_GetUserVotedPolls() public {
        string memory pollId = "votePoll";
        string[] memory options = new string[](2);
        options[0] = "A";
        options[1] = "B";

        pollFactory.createPoll(pollId, "Vote Question?", options, PollFactory.Visibility.Public, startTime, endTime);

        vm.warp(startTime);

        vm.prank(user1);
        pollFactory.vote(pollId, "A");

        PollFactory.PollData[] memory votedPolls = pollFactory.getMyVotedPolls(user1);

        assertTrue(votedPolls.length > 0);

        bool found = false;
        for (uint256 i = 0; i < votedPolls.length; i++) {
            if (keccak256(bytes(votedPolls[i].pollId)) == keccak256(bytes(pollId))) {
                assertTrue(votedPolls[i].hasVoted);
                found = true;
                break;
            }
        }
        assertTrue(found);
    }

    function test_DontShowVoteCountsForActivePollsWhereUserHasntVoted() public {
        string memory pollId = "votePoll";
        string[] memory options = new string[](2);
        options[0] = "A";
        options[1] = "B";

        pollFactory.createPoll(pollId, "Vote Question?", options, PollFactory.Visibility.Public, startTime, endTime);

        vm.warp(startTime);

        PollFactory.PollData[] memory publicPolls = pollFactory.getAllPublicPolls(user1);

        bool found = false;
        for (uint256 i = 0; i < publicPolls.length; i++) {
            if (keccak256(bytes(publicPolls[i].pollId)) == keccak256(bytes(pollId))) {
                for (uint256 j = 0; j < publicPolls[i].voteCounts.length; j++) {
                    assertEq(publicPolls[i].voteCounts[j], 0);
                }
                found = true;
                break;
            }
        }
        assertTrue(found);
    }

    function test_ShowVoteCountsAfterVoting() public {
        string memory pollId = "votePoll";
        string[] memory options = new string[](2);
        options[0] = "A";
        options[1] = "B";

        pollFactory.createPoll(pollId, "Vote Question?", options, PollFactory.Visibility.Public, startTime, endTime);

        vm.warp(startTime);

        vm.prank(user1);
        pollFactory.vote(pollId, "A");

        vm.prank(user2);
        pollFactory.vote(pollId, "A");

        PollFactory.PollData[] memory votedPolls = pollFactory.getMyVotedPolls(user1);

        bool found = false;
        for (uint256 i = 0; i < votedPolls.length; i++) {
            if (keccak256(bytes(votedPolls[i].pollId)) == keccak256(bytes(pollId))) {
                assertEq(votedPolls[i].voteCounts[0], 2); // Option A has 2 votes
                assertEq(votedPolls[i].voteCounts[1], 0); // Option B has 0 votes
                found = true;
                break;
            }
        }
        assertTrue(found);
    }

    function test_ShowVoteCountsForCreator() public {
        string memory pollId = "creatorPoll";
        string[] memory options = new string[](2);
        options[0] = "A";
        options[1] = "B";

        pollFactory.createPoll(pollId, "Creator Poll?", options, PollFactory.Visibility.Public, startTime, endTime);

        vm.warp(startTime);

        vm.prank(user1);
        pollFactory.vote(pollId, "A");

        PollFactory.PollData[] memory createdPolls = pollFactory.getMyCreatedPolls(owner);

        bool found = false;
        for (uint256 i = 0; i < createdPolls.length; i++) {
            if (keccak256(bytes(createdPolls[i].pollId)) == keccak256(bytes(pollId))) {
                assertEq(createdPolls[i].voteCounts[0], 1); // Creator can see votes
                found = true;
                break;
            }
        }
        assertTrue(found);
    }

    function test_ShowVoteCountsAfterPollEnds() public {
        string memory pollId = "endedPoll";
        string[] memory options = new string[](2);
        options[0] = "A";
        options[1] = "B";

        pollFactory.createPoll(pollId, "Ended Poll?", options, PollFactory.Visibility.Public, startTime, endTime);

        vm.warp(startTime);

        vm.prank(user1);
        pollFactory.vote(pollId, "A");

        vm.prank(user2);
        pollFactory.vote(pollId, "B");

        vm.warp(endTime + 1);
        pollFactory.endPoll(pollId);

        // User3 never voted, but should see results after poll ends
        PollFactory.PollData[] memory publicPolls = pollFactory.getAllPublicPolls(user3);

        // Poll should not be in public polls list as it's not active
        // Let's check through created polls instead
        PollFactory.PollData[] memory createdPolls = pollFactory.getMyCreatedPolls(owner);

        bool found = false;
        for (uint256 i = 0; i < createdPolls.length; i++) {
            if (keccak256(bytes(createdPolls[i].pollId)) == keccak256(bytes(pollId))) {
                assertFalse(createdPolls[i].isActive);
                assertEq(createdPolls[i].voteCounts[0], 1);
                assertEq(createdPolls[i].voteCounts[1], 1);
                found = true;
                break;
            }
        }
        assertTrue(found);
    }

    // ============ EDGE CASE TESTS ============

    function test_MultipleUsersVotingOnSameOption() public {
        string memory pollId = "multiVote";
        string[] memory options = new string[](3);
        options[0] = "Option1";
        options[1] = "Option2";
        options[2] = "Option3";

        pollFactory.createPoll(pollId, "Multi Vote?", options, PollFactory.Visibility.Public, startTime, endTime);

        vm.warp(startTime);

        vm.prank(user1);
        pollFactory.vote(pollId, "Option1");

        vm.prank(user2);
        pollFactory.vote(pollId, "Option1");

        vm.prank(user3);
        pollFactory.vote(pollId, "Option1");

        PollFactory.PollData[] memory createdPolls = pollFactory.getMyCreatedPolls(owner);

        bool found = false;
        for (uint256 i = 0; i < createdPolls.length; i++) {
            if (keccak256(bytes(createdPolls[i].pollId)) == keccak256(bytes(pollId))) {
                assertEq(createdPolls[i].voteCounts[0], 3);
                assertEq(createdPolls[i].totalVotes, 3);
                found = true;
                break;
            }
        }
        assertTrue(found);
    }

    function test_PollWithTenOptions() public {
        string memory pollId = "tenOptions";
        string[] memory options = new string[](10);
        for (uint256 i = 0; i < 10; i++) {
            options[i] = string(abi.encodePacked("Option", vm.toString(i + 1)));
        }

        pollFactory.createPoll(pollId, "Ten Options?", options, PollFactory.Visibility.Public, startTime, endTime);

        assertTrue(pollFactory.pollExists(pollId));

        vm.warp(startTime);

        vm.prank(user1);
        pollFactory.vote(pollId, "Option5");

        PollFactory.PollData[] memory votedPolls = pollFactory.getMyVotedPolls(user1);

        bool found = false;
        for (uint256 i = 0; i < votedPolls.length; i++) {
            if (keccak256(bytes(votedPolls[i].pollId)) == keccak256(bytes(pollId))) {
                assertEq(votedPolls[i].options.length, 10);
                assertEq(votedPolls[i].voteCounts[4], 1); // Option5 is index 4
                found = true;
                break;
            }
        }
        assertTrue(found);
    }

    function test_PollStartingImmediately() public {
        string memory pollId = "immediateStart";
        string[] memory options = new string[](2);
        options[0] = "Yes";
        options[1] = "No";

        uint256 immediateStart = block.timestamp;
        uint256 laterEnd = block.timestamp + 3600;

        pollFactory.createPoll(
            pollId, "Immediate Start?", options, PollFactory.Visibility.Public, immediateStart, laterEnd
        );

        vm.prank(user1);
        pollFactory.vote(pollId, "Yes");
    }

    function test_EmptyVoteCountsForInactivePoll() public {
        string memory pollId = "inactivePoll";
        string[] memory options = new string[](2);
        options[0] = "A";
        options[1] = "B";

        pollFactory.createPoll(pollId, "Inactive Poll?", options, PollFactory.Visibility.Public, startTime, endTime);

        vm.warp(startTime);

        vm.prank(user1);
        pollFactory.vote(pollId, "A");

        pollFactory.endPoll(pollId);

        // Check that inactive poll shows vote counts
        PollFactory.PollData[] memory createdPolls = pollFactory.getMyCreatedPolls(owner);

        bool found = false;
        for (uint256 i = 0; i < createdPolls.length; i++) {
            if (keccak256(bytes(createdPolls[i].pollId)) == keccak256(bytes(pollId))) {
                assertFalse(createdPolls[i].isActive);
                assertEq(createdPolls[i].voteCounts[0], 1);
                found = true;
                break;
            }
        }
        assertTrue(found);
    }

    function test_TieInVotingResults() public {
        string memory pollId = "tiePoll";
        string[] memory options = new string[](3);
        options[0] = "Option1";
        options[1] = "Option2";
        options[2] = "Option3";

        pollFactory.createPoll(pollId, "Tie Poll?", options, PollFactory.Visibility.Public, startTime, endTime);

        vm.warp(startTime);

        vm.prank(user1);
        pollFactory.vote(pollId, "Option1");

        vm.prank(user2);
        pollFactory.vote(pollId, "Option1");

        vm.prank(user3);
        pollFactory.vote(pollId, "Option2");

        vm.prank(owner);
        pollFactory.vote(pollId, "Option2");

        vm.warp(endTime + 1);

        // Should emit with first option that has max votes (Option1)
        vm.expectEmit(true, false, false, true);
        emit PollEnded(pollId, "Option1", 2);

        pollFactory.endPoll(pollId);
    }

    function test_NobodyVotedOnPoll() public {
        string memory pollId = "noVotes";
        string[] memory options = new string[](2);
        options[0] = "Yes";
        options[1] = "No";

        pollFactory.createPoll(pollId, "No Votes?", options, PollFactory.Visibility.Public, startTime, endTime);

        vm.warp(endTime + 1);

        // Should emit with empty winning option and 0 votes
        vm.expectEmit(true, false, false, true);
        emit PollEnded(pollId, "", 0);

        pollFactory.endPoll(pollId);
    }

    function test_AddMultipleAllowedVotersInBatches() public {
        string memory pollId = "batchVoters";
        string[] memory options = new string[](2);
        options[0] = "Yes";
        options[1] = "No";

        pollFactory.createPoll(pollId, "Batch Voters?", options, PollFactory.Visibility.Private, startTime, endTime);

        address[] memory voters1 = new address[](2);
        voters1[0] = user1;
        voters1[1] = user2;
        pollFactory.addAllowedVoter(pollId, voters1);

        address[] memory voters2 = new address[](1);
        voters2[0] = user3;
        pollFactory.addAllowedVoter(pollId, voters2);

        vm.warp(startTime);

        // All three users should be able to vote
        vm.prank(user1);
        pollFactory.vote(pollId, "Yes");

        vm.prank(user2);
        pollFactory.vote(pollId, "No");

        vm.prank(user3);
        pollFactory.vote(pollId, "Yes");
    }

    function test_PrivatePollNotInPublicList() public {
        string[] memory options = new string[](2);
        options[0] = "A";
        options[1] = "B";

        pollFactory.createPoll("publicPoll", "Public?", options, PollFactory.Visibility.Public, startTime, endTime);

        pollFactory.createPoll("privatePoll", "Private?", options, PollFactory.Visibility.Private, startTime, endTime);

        vm.warp(startTime);

        PollFactory.PollData[] memory publicPolls = pollFactory.getAllPublicPolls(owner);

        bool foundPrivate = false;
        for (uint256 i = 0; i < publicPolls.length; i++) {
            if (keccak256(bytes(publicPolls[i].pollId)) == keccak256(bytes("privatePoll"))) {
                foundPrivate = true;
                break;
            }
        }
        assertFalse(foundPrivate);
    }

    function test_InactivePollsNotInPublicList() public {
        string[] memory options = new string[](2);
        options[0] = "A";
        options[1] = "B";

        pollFactory.createPoll("activePoll", "Active?", options, PollFactory.Visibility.Public, startTime, endTime);

        pollFactory.createPoll("inactivePoll", "Inactive?", options, PollFactory.Visibility.Public, startTime, endTime);

        vm.warp(startTime);

        pollFactory.endPoll("inactivePoll");

        PollFactory.PollData[] memory publicPolls = pollFactory.getAllPublicPolls(owner);

        bool foundInactive = false;
        for (uint256 i = 0; i < publicPolls.length; i++) {
            if (keccak256(bytes(publicPolls[i].pollId)) == keccak256(bytes("inactivePoll"))) {
                foundInactive = true;
                break;
            }
        }
        assertFalse(foundInactive);
    }

    function test_FutureStartTimeNotInPublicList() public {
        string[] memory options = new string[](2);
        options[0] = "A";
        options[1] = "B";

        pollFactory.createPoll(
            "futurePoll",
            "Future?",
            options,
            PollFactory.Visibility.Public,
            block.timestamp + 7200,
            block.timestamp + 10800
        );

        PollFactory.PollData[] memory publicPolls = pollFactory.getAllPublicPolls(owner);

        bool foundFuture = false;
        for (uint256 i = 0; i < publicPolls.length; i++) {
            if (keccak256(bytes(publicPolls[i].pollId)) == keccak256(bytes("futurePoll"))) {
                foundFuture = true;
                break;
            }
        }
        assertFalse(foundFuture);
    }

    function test_OptionsWithSpecialCharacters() public {
        string memory pollId = "specialChars";
        string[] memory options = new string[](3);
        options[0] = "Option #1!";
        options[1] = "Option @2?";
        options[2] = "Option $3%";

        pollFactory.createPoll(
            pollId, "Special Characters?", options, PollFactory.Visibility.Public, startTime, endTime
        );

        vm.warp(startTime);

        vm.prank(user1);
        pollFactory.vote(pollId, "Option @2?");

        PollFactory.PollData[] memory votedPolls = pollFactory.getMyVotedPolls(user1);

        bool found = false;
        for (uint256 i = 0; i < votedPolls.length; i++) {
            if (keccak256(bytes(votedPolls[i].pollId)) == keccak256(bytes(pollId))) {
                assertEq(votedPolls[i].voteCounts[1], 1);
                found = true;
                break;
            }
        }
        assertTrue(found);
    }

    function test_LongPollIdAndQuestion() public {
        string memory longPollId = "this_is_a_very_long_poll_id_to_test_edge_cases";
        string memory longQuestion =
            "This is a very long question to test if the contract can handle lengthy strings without any issues?";
        string[] memory options = new string[](2);
        options[0] = "Yes";
        options[1] = "No";

        pollFactory.createPoll(longPollId, longQuestion, options, PollFactory.Visibility.Public, startTime, endTime);

        assertTrue(pollFactory.pollExists(longPollId));
    }

    function test_CreatorCanVoteOnOwnPoll() public {
        string memory pollId = "creatorVote";
        string[] memory options = new string[](2);
        options[0] = "Yes";
        options[1] = "No";

        pollFactory.createPoll(pollId, "Creator Vote?", options, PollFactory.Visibility.Public, startTime, endTime);

        vm.warp(startTime);

        pollFactory.vote(pollId, "Yes");

        PollFactory.PollData[] memory votedPolls = pollFactory.getMyVotedPolls(owner);

        bool found = false;
        for (uint256 i = 0; i < votedPolls.length; i++) {
            if (keccak256(bytes(votedPolls[i].pollId)) == keccak256(bytes(pollId))) {
                assertTrue(votedPolls[i].hasVoted);
                found = true;
                break;
            }
        }
        assertTrue(found);
    }

    function test_GetEmptyListsForNewUser() public {
        PollFactory.PollData[] memory createdPolls = pollFactory.getMyCreatedPolls(user3);
        PollFactory.PollData[] memory votedPolls = pollFactory.getMyVotedPolls(user3);

        assertEq(createdPolls.length, 0);
        assertEq(votedPolls.length, 0);
    }

    function test_PollIndexMapping() public {
        string memory pollId = "indexTest";
        string[] memory options = new string[](2);
        options[0] = "A";
        options[1] = "B";

        pollFactory.createPoll(pollId, "Index Test?", options, PollFactory.Visibility.Public, startTime, endTime);

        uint256 index = pollFactory.pollIndex(pollId);
        assertTrue(index >= 0);
        assertTrue(pollFactory.pollExists(pollId));
    }

    // ============ FUZZ TESTS ============

    function testFuzz_CreatePollWithDifferentTimestamps(uint256 _startOffset, uint256 _duration) public {
        vm.assume(_startOffset > 0 && _startOffset < 365 days);
        vm.assume(_duration > 0 && _duration < 365 days);

        string[] memory options = new string[](2);
        options[0] = "A";
        options[1] = "B";

        uint256 start = block.timestamp + _startOffset;
        uint256 end = start + _duration;

        pollFactory.createPoll("fuzzPoll", "Fuzz Test?", options, PollFactory.Visibility.Public, start, end);

        assertTrue(pollFactory.pollExists("fuzzPoll"));
    }

    function testFuzz_VoteWithDifferentOptions(uint8 optionIndex) public {
        string[] memory options = new string[](5);
        options[0] = "Option0";
        options[1] = "Option1";
        options[2] = "Option2";
        options[3] = "Option3";
        options[4] = "Option4";

        vm.assume(optionIndex < 5);

        pollFactory.createPoll("fuzzVote", "Fuzz Vote?", options, PollFactory.Visibility.Public, startTime, endTime);

        vm.warp(startTime);

        vm.prank(user1);
        pollFactory.vote("fuzzVote", options[optionIndex]);

        PollFactory.PollData[] memory votedPolls = pollFactory.getMyVotedPolls(user1);
        assertTrue(votedPolls.length > 0);
    }

    function testGetPollById() public {
        // Create poll
        string[] memory options = new string[](2);
        options[0] = "Yes";
        options[1] = "No";

        vm.prank(user1);
        pollFactory.createPoll(
            "poll_test_getById",
            "Do you like testing?",
            options,
            PollFactory.Visibility.Public,
            block.timestamp + 1,
            block.timestamp + 100
        );

        // Wait until poll starts
        vm.warp(block.timestamp + 2);

        // Fetch poll by ID
        PollFactory.PollData memory fetchedPoll = pollFactory.getPollById("poll_test_getById", user1);

        // Assertions
        assertEq(fetchedPoll.pollId, "poll_test_getById", "Poll ID mismatch");
        assertEq(fetchedPoll.creator, user1, "Creator mismatch");
        assertEq(fetchedPoll.question, "Do you like testing?", "Question mismatch");
        assertEq(fetchedPoll.options.length, 2, "Options length mismatch");
        assertEq(uint256(fetchedPoll.visible), uint256(PollFactory.Visibility.Public), "Visibility mismatch");
        assertTrue(fetchedPoll.isActive, "Poll should be active");
        assertEq(fetchedPoll.totalVotes, 0, "Initial totalVotes should be 0");
    }

    function testGetPollByIdRevertsIfNotExist() public {
        vm.expectRevert(bytes("Poll does not exist"));
        pollFactory.getPollById("non_existing_poll", user1);
    }
}
