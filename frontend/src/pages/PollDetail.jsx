"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
// import Header from "@/components/header"
import VotingInterface from "../components/VotingInterface"
import PollResults from "../components/PollResults"
import ShareModal from "../components/ShareModal"

export default function PollDetails() {
  const params = useParams()
  const navigate = useNavigate()
  const [poll, setPoll] = useState(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [userVote, setUserVote] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [shareModal, setShareModal] = useState({ isOpen: false })

  // Mock poll data - in real app, this would be fetched from API
  const mockPolls = {
    "poll-001": {
      id: "poll-001",
      title: "Best Programming Language for 2025",
      description:
        "Vote for the programming language you think will dominate in 2025. Consider factors like community support, job market, performance, and future prospects.",
      image: "/programming-code-abstract.png",
      creator: "TechGuru",
      createdAt: "2025-01-10T10:00:00Z",
      endTime: "2025-02-15T23:59:59Z",
      totalVotes: 1247,
      isActive: true,
      isPublic: true,
      options: [
        { id: "js", text: "JavaScript", votes: 456, percentage: 36.6 },
        { id: "py", text: "Python", votes: 398, percentage: 31.9 },
        { id: "rs", text: "Rust", votes: 234, percentage: 18.8 },
        { id: "go", text: "Go", votes: 159, percentage: 12.7 },
      ],
    },
    "poll-002": {
      id: "poll-002",
      title: "Favorite Coffee Type",
      description: "What's your go-to coffee choice? Help us understand the coffee preferences of our community.",
      image: "/pile-of-coffee-beans.png",
      creator: "CoffeeExpert",
      createdAt: "2025-01-12T08:00:00Z",
      endTime: "2025-01-20T18:00:00Z",
      totalVotes: 892,
      isActive: true,
      isPublic: true,
      options: [
        { id: "esp", text: "Espresso", votes: 267, percentage: 29.9 },
        { id: "lat", text: "Latte", votes: 312, percentage: 35.0 },
        { id: "cap", text: "Cappuccino", votes: 178, percentage: 20.0 },
        { id: "cb", text: "Cold Brew", votes: 135, percentage: 15.1 },
      ],
    },
    "poll-003": {
      id: "poll-003",
      title: "Remote Work vs Office",
      description: "Where do you prefer to work? This poll will help us understand work preferences in the modern era.",
      image: "/modern-office-workspace.png",
      creator: "WorkLifeBalance",
      createdAt: "2025-01-05T09:00:00Z",
      endTime: "2025-01-10T12:00:00Z",
      totalVotes: 2156,
      isActive: false,
      isPublic: true,
      winner: "Remote Work",
      winnerVotes: 1294,
      options: [
        { id: "remote", text: "Remote Work", votes: 1294, percentage: 60.0 },
        { id: "office", text: "Office", votes: 432, percentage: 20.0 },
        { id: "hybrid", text: "Hybrid", votes: 430, percentage: 20.0 },
      ],
    },
  }

  useEffect(() => {
    const loadPoll = () => {
      const pollData = mockPolls[params.id]
      if (pollData) {
        setPoll(pollData)
        // Check if user has already voted (mock check)
        const votedPolls = JSON.parse(localStorage.getItem("votedPolls") || "{}")
        if (votedPolls[params.id]) {
          setHasVoted(true)
          setUserVote(votedPolls[params.id])
        }
      }
      setIsLoading(false)
    }

    loadPoll()
  }, [params.id])

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        {/* <Header /> */}
        <div className="pt-20 flex items-center justify-center">
          <div className="text-white">Loading poll...</div>
        </div>
      </div>
    )
  }

  if (!poll) {
    return (
      <div className="min-h-screen bg-black">
        {/* <Header /> */}
        <div className="pt-20 pb-12 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
              <span className="text-4xl">❓</span>
            </div>
            <h1 className="text-2xl font-light text-white mb-4">Poll Not Found</h1>
            <p className="text-white/60 text-sm mb-8">The poll you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate("/polls")}
              className="px-8 py-3 bg-white text-black rounded-full font-medium text-sm hover:bg-white/90 transition-all duration-200"
            >
              Browse All Polls
            </button>
          </div>
        </div>
      </div>
    )
  }

  const timeLeft = poll.isActive ? new Date(poll.endTime) - new Date() : 0
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24))

  return (
    <div className="min-h-screen bg-black">
      {/* <Header /> */}

      <main className="pt-20 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Poll Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigate.back()}
                className="flex items-center text-white/60 hover:text-white transition-colors text-sm"
              >
                ← Back
              </button>
              <button
                onClick={() => setShareModal({ isOpen: true })}
                className="px-4 py-2 bg-white/10 text-white rounded-full text-sm hover:bg-white/20 transition-all duration-200"
              >
                Share Poll
              </button>
            </div>

            <img
              src={poll.image || "/placeholder.svg?height=300&width=800&query=voting poll"}
              alt={poll.title}
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
                    poll.isPublic ? "bg-blue-500/20 text-blue-400" : "bg-yellow-500/20 text-yellow-400"
                  }`}
                >
                  {poll.isPublic ? "Public" : "Private"}
                </span>
              </div>
              <div className="text-white/60 text-sm">
                {poll.isActive
                  ? daysLeft > 0
                    ? `${daysLeft} days left`
                    : "Ending soon"
                  : `Ended ${new Date(poll.endTime).toLocaleDateString()}`}
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-light text-white mb-4">{poll.title}</h1>
            <p className="text-white/70 text-sm leading-relaxed mb-6">{poll.description}</p>

            <div className="flex items-center justify-between text-sm text-white/60">
              <span>Created by {poll.creator}</span>
              <span>{poll.totalVotes} total votes</span>
            </div>
          </div>

          {/* Voting Interface or Results */}
          {poll.isActive && !hasVoted ? (
            <VotingInterface poll={poll} onVote={handleVote} />
          ) : (
            <PollResults poll={poll} userVote={userVote} hasVoted={hasVoted} />
          )}

          {/* Poll Info */}
          <div className="mt-12 bg-white/5 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-white font-medium mb-4">Poll Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-white/60">Poll ID:</span>
                <span className="text-white ml-2 font-mono">{poll.id}</span>
              </div>
              <div>
                <span className="text-white/60">Created:</span>
                <span className="text-white ml-2">{new Date(poll.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-white/60">End Time:</span>
                <span className="text-white ml-2">{new Date(poll.endTime).toLocaleString()}</span>
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
  )
}
