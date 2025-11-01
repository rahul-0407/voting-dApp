"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ethers } from "ethers";
import { getContract } from "../utils/contract";
import PollMain from "../components/PollMain";
import ShareModal from "../components/ShareModal";

export default function PrivatePollDetails() {
  const { id: pollId } = useParams();
  const navigate = useNavigate();

  const [poll, setPoll] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [shareModal, setShareModal] = useState({ isOpen: false });
  const [signerAddress, setSignerAddress] = useState(null);

  // For allowed voters UI
  const [allowedVoters, setAllowedVoters] = useState([""]);
  const [isSubmittingVoters, setIsSubmittingVoters] = useState(false);
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    const loadPollDetails = async () => {
      try {
        if (!pollId) return;

        const { contract, signerAddress } = await getContract(true);
        if (!contract) throw new Error("Contract not loaded.");
        if (!signerAddress) throw new Error("Wallet not connected.");

        setSignerAddress(signerAddress);

        const cleanPollId = pollId.trim();
        const chainPoll = await contract.getPollById(cleanPollId, signerAddress);
        // console.log("🧠 Raw poll data from contract:", chainPoll);

        const visibility = chainPoll.visible === 0n ? "Public" : "Private";

        // Redirect to private route if needed
        if (visibility === "Private") {
          navigate(`/private-poll/${cleanPollId}`);
        }

        if (!chainPoll || !chainPoll.pollId) {
          setError("Poll not found on blockchain");
          return;
        }

        // Convert BigInts safely
        const voteCounts = Array.from(chainPoll.voteCounts).map((v) => Number(v));
        // console.log("📊 Parsed voteCounts:", voteCounts);

        const formatted = {
          pollId: chainPoll.pollId,
          question: chainPoll.question,
          options: chainPoll.options,
          totalVotes: Number(chainPoll.totalVotes),
          startTime: Number(chainPoll.startTime),
          endTime: Number(chainPoll.endTime),
          isActive: chainPoll.isActive,
          visibility,
          voteCounts,
          creator: chainPoll.creator,
          hasVoted: chainPoll.hasVoted,
        };

        // Backend data
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

        // Check creator
        if (signerAddress.toLowerCase() === formatted.creator.toLowerCase()) {
          setIsCreator(true);
        }

        // ✅ On-chain hasVoted check
        if (formatted.hasVoted) {
          setHasVoted(true);
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

  // 🔹 Handle vote submission (on-chain + backend)
  const handleVote = async (optionId) => {
    try {
      if (hasVoted || !poll.isActive) {
        alert("You have already voted or the poll has ended.");
        return;
      }
      

      const { contract, signerAddress } = await getContract(true);
      if (!contract || !signerAddress) {
        alert("Please connect your wallet first.");
        return;
      }

      const selectedOption = poll.options[optionId];
      if (!selectedOption) {
        alert("Invalid option selected.");
        return;
      }

      // 🔹 Step 1: Send transaction to blockchain
      const tx = await contract.vote(poll.pollId, selectedOption); // use index, not option text
      await tx.wait();

      setHasVoted(true);

      // 🔹 Step 2: Sync with backend (optional)
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/poll/v1/voteInPoll`,
        {
          pollId: poll.pollId,
          optionIndex: optionId,
        },
        { withCredentials: true }
      );

      alert("✅ Vote successfully recorded!");
    } catch (err) {
      console.error("❌ Vote error:", err);
      const reason =
        err?.reason || err?.data?.message || err?.message || "Transaction failed";
      alert(`Vote failed: ${reason}`);
    }
  };

  // 🔹 Handle adding/removing voter inputs
  const updateVoter = (index, value) => {
    const updated = [...allowedVoters];
    updated[index] = value;
    setAllowedVoters(updated);
  };

  const addVoterField = () => {
    if (allowedVoters.length < 10) setAllowedVoters([...allowedVoters, ""]);
  };

  const removeVoterField = (index) => {
    if (allowedVoters.length > 1) {
      const updated = allowedVoters.filter((_, i) => i !== index);
      setAllowedVoters(updated);
    }
  };

  // 🔹 Submit allowed voters to blockchain
  const handleAddAllowedVoters = async () => {
    try {
      setIsSubmittingVoters(true);
      const { contract } = await getContract(true);
      if (!contract) throw new Error("Contract not loaded");

      // normalize & validate addresses
      const validVoters = allowedVoters
        .map((v) => (v || "").trim())
        .filter((v) => v.length > 0)
        .filter((v) => {
          try {
            return ethers.isAddress(v) && v !== ethers.ZeroAddress;
          } catch {
            return false;
          }
        });

      if (validVoters.length === 0) {
        alert("Please enter at least one valid Ethereum address");
        return;
      }

      const tx = await contract.addAllowedVoter(poll.pollId, validVoters);
      await tx.wait();
      alert("✅ Allowed voters added successfully!");
      setAllowedVoters([""]);
    } catch (err) {
      console.error("❌ Error adding voters:", err);
      alert(err?.message || "Transaction failed");
    } finally {
      setIsSubmittingVoters(false);
    }
  };

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
    <div className="min-h-screen bg-black pt-7 pb-20">
      <PollMain
        poll={poll}
        hasVoted={hasVoted}
        isActive={poll.isActive}
        shareModal={shareModal}
        setShareModal={setShareModal}
        handleVote={handleVote}
        navigate={navigate}
      />

      {/* 🧩 Allowed Voters Section (Visible only to Creator of Private Poll) */}
      {poll.visibility === "Private" && isCreator && (
        <div className="max-w-4xl mx-auto mt-10 bg-white/5 rounded-lg p-6">
          <div className="flex justify-between mb-4">
            <label className="text-white font-medium">Allowed Voters *</label>
            <span className="text-white/50 text-xs">
              {allowedVoters.length}/10 addresses
            </span>
          </div>

          <div className="space-y-3">
            {allowedVoters.map((voter, i) => (
              <div key={i} className="flex gap-3">
                <input
                  type="text"
                  value={voter}
                  onChange={(e) => updateVoter(i, e.target.value)}
                  placeholder={`Voter address ${i + 1}`}
                  className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg border border-white/20 focus:border-white/40 focus:outline-none"
                  required
                  disabled={isSubmittingVoters}
                />
                {allowedVoters.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVoterField(i)}
                    className="px-3 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-200"
                    disabled={isSubmittingVoters}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>

          {allowedVoters.length < 10 && (
            <button
              type="button"
              onClick={addVoterField}
              className="mt-4 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200 text-sm"
              disabled={isSubmittingVoters}
            >
              + Add Voter
            </button>
          )}

          <div className="mt-6">
            <button
              onClick={handleAddAllowedVoters}
              disabled={isSubmittingVoters}
              className="px-6 py-3 bg-white text-black rounded-full font-medium text-sm hover:bg-white/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmittingVoters
                ? "Adding Voters..."
                : "Submit Allowed Voters"}
            </button>
          </div>
        </div>
      )}

      <ShareModal
        poll={poll}
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false })}
      />
    </div>
  );
}
