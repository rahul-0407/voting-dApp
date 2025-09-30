"use client"

import {Link} from "react-router-dom"

export default function PollCard({ poll, showActions = false, onShare, onDelete }) {
  const isActive = poll.isActive
  const hasEnded = !isActive
  const timeLeft = isActive ? new Date(poll.endTime) - new Date() : 0
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24))

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg overflow-hidden hover:bg-white/10 transition-all duration-300 group">
      <Link to={`/poll/${poll.id}`}>
        <img
          src={poll.image || "/placeholder.svg?height=200&width=400&query=voting poll"}
          alt={poll.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </Link>

      <div className="p-6">
        <Link to={`/poll/${poll.id}`}>
          <h3 className="text-white font-medium mb-2 group-hover:text-white/90 cursor-pointer">{poll.title}</h3>
        </Link>

        <p className="text-white/60 text-xs mb-4 line-clamp-2">{poll.description}</p>

        <div className="flex items-center justify-between text-xs text-white/50 mb-4">
          <span>by {poll.creator || "You"}</span>
          <span>{poll.totalVotes} votes</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              isActive ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
            }`}
          >
            {isActive ? "Active" : "Ended"}
          </span>

          {isActive ? (
            <span className="text-white/40 text-xs">{daysLeft > 0 ? `${daysLeft} days left` : "Ending soon"}</span>
          ) : (
            poll.winner && <span className="text-white/60 text-xs font-medium">Winner: {poll.winner}</span>
          )}
        </div>

        {poll.isPublic !== undefined && (
          <div className="flex items-center justify-between mb-4">
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                poll.isPublic ? "bg-blue-500/20 text-blue-400" : "bg-yellow-500/20 text-yellow-400"
              }`}
            >
              {poll.isPublic ? "Public" : "Private"}
            </span>
          </div>
        )}

        {showActions && (
          <div className="flex gap-2 mt-4">
            <Link to={`/poll/${poll.id}`} className="flex-1">
              <button className="w-full px-4 py-2 bg-white/10 text-white text-xs rounded-full hover:bg-white/20 transition-all duration-200">
                View Details
              </button>
            </Link>
            <button
              onClick={() => onShare && onShare(poll)}
              className="px-4 py-2 bg-white/10 text-white text-xs rounded-full hover:bg-white/20 transition-all duration-200"
            >
              Share
            </button>
            {onDelete && (
              <button
                onClick={() => onDelete(poll)}
                className="px-4 py-2 bg-red-500/20 text-red-400 text-xs rounded-full hover:bg-red-500/30 transition-all duration-200"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
