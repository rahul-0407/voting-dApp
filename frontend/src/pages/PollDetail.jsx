"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ethers } from "ethers";
import { getContract } from "../utils/contract";
import VotingInterface from "../components/VotingInterface";
import PollResults from "../components/PollResults";
import ShareModal from "../components/ShareModal";
import PollMain from "../components/PollMain";

export default function PollDetails() {
  const { id: pollId } = useParams();
  const navigate = useNavigate();

  const [poll, setPoll] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [userVote, setUserVote] = useState(null);
  const [shareModal, setShareModal] = useState({ isOpen: false });
  const [isVoting, setIsVoting] = useState(false); // 🆕

  useEffect(() => {
    const loadPollDetails = async () => {
      try {
        if (!pollId) return;

        const { contract, signerAddress } = await getContract(true);
        if (!contract) throw new Error("Contract not loaded.");
        if (!signerAddress) throw new Error("Wallet not connected.");

        console.log("🔗 Connected contract:", contract.address);
        console.log("👤 Signer address:", signerAddress);

        const polls = await contract.getAllPublicPolls(signerAddress);
        const chainPoll = polls.find((p) => p.pollId === pollId);

        if (!chainPoll) {
          setError("Poll not found on blockchain");
          return;
        }

        const formatted = {
          pollId: chainPoll.pollId,
          question: chainPoll.question,
          options: chainPoll.options,
          totalVotes: Number(chainPoll.totalVotes),
          startTime: Number(chainPoll.startTime),
          endTime: Number(chainPoll.endTime),
          isActive: chainPoll.isActive,
          visibility: chainPoll.visible === 0 ? "Public" : "Private",
          voteCounts: chainPoll.voteCounts.map((v) => Number(v)),
          creator: chainPoll.creator,
        };

        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/poll/v1/pollDetail/${pollId}`,
          { withCredentials: true }
        );
        const backendPoll = res.data?.poll || {};

        const mergedPoll = {
          ...formatted,
          description: backendPoll.description || "No description provided.",
          img: backendPoll.img || "/placeholder.svg",
          createdAt: backendPoll.createdAt || new Date().toISOString(),
        };

        setPoll(mergedPoll);

        // Check if user already voted
        const votedPolls = JSON.parse(localStorage.getItem("votedPolls") || "{}");
        if (votedPolls[pollId]) {
          setHasVoted(true);
          setUserVote(votedPolls[pollId]);
        }
      } catch (err) {
        console.error("❌ Error loading poll:", err);
        setError(err.message || "Failed to load poll details");
      } finally {
        setLoading(false);
      }
    };

    loadPollDetails();
  }, [pollId]);

  // 🆕 --- VOTE FUNCTION ---
  const handleVoteOnBlockchain = async (selectedOption) => {
    try {
      if (!poll || hasVoted || !poll.isActive) return;
      setIsVoting(true);

      const { contract } = await getContract(true);
      const tx = await contract.vote(poll.pollId, selectedOption);
      console.log("🟡 Sending vote tx:", tx.hash);

      await tx.wait();
      console.log("✅ Vote successful!");

      // Store vote locally
      const votedPolls = JSON.parse(localStorage.getItem("votedPolls") || "{}");
      votedPolls[pollId] = selectedOption;
      localStorage.setItem("votedPolls", JSON.stringify(votedPolls));

      setHasVoted(true);
      setUserVote(selectedOption);

      // Optionally refresh total votes
      const { contract: refreshedContract, signerAddress } = await getContract(true);
      const refreshedPoll = await refreshedContract.getPollById(poll.pollId, signerAddress);
      setPoll((prev) => ({
        ...prev,
        totalVotes: Number(refreshedPoll.totalVotes),
        voteCounts: refreshedPoll.voteCounts.map((v) => Number(v)),
      }));
    } catch (err) {
      console.error("❌ Error voting:", err);
      alert(err.reason || err.message || "Vote failed");
    } finally {
      setIsVoting(false);
    }
  };
  // 🆕 --- END VOTE FUNCTION ---

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Loading poll details...
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center text-white px-6">
        <div className="w-24 h-24 mb-6 rounded-full bg-white/5 flex items-center justify-center text-4xl">
          ❓
        </div>
        <h1 className="text-2xl font-light mb-4">Poll Not Found</h1>
        <p className="text-white/60 text-sm mb-8">
          {error || "The poll you're looking for doesn't exist."}
        </p>
        <button
          onClick={() => navigate("/polls")}
          className="px-8 py-3 bg-white text-black rounded-full font-medium text-sm hover:bg-white/90 transition-all"
        >
          Browse All Polls
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <PollMain
        poll={poll}
        hasVoted={hasVoted}
        userVote={userVote}
        shareModal={shareModal}
        setShareModal={setShareModal}
        handleVote={handleVoteOnBlockchain} // 🆕 connect blockchain vote
        navigate={navigate}
        isVoting={isVoting}
      />

      <ShareModal
        poll={poll}
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false })}
      />
    </div>
  );
}
