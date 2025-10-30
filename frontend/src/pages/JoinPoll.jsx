"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getContract } from "../utils/contract"; // ✅ same helper you used in PollDetails.jsx
import LoadingSpinner from "../components/LoadingSpinner";
import Breadcrumb from "../components/Breadcrumb";

export default function JoinPoll() {
  const navigate = useNavigate();
  const [pollId, setPollId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoinPoll = async (e) => {
    e.preventDefault();
    if (!pollId.trim()) {
      setError("Please enter a poll ID");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (pollId.trim()) {
      navigate(`/poll/${pollId.trim()}`)
    }
    } catch (err) {
      console.error("❌ Error joining poll:", err);
      setError(err.message || "Poll not found or unable to join.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <main className="pt-20 pb-12 px-6">
        <div className="max-w-2xl mx-auto">
          <Breadcrumb />

          {/* Header */}
          <div className="text-center mb-12" data-scroll-fade>
            <h1 className="text-4xl font-light text-white mb-4">
              <span className="font-medium italic instrument">Join</span> Poll
            </h1>
            <p className="text-white/70 text-sm max-w-xl mx-auto">
              Enter a poll ID to participate in a specific poll
            </p>
          </div>

          {/* Form */}
          <div
            className="bg-white/5 backdrop-blur-sm rounded-lg p-8"
            data-scroll-scale
          >
            <form onSubmit={handleJoinPoll} className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-4">
                  Poll ID
                </label>
                <input
                  type="text"
                  value={pollId}
                  onChange={(e) => setPollId(e.target.value)}
                  placeholder="Enter poll ID (e.g., poll-001)"
                  className="w-full px-4 py-4 bg-white/10 text-white placeholder-white/50 rounded-lg border border-white/20 focus:border-white/40 focus:outline-none text-lg transition-all duration-200"
                  disabled={isLoading}
                />
                {error && (
                  <p className="text-red-400 text-sm mt-2">{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-4 bg-white text-black rounded-lg font-medium text-lg hover:bg-white/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Checking Poll...</span>
                  </>
                ) : (
                  "Join Poll"
                )}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-white/10">
              <h3 className="text-white font-medium mb-4">
                How to get a Poll ID
              </h3>
              <div className="space-y-3 text-sm text-white/70">
                <p>• Poll creators share the ID with participants</p>
                <p>• Check your email or message for the poll link</p>
                <p>• Poll IDs are usually in the format: poll-xxx</p>
              </div>
            </div>
          </div>

          {/* Browse Recent Polls */}
          <div className="mt-12" data-scroll-fade>
            <h3 className="text-white font-medium mb-6">Or browse recent polls</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => navigate("/polls")}
                className="bg-white/5 backdrop-blur-sm rounded-lg p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
              >
                <h4 className="text-white font-medium mb-2 group-hover:text-white/90">
                  Active Polls
                </h4>
                <p className="text-white/60 text-sm">
                  Browse all currently active polls
                </p>
              </div>
              <div
                onClick={() => navigate("/my-votes")}
                className="bg-white/5 backdrop-blur-sm rounded-lg p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
              >
                <h4 className="text-white font-medium mb-2 group-hover:text-white/90">
                  My Votes
                </h4>
                <p className="text-white/60 text-sm">
                  View polls you've participated in
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
