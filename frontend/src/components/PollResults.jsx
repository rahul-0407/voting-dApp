"use client"

export default function PollResults({ poll, userVote, hasVoted }) {
  const sortedOptions = [...poll.options].sort((a, b) => b.votes - a.votes)
  const winningOption = sortedOptions[0]

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
        {hasVoted && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
            <p className="text-green-400 text-sm">
              ✓ You voted for:{" "}
              <span className="font-medium">{poll.options.find((opt) => opt.id === userVote)?.text}</span>
            </p>
          </div>
        )}

        {!poll.isActive && (
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-light text-white mb-2">
              <span className="font-medium italic instrument">Poll</span> Results
            </h2>
            {winningOption && (
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-white/70 text-sm mb-2">Winner</p>
                <p className="text-white font-medium text-lg">{winningOption.text}</p>
                <p className="text-white/60 text-sm">
                  {winningOption.votes} votes ({winningOption.percentage}%)
                </p>
              </div>
            )}
          </div>
        )}

        <h3 className="text-white font-medium text-lg mb-4">{poll.isActive ? "Current Results" : "Final Results"}</h3>
      </div>

      {/* Results Breakdown */}
      <div className="space-y-4">
        {sortedOptions.map((option, index) => (
          <div
            key={option.id}
            className={`bg-white/5 backdrop-blur-sm rounded-lg p-6 ${
              userVote === option.id ? "ring-2 ring-white/30" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                {index === 0 && !poll.isActive && <span className="text-yellow-400 mr-2 text-lg">👑</span>}
                <span className="text-white font-medium">{option.text}</span>
                {userVote === option.id && (
                  <span className="ml-2 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Your Vote</span>
                )}
              </div>
              <div className="text-right">
                <div className="text-white font-medium">{option.votes} votes</div>
                <div className="text-white/60 text-sm">{option.percentage}%</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ease-out ${index === 0 ? "bg-white" : "bg-white/60"}`}
                style={{ width: `${option.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Results Summary */}
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
        <h4 className="text-white font-medium mb-4">Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-light text-white mb-1">{poll.totalVotes}</div>
            <div className="text-white/60 text-xs">Total Votes</div>
          </div>
          <div>
            <div className="text-2xl font-light text-white mb-1">{poll.options.length}</div>
            <div className="text-white/60 text-xs">Options</div>
          </div>
          <div>
            <div className="text-2xl font-light text-white mb-1">{winningOption?.percentage}%</div>
            <div className="text-white/60 text-xs">Leading Option</div>
          </div>
          <div>
            <div className="text-2xl font-light text-white mb-1">{poll.isActive ? "Active" : "Ended"}</div>
            <div className="text-white/60 text-xs">Status</div>
          </div>
        </div>
      </div>
    </div>
  )
}
