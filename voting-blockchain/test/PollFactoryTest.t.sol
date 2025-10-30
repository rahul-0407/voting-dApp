// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/PollFactory.sol";
import "../src/Verifier.sol";

contract PollFactoryTest is Test {


    event PollCreated(string indexed pollId, address indexed creator, PollFactory.Visibility visible, PollFactory.VotingMode votingMode);
    event VoteCasted(string indexed pollId, address indexed voter, uint256 optionIndex);
    event AnonymousVoteCasted(string indexed pollId, bytes32 nullifier);
    event PollEnded(string indexed pollId, uint256 winningOptionIndex, uint256 winningVotes);


    PollFactory public pollFactory;
    Groth16Verifier public verifier;
    
    // Test accounts
    address public alice = address(0x1);
    address public bob = address(0x2);
    address public carol = address(0x3);
    
    // Common test data
    string constant POLL_ID = "poll-1";
    string constant QUESTION = "Best pizza topping?";
    string[] public options;
    
    function setUp() public {
        // Deploy verifier
        verifier = new Groth16Verifier();
        
        // Deploy poll factory
        pollFactory = new PollFactory(address(verifier));
        
        // Setup test options
        options.push("Pepperoni");
        options.push("Mushroom");
        options.push("Pineapple");
        
        // Give test accounts some ETH
        vm.deal(alice, 100 ether);
        vm.deal(bob, 100 ether);
        vm.deal(carol, 100 ether);
    }
    
    // ==================== CREATE POLL TESTS ====================
    
    function testCreatePoll() public {
        uint256 startTime = block.timestamp + 1 minutes;
        uint256 endTime = startTime + 1 days;
        
        vm.prank(alice);
        pollFactory.createPoll(
            POLL_ID,
            QUESTION,
            options,
            PollFactory.Visibility.Public,
            PollFactory.VotingMode.Standard,
            startTime,
            endTime
        );
        
        assertTrue(pollFactory.pollExists(POLL_ID));
    }
    
    function testCreatePollEmitsEvent() public {
        uint256 startTime = block.timestamp + 1 minutes;
        uint256 endTime = startTime + 1 days;
        
        vm.prank(alice);
        
        vm.expectEmit(true, true, false, true);
        emit PollCreated(POLL_ID, alice, PollFactory.Visibility.Public, PollFactory.VotingMode.Standard);
        
        pollFactory.createPoll(
            POLL_ID,
            QUESTION,
            options,
            PollFactory.Visibility.Public,
            PollFactory.VotingMode.Standard,
            startTime,
            endTime
        );
    }
    
    function testCannotCreateDuplicatePoll() public {
        uint256 startTime = block.timestamp + 1 minutes;
        uint256 endTime = startTime + 1 days;
        
        // Create first poll
        vm.prank(alice);
        pollFactory.createPoll(
            POLL_ID,
            QUESTION,
            options,
            PollFactory.Visibility.Public,
            PollFactory.VotingMode.Standard,
            startTime,
            endTime
        );
        
        // Try to create duplicate
        vm.prank(bob);
        vm.expectRevert("Poll already exist");
        pollFactory.createPoll(
            POLL_ID,
            "Another question",
            options,
            PollFactory.Visibility.Public,
            PollFactory.VotingMode.Standard,
            startTime,
            endTime
        );
    }
    
    function testCannotCreatePollWithEmptyQuestion() public {
        uint256 startTime = block.timestamp + 1 minutes;
        uint256 endTime = startTime + 1 days;
        
        vm.prank(alice);
        vm.expectRevert("Question cannot be empty");
        pollFactory.createPoll(
            POLL_ID,
            "",
            options,
            PollFactory.Visibility.Public,
            PollFactory.VotingMode.Standard,
            startTime,
            endTime
        );
    }
    
    function testCannotCreatePollWithTooFewOptions() public {
        string[] memory fewOptions = new string[](1);
        fewOptions[0] = "Only one";
        
        uint256 startTime = block.timestamp + 1 minutes;
        uint256 endTime = startTime + 1 days;
        
        vm.prank(alice);
        vm.expectRevert("Must be two Options");
        pollFactory.createPoll(
            POLL_ID,
            QUESTION,
            fewOptions,
            PollFactory.Visibility.Public,
            PollFactory.VotingMode.Standard,
            startTime,
            endTime
        );
    }
    
    function testCannotCreatePollWithTooManyOptions() public {
        string[] memory manyOptions = new string[](11);
        for (uint i = 0; i < 11; i++) {
            manyOptions[i] = string(abi.encodePacked("Option ", vm.toString(i)));
        }
        
        uint256 startTime = block.timestamp + 1 minutes;
        uint256 endTime = startTime + 1 days;
        
        vm.prank(alice);
        vm.expectRevert("Must be two Options");
        pollFactory.createPoll(
            POLL_ID,
            QUESTION,
            manyOptions,
            PollFactory.Visibility.Public,
            PollFactory.VotingMode.Standard,
            startTime,
            endTime
        );
    }
    
    function testCannotCreatePollWithPastStartTime() public {
        uint256 startTime = block.timestamp - 1;
        uint256 endTime = startTime + 1 days;
        
        vm.prank(alice);
        vm.expectRevert("Start time must be in future");
        pollFactory.createPoll(
            POLL_ID,
            QUESTION,
            options,
            PollFactory.Visibility.Public,
            PollFactory.VotingMode.Standard,
            startTime,
            endTime
        );
    }
    
    function testCannotCreatePollWithInvalidEndTime() public {
        uint256 startTime = block.timestamp + 1 minutes;
        uint256 endTime = block.timestamp; // End time before start time
        
        vm.prank(alice);
        vm.expectRevert("End time must be after start time");
        pollFactory.createPoll(
            POLL_ID,
            QUESTION,
            options,
            PollFactory.Visibility.Public,
            PollFactory.VotingMode.Standard,
            startTime,
            endTime
        );
    }
    
    // ==================== STANDARD VOTING TESTS ====================
    
    function testStandardVote() public {
        uint256 startTime = block.timestamp + 1 minutes;
        uint256 endTime = startTime + 1 days;
        
        // Create poll
        vm.prank(alice);
        pollFactory.createPoll(
            POLL_ID,
            QUESTION,
            options,
            PollFactory.Visibility.Public,
            PollFactory.VotingMode.Standard,
            startTime,
            endTime
        );
        
        // Warp to after start time
        vm.warp(startTime + 1);
        
        // Vote
        vm.prank(bob);
        pollFactory.vote(POLL_ID, 0);
        
        // Verify
        assertTrue(pollFactory.hasUserVoted(POLL_ID, bob));
    }
    
    function testStandardVoteEmitsEvent() public {
        uint256 startTime = block.timestamp + 1 minutes;
        uint256 endTime = startTime + 1 days;
        
        // Create poll
        vm.prank(alice);
        pollFactory.createPoll(
            POLL_ID,
            QUESTION,
            options,
            PollFactory.Visibility.Public,
            PollFactory.VotingMode.Standard,
            startTime,
            endTime
        );
        
        // Warp to after start time
        vm.warp(startTime + 1);
        
        // Vote with event check
        vm.prank(bob);
        vm.expectEmit(true, true, false, true);
        emit VoteCasted(POLL_ID, bob, 0);
        pollFactory.vote(POLL_ID, 0);
    }
    
    function testCannotVoteTwice() public {
        uint256 startTime = block.timestamp + 1 minutes;
        uint256 endTime = startTime + 1 days;
        
        // Create poll
        vm.prank(alice);
        pollFactory.createPoll(
            POLL_ID,
            QUESTION,
            options,
            PollFactory.Visibility.Public,
            PollFactory.VotingMode.Standard,
            startTime,
            endTime
        );
        
        // Warp to after start time
        vm.warp(startTime + 1);
        
        // First vote
        vm.prank(bob);
        pollFactory.vote(POLL_ID, 0);
        
        // Second vote should fail
        vm.prank(bob);
        vm.expectRevert("Already voted");
        pollFactory.vote(POLL_ID, 1);
    }
    
    function testCannotVoteWithInvalidOption() public {
        uint256 startTime = block.timestamp + 1 minutes;
        uint256 endTime = startTime + 1 days;
        
        // Create poll
        vm.prank(alice);
        pollFactory.createPoll(
            POLL_ID,
            QUESTION,
            options,
            PollFactory.Visibility.Public,
            PollFactory.VotingMode.Standard,
            startTime,
            endTime
        );
        
        // Warp to after start time
        vm.warp(startTime + 1);
        
        // Vote with invalid option
        vm.prank(bob);
        vm.expectRevert("Invalid option index");
        pollFactory.vote(POLL_ID, 99);
    }
    
    function testCannotVoteBeforePollStarts() public {
        uint256 startTime = block.timestamp + 1 days;
        uint256 endTime = startTime + 1 days;
        
        // Create poll starting in future
        vm.prank(alice);
        pollFactory.createPoll(
            POLL_ID,
            QUESTION,
            options,
            PollFactory.Visibility.Public,
            PollFactory.VotingMode.Standard,
            startTime,
            endTime
        );
        
        // Try to vote now
        vm.prank(bob);
        vm.expectRevert("Poll has not started");
        pollFactory.vote(POLL_ID, 0);
    }
    
    function testCannotVoteAfterPollEnds() public {
        uint256 startTime = block.timestamp + 1 minutes;
        uint256 endTime = startTime + 1 days;
        
        // Create poll
        vm.prank(alice);
        pollFactory.createPoll(
            POLL_ID,
            QUESTION,
            options,
            PollFactory.Visibility.Public,
            PollFactory.VotingMode.Standard,
            startTime,
            endTime
        );
        
        // Fast forward past end time
        vm.warp(endTime + 1);
        
        // Try to vote
        vm.prank(bob);
        vm.expectRevert("Poll has ended");
        pollFactory.vote(POLL_ID, 0);
    }
    
    function testCannotVoteInAnonymousPollWithStandardVote() public {
        uint256 startTime = block.timestamp + 1 minutes;
        uint256 endTime = startTime + 1 days;
        
        // Create anonymous poll
        vm.prank(alice);
        pollFactory.createPoll(
            POLL_ID,
            QUESTION,
            options,
            PollFactory.Visibility.Public,
            PollFactory.VotingMode.Anonymous,
            startTime,
            endTime
        );
        
        // Warp to after start time
        vm.warp(startTime + 1);
        
        // Try standard vote
        vm.prank(bob);
        vm.expectRevert("This poll requires anonymous voting");
        pollFactory.vote(POLL_ID, 0);
    }
    
    // ==================== POLL RESULTS TESTS ====================
    
    function testGetPollResults() public {
        uint256 startTime = block.timestamp + 1 minutes;
        uint256 endTime = startTime + 1 days;
        
        // Create poll
        vm.prank(alice);
        pollFactory.createPoll(
            POLL_ID,
            QUESTION,
            options,
            PollFactory.Visibility.Public,
            PollFactory.VotingMode.Standard,
            startTime,
            endTime
        );
        
        // Warp to after start time
        vm.warp(startTime + 1);
        
        // Vote
        vm.prank(bob);
        pollFactory.vote(POLL_ID, 0);
        
        vm.prank(carol);
        pollFactory.vote(POLL_ID, 0);
        
        // Get results
        (string[] memory resultOptions, uint256[] memory voteCounts) = 
            pollFactory.getPollResults(POLL_ID);
        
        assertEq(resultOptions.length, 3);
        assertEq(voteCounts[0], 2); // Option 0 has 2 votes
        assertEq(voteCounts[1], 0);
        assertEq(voteCounts[2], 0);
    }
    
    // ==================== END POLL TESTS ====================
    
    function testCreatorCanEndPollEarly() public {
        uint256 startTime = block.timestamp + 1 minutes;
        uint256 endTime = startTime + 1 days;
        
        // Create poll
        vm.prank(alice);
        pollFactory.createPoll(
            POLL_ID,
            QUESTION,
            options,
            PollFactory.Visibility.Public,
            PollFactory.VotingMode.Standard,
            startTime,
            endTime
        );
        
        // Warp to after start time
        vm.warp(startTime + 1);
        
        // Creator ends poll early
        vm.prank(alice);
        pollFactory.endPoll(POLL_ID);
        
        // Try to vote - should fail
        vm.prank(bob);
        vm.expectRevert("Poll is not active");
        pollFactory.vote(POLL_ID, 0);
    }
    
    function testNonCreatorCannotEndPollEarly() public {
        uint256 startTime = block.timestamp + 1 minutes;
        uint256 endTime = startTime + 1 days;
        
        // Create poll
        vm.prank(alice);
        pollFactory.createPoll(
            POLL_ID,
            QUESTION,
            options,
            PollFactory.Visibility.Public,
            PollFactory.VotingMode.Standard,
            startTime,
            endTime
        );
        
        // Warp to after start time
        vm.warp(startTime + 1);
        
        // Non-creator tries to end poll
        vm.prank(bob);
        vm.expectRevert("Poll not yet ended or not creator");
        pollFactory.endPoll(POLL_ID);
    }
    
    function testAnyoneCanEndExpiredPoll() public {
        uint256 startTime = block.timestamp + 1 minutes;
        uint256 endTime = startTime + 1 days;
        
        // Create poll
        vm.prank(alice);
        pollFactory.createPoll(
            POLL_ID,
            QUESTION,
            options,
            PollFactory.Visibility.Public,
            PollFactory.VotingMode.Standard,
            startTime,
            endTime
        );
        
        // Fast forward past end time
        vm.warp(endTime + 1);
        
        // Anyone can end it
        vm.prank(bob);
        pollFactory.endPoll(POLL_ID);
    }
    
    // ==================== VIEW FUNCTION TESTS ====================
    
    function testGetAllPublicPolls() public {
        uint256 startTime = block.timestamp + 1 minutes;
        uint256 endTime = startTime + 1 days;
        
        // Create multiple polls
        vm.startPrank(alice);
        
        pollFactory.createPoll(
            "poll-1",
            "Question 1",
            options,
            PollFactory.Visibility.Public,
            PollFactory.VotingMode.Standard,
            startTime,
            endTime
        );
        
        pollFactory.createPoll(
            "poll-2",
            "Question 2",
            options,
            PollFactory.Visibility.Public,
            PollFactory.VotingMode.Standard,
            startTime,
            endTime
        );
        
        vm.stopPrank();

        vm.warp(block.timestamp + 61);
        
        // Get all public polls
        PollFactory.PollData[] memory polls = pollFactory.getAllPublicPolls(bob);
        
        assertEq(polls.length, 2);
        assertEq(polls[0].pollId, "poll-1");
        assertEq(polls[1].pollId, "poll-2");
    }
    
    function testGetMyCreatedPolls() public {
        uint256 startTime = block.timestamp + 1 minutes;
        uint256 endTime = startTime + 1 days;
        
        // Alice creates polls
        vm.startPrank(alice);
        
        pollFactory.createPoll(
            "poll-1",
            "Question 1",
            options,
            PollFactory.Visibility.Public,
            PollFactory.VotingMode.Standard,
            startTime,
            endTime
        );
        
        pollFactory.createPoll(
            "poll-2",
            "Question 2",
            options,
            PollFactory.Visibility.Public,
            PollFactory.VotingMode.Standard,
            startTime,
            endTime
        );
        
        vm.stopPrank();
        
        // Bob creates one
        vm.prank(bob);
        pollFactory.createPoll(
            "poll-3",
            "Question 3",
            options,
            PollFactory.Visibility.Public,
            PollFactory.VotingMode.Standard,
            startTime,
            endTime
        );
        
        // Check Alice's polls
        PollFactory.PollData[] memory alicePolls = pollFactory.getMyCreatedPolls(alice);
        assertEq(alicePolls.length, 2);
        
        // Check Bob's polls
        PollFactory.PollData[] memory bobPolls = pollFactory.getMyCreatedPolls(bob);
        assertEq(bobPolls.length, 1);
    }
    
    function testGetMyVotedPolls() public {
        uint256 startTime = block.timestamp + 1 minutes;
        uint256 endTime = startTime + 1 days;
        
        // Create poll
        vm.prank(alice);
        pollFactory.createPoll(
            POLL_ID,
            QUESTION,
            options,
            PollFactory.Visibility.Public,
            PollFactory.VotingMode.Standard,
            startTime,
            endTime
        );
        
        // Warp to after start time
        vm.warp(startTime + 1);
        
        // Bob votes
        vm.prank(bob);
        pollFactory.vote(POLL_ID, 0);
        
        // Check Bob's voted polls
        PollFactory.PollData[] memory votedPolls = pollFactory.getMyVotedPolls(bob);
        assertEq(votedPolls.length, 1);
        assertEq(votedPolls[0].pollId, POLL_ID);
        assertTrue(votedPolls[0].hasVoted);
    }
    
    function testCanUserVote() public {
        uint256 startTime = block.timestamp + 1 minutes;
        uint256 endTime = startTime + 1 days;
        
        // Create poll
        vm.prank(alice);
        pollFactory.createPoll(
            POLL_ID,
            QUESTION,
            options,
            PollFactory.Visibility.Public,
            PollFactory.VotingMode.Standard,
            startTime,
            endTime
        );
        
        // Warp to after start time
        vm.warp(startTime + 1);
        
        // Check if Bob can vote (should be able to)
        (bool canVote, string memory reason) = pollFactory.canUserVote(POLL_ID, bob);
        assertTrue(canVote);
        assertEq(reason, "Can vote");
        
        // Bob votes
        vm.prank(bob);
        pollFactory.vote(POLL_ID, 0);
        
        // Check again (should not be able to)
        (canVote, reason) = pollFactory.canUserVote(POLL_ID, bob);
        assertFalse(canVote);
        assertEq(reason, "Already voted in this poll");
    }
    
    function testGetTotalPolls() public {
        assertEq(pollFactory.getTotalPolls(), 0);
        
        uint256 startTime = block.timestamp + 1 minutes;
        uint256 endTime = startTime + 1 days;
        
        // Create polls
        vm.prank(alice);
        pollFactory.createPoll(
            "poll-1",
            QUESTION,
            options,
            PollFactory.Visibility.Public,
            PollFactory.VotingMode.Standard,
            startTime,
            endTime
        );
        
        assertEq(pollFactory.getTotalPolls(), 1);
        
        vm.prank(bob);
        pollFactory.createPoll(
            "poll-2",
            QUESTION,
            options,
            PollFactory.Visibility.Public,
            PollFactory.VotingMode.Standard,
            startTime,
            endTime
        );
        
        assertEq(pollFactory.getTotalPolls(), 2);
    }
    
    // ==================== FUZZ TESTS ====================
    
    function testFuzz_VoteWithAnyValidOption(uint256 optionIndex) public {
        vm.assume(optionIndex < 3); // We have 3 options
        
        uint256 startTime = block.timestamp + 1 minutes;
        uint256 endTime = startTime + 1 days;
        
        // Create poll
        vm.prank(alice);
        pollFactory.createPoll(
            POLL_ID,
            QUESTION,
            options,
            PollFactory.Visibility.Public,
            PollFactory.VotingMode.Standard,
            startTime,
            endTime
        );
        
        // Warp to after start time
        vm.warp(startTime + 1);
        
        // Vote with random valid option
        vm.prank(bob);
        pollFactory.vote(POLL_ID, optionIndex);
        
        assertTrue(pollFactory.hasUserVoted(POLL_ID, bob));
    }
    
    function testFuzz_CannotVoteWithInvalidOption(uint256 optionIndex) public {
        vm.assume(optionIndex >= 3); // Invalid options
        
        uint256 startTime = block.timestamp + 1 minutes;
        uint256 endTime = startTime + 1 days;
        
        // Create poll
        vm.prank(alice);
        pollFactory.createPoll(
            POLL_ID,
            QUESTION,
            options,
            PollFactory.Visibility.Public,
            PollFactory.VotingMode.Standard,
            startTime,
            endTime
        );
        
        // Warp to after start time
        vm.warp(startTime + 1);
        
        // Try to vote with invalid option
        vm.prank(bob);
        vm.expectRevert("Invalid option index");
        pollFactory.vote(POLL_ID, optionIndex);
    }
}