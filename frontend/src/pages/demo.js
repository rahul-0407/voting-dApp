"use client";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { getContract } from "../utils/contract";

export default function PollDetails() {
  const { id: pollId } = useParams();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          {
          withCredentials: true,
        }
        );

        const backendPoll = res.data?.poll || {};

        // 🔀 3️⃣ Merge both
        const mergedPoll = {
          ...formatted,
          description: backendPoll.description || "No description provided.",
          img: backendPoll.img || "/placeholder.svg",
        };

        setPoll(mergedPoll);
      } catch (err) {
        console.error("❌ Error loading poll:", err);
        setError(err.message || "Failed to load poll details");
      } finally {
        setLoading(false);
      }
    };

    loadPollDetails();
  }, [pollId]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
        ⏳ Loading poll details...
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-red-500">
        ⚠️ {error}
      </div>
    );

  if (!poll)
    return (
      <div className="flex justify-center items-center min-h-screen bg-black text-white">
        Poll not found
      </div>
    );

  // 🧮 calculate percentages
  const totalVotes = poll.totalVotes || 0;
  const now = Date.now();
  const isActive =
    now >= poll.startTime * 1000 && now <= poll.endTime * 1000 && poll.isActive;

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-16 px-6">
      <div className="max-w-4xl mx-auto bg-white/10 rounded-3xl shadow-lg p-8">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          {poll.img && (
            <img
              src={poll.img}
              alt="Poll"
              className="w-full md:w-1/2 rounded-2xl"
            />
          )}

          <div className="flex-1">
            <h1 className="text-3xl font-semibold mb-2">{poll.question}</h1>
            <p className="text-white/70 mb-4">{poll.description}</p>

            <p className="text-sm text-white/60 mb-1">
              Visibility: <span className="font-medium">{poll.visibility}</span>
            </p>
            <p className="text-sm text-white/60 mb-1">
              Creator:{" "}
              <span className="font-mono text-white/80">{poll.creator}</span>
            </p>
            <p className="text-sm text-white/60">
              Status:{" "}
              <span
                className={`font-semibold ${
                  isActive ? "text-green-400" : "text-red-400"
                }`}
              >
                {isActive ? "Active" : "Ended"}
              </span>
            </p>
          </div>
        </div>

        {/* Options */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Options</h2>
          <div className="space-y-3">
            {poll.options.map((opt, idx) => {
              const votes = poll.voteCounts[idx] || 0;
              const percentage =
                totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : 0;

              return (
                <div
                  key={idx}
                  className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                >
                  <p className="font-medium">{opt}</p>
                  <div className="w-full bg-white/10 rounded-full h-2.5 mt-2">
                    <div
                      className="bg-blue-500 h-2.5 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-white/60 mt-1">
                    {votes} votes ({percentage}%)
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Poll Info */}
        <div className="mt-8 text-sm text-white/60 border-t border-white/10 pt-4">
          <p>
            🕒 Start:{" "}
            {new Date(poll.startTime * 1000).toLocaleString()}
          </p>
          <p>
            ⏰ End: {new Date(poll.endTime * 1000).toLocaleString()}
          </p>
          <p>📊 Total Votes: {poll.totalVotes}</p>
        </div>
      </div>
    </div>
  );
}
