"use client"

import { useState } from "react"
import {Link} from "react-router-dom"
// import Header from "@/components/header"
import PollCard from "../components/PollCard"
import ShareModal from "../components/ShareModal"


import development from "../assets/web-development-concept.png"
import team from "../assets/diverse-team-meeting.png"

export default function MyPolls() {
  const [myPolls, setMyPolls] = useState([
    {
      id: "poll-004",
      title: "Favorite Web Framework",
      description: "Which web framework do you prefer for building modern applications?",
      image: development,
      endTime: "2025-02-01T23:59:59Z",
      totalVotes: 456,
      isActive: true,
      options: ["React", "Vue", "Angular", "Svelte"],
      isPublic: true,
    },
    {
      id: "poll-005",
      title: "Team Meeting Time",
      description: "What time works best for our weekly team meetings?",
      image: team,
      endTime: "2025-01-25T17:00:00Z",
      totalVotes: 12,
      isActive: true,
      options: ["9 AM", "11 AM", "2 PM", "4 PM"],
      isPublic: false,
    },
  ])

  const [shareModal, setShareModal] = useState({ isOpen: false, poll: null })

  const handleShare = (poll) => {
    setShareModal({ isOpen: true, poll })
  }

  const handleDelete = (pollToDelete) => {
    if (confirm(`Are you sure you want to delete "${pollToDelete.title}"?`)) {
      setMyPolls(myPolls.filter((poll) => poll.id !== pollToDelete.id))
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* <Header /> */}

      <main className="pt-20 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl font-light text-white mb-4">
                <span className="font-medium italic instrument">My</span> Polls
              </h1>
              <p className="text-white/70 text-sm">Manage and track your created polls</p>
            </div>
            <Link to="/create-poll">
              <button className="px-6 py-3 bg-white text-black rounded-full font-medium text-sm hover:bg-white/90 transition-all duration-200">
                Create New Poll
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
              <div className="text-2xl font-light text-white mb-2">{myPolls.length}</div>
              <div className="text-white/70 text-sm">Total Polls</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
              <div className="text-2xl font-light text-white mb-2">
                {myPolls.filter((poll) => poll.isActive).length}
              </div>
              <div className="text-white/70 text-sm">Active Polls</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
              <div className="text-2xl font-light text-white mb-2">
                {myPolls.reduce((sum, poll) => sum + poll.totalVotes, 0)}
              </div>
              <div className="text-white/70 text-sm">Total Votes</div>
            </div>
          </div>

          {/* My Polls */}
          {myPolls.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myPolls.map((poll) => (
                <PollCard key={poll.id} poll={poll} showActions={true} onShare={handleShare} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                <span className="text-4xl">📊</span>
              </div>
              <h3 className="text-white font-medium mb-2">No polls created yet</h3>
              <p className="text-white/60 text-sm mb-6">Create your first poll to get started</p>
              <Link to="/create-poll">
                <button className="px-8 py-3 bg-white text-black rounded-full font-medium text-sm hover:bg-white/90 transition-all duration-200">
                  Create Your First Poll
                </button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <ShareModal
        poll={shareModal.poll}
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal({ isOpen: false, poll: null })}
      />
    </div>
  )
}
