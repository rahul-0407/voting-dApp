"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { getContract } from "../utils/contract"; // ✅ adjust path if needed
import VotingInterface from "../components/VotingInterface";
import PollResults from "../components/PollResults";
import ShareModal from "../components/ShareModal";

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
        console.log(pollId)

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

        // 🌐 2️⃣ Get backend data
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/poll/v1/pollDetail/${pollId}`,
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

  const handleVote = (optionId) => {
    if (hasVoted || !poll.isActive) return

    // Update local storage to track vote
    const votedPolls = JSON.parse(localStorage.getItem("votedPolls") || "{}")
    votedPolls[params.id] = optionId
    localStorage.setItem("votedPolls", JSON.stringify(votedPolls))

    // Update poll data (in real app, this would be an API call)
    const updatedPoll = { ...poll }
    const optionIndex = updatedPoll.options.findIndex((opt) => opt.id === optionId)
    if (optionIndex !== -1) {
      updatedPoll.options[optionIndex].votes += 1
      updatedPoll.totalVotes += 1

      // Recalculate percentages
      updatedPoll.options.forEach((option) => {
        option.percentage = ((option.votes / updatedPoll.totalVotes) * 100).toFixed(1)
      })
    }

    setPoll(updatedPoll)
    setHasVoted(true)
    setUserVote(optionId)
  }

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
        <div className="w-24 h-24 mb-6 rounded-full bg-white/5 flex items-center justify-center text-4xl">❓</div>
        <h1 className="text-2xl font-light mb-4">Poll Not Found</h1>
        <p className="text-white/60 text-sm mb-8">{error || "The poll you're looking for doesn't exist."}</p>
        <button
          onClick={() => navigate("/polls")}
          className="px-8 py-3 bg-white text-black rounded-full font-medium text-sm hover:bg-white/90 transition-all"
        >
          Browse All Polls
        </button>
      </div>
    );
  }

  const timeLeft = poll.isActive ? new Date(poll.endTime * 1000) - new Date() : 0;
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-black">
      <main className="pt-20 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-white/60 hover:text-white text-sm"
              >
                ← Back
              </button>
              <button
                onClick={() => setShareModal({ isOpen: true })}
                className="px-4 py-2 bg-white/10 text-white rounded-full text-sm hover:bg-white/20 transition-all"
              >
                Share Poll
              </button>
            </div>

            <img
              src={poll.img}
              alt={poll.question}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 text-sm rounded-full ${
                    poll.isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {poll.isActive ? "Active" : "Ended"}
                </span>
                <span
                  className={`px-3 py-1 text-sm rounded-full ${
                    poll.visibility === "Public" ? "bg-blue-500/20 text-blue-400" : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {poll.visibility}
                </span>
              </div>
              <div className="text-white/60 text-sm">
                {poll.isActive
                  ? daysLeft > 0
                    ? `${daysLeft} days left`
                    : "Ending soon"
                  : `Ended on ${new Date(poll.endTime * 1000).toLocaleDateString()}`}
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-light text-white mb-4">{poll.question}</h1>
            <p className="text-white/70 text-sm leading-relaxed mb-6">{poll.description}</p>

            <div className="flex items-center justify-between text-sm text-white/60">
              <span>Created by {poll.creator}</span>
              <span>{poll.totalVotes} total votes</span>
            </div>
          </div>

          {/* Vote / Results */}
          {poll.isActive && !hasVoted ? (
            <VotingInterface poll={poll} onVote={handleVote} />
          ) : (
            <PollResults poll={poll} userVote={userVote} hasVoted={hasVoted} />
          )}

          {/* Info Section */}
          <div className="mt-12 bg-white/5 rounded-lg p-6">
            <h3 className="text-white font-medium mb-4">Poll Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-white/60">Poll ID:</span>
                <span className="text-white ml-2 font-mono">{poll.pollId}</span>
              </div>
              <div>
                <span className="text-white/60">Created:</span>
                <span className="text-white ml-2">
                  {new Date(poll.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-white/60">End Time:</span>
                <span className="text-white ml-2">
                  {new Date(poll.endTime * 1000).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-white/60">Total Votes:</span>
                <span className="text-white ml-2">{poll.totalVotes}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ShareModal poll={poll} isOpen={shareModal.isOpen} onClose={() => setShareModal({ isOpen: false })} />
    </div>
  );
}
