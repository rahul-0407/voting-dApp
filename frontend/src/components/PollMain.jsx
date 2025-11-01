// src/components/PollMain.jsx
"use client";

import VotingInterface from "./VotingInterface";
import PollResults from "./PollResults";
import ShareModal from "./ShareModal";

export default function PollMain({
  poll,
  hasVoted,
  isActive,
  shareModal,
  setShareModal,
  handleVote,
  navigate,
}) {
  const timeLeft = poll.isActive ? new Date(poll.endTime * 1000) - new Date() : 0;
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
  console.log(isActive)

  return (
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
        {isActive && !hasVoted ? (
          <VotingInterface poll={poll} onVote={handleVote} />
        ) : (
          <PollResults poll={poll} hasVoted={hasVoted} />
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
              <span className="text-white ml-2">{new Date(poll.createdAt).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="text-white/60">End Time:</span>
              <span className="text-white ml-2">{new Date(poll.endTime * 1000).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-white/60">Total Votes:</span>
              <span className="text-white ml-2">{poll.totalVotes}</span>
            </div>
          </div>
        </div>
      </div>

      <ShareModal poll={poll} isOpen={shareModal.isOpen} onClose={() => setShareModal({ isOpen: false })} />
    </main>
  );
}
