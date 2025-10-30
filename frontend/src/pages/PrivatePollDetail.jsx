"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { getContract } from "../utils/contract"; // ✅ adjust path if needed
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

  useEffect(() => {
    const loadPollDetails = async () => {
      try {
        if (!pollId) return;

        // 🧩 1️⃣ Get blockchain data
        const { contract, signerAddress } = await getContract(true);
        if (!contract) throw new Error("Contract not loaded.");
        if (!signerAddress) throw new Error("Wallet not connected.");

        console.log("🔗 Connected contract:", contract.address);
        console.log("👤 Signer address:", signerAddress);
        console.log("hii");

        const cleanPollId = pollId?.trim() || "";

        console.log("🔍 Original pollId:", pollId);
        console.log("🔍 Clean pollId:", cleanPollId);
        console.log("🔍 PollId bytes:", new TextEncoder().encode(cleanPollId));

        const chainPoll = await contract.getPollById(
          cleanPollId,
          signerAddress
        );
        console.log("🧠 Raw chain poll:", chainPoll);

        const visibility = chainPoll.visible === 0n ? "Public" : "Private";

        // ✅ Navigate based on visibility
        if (visibility === "Private"){
          navigate(`/private-poll/${cleanPollId}`);
        }

        if (!chainPoll || !chainPoll.pollId) {
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

        // 🌐 2️⃣ Get backend data
        const res = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/poll/v1/pollDetail/${pollId}`,
          { withCredentials: true }
        );
        const backendPoll = res.data?.poll || {};

        // 🔀 3️⃣ Merge both
        const mergedPoll = {
          ...formatted,
          description: backendPoll.description || "No description provided.",
          img: backendPoll.img || "/placeholder.svg",
          createdAt: backendPoll.createdAt || new Date().toISOString(),
        };

        setPoll(mergedPoll);

        // 4️⃣ Check if user already voted (localStorage)
        const votedPolls = JSON.parse(
          localStorage.getItem("votedPolls") || "{}"
        );
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

  const handleVote = (optionId) => {
    if (hasVoted || !poll.isActive) return;

    // Update local storage to track vote
    const votedPolls = JSON.parse(localStorage.getItem("votedPolls") || "{}");
    votedPolls[params.id] = optionId;
    localStorage.setItem("votedPolls", JSON.stringify(votedPolls));

    // Update poll data (in real app, this would be an API call)
    const updatedPoll = { ...poll };
    const optionIndex = updatedPoll.options.findIndex(
      (opt) => opt.id === optionId
    );
    if (optionIndex !== -1) {
      updatedPoll.options[optionIndex].votes += 1;
      updatedPoll.totalVotes += 1;

      // Recalculate percentages
      updatedPoll.options.forEach((option) => {
        option.percentage = (
          (option.votes / updatedPoll.totalVotes) *
          100
        ).toFixed(1);
      });
    }

    setPoll(updatedPoll);
    setHasVoted(true);
    setUserVote(optionId);
  };

  // 🌀 UI States
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

  const timeLeft = poll.isActive
    ? new Date(poll.endTime * 1000) - new Date()
    : 0;
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-black">
      <PollMain
        poll={poll}
        hasVoted={hasVoted}
        userVote={userVote}
        shareModal={shareModal}
        setShareModal={setShareModal}
        handleVote={handleVote}
        navigate={navigate}
      />
      <ShareModal
        poll={poll}
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false })}
      />
    </div>
  );
}
