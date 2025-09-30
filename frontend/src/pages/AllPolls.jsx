"use client"

import { useState } from "react"
import {Link} from "react-router-dom"
// import Header from "@/components/header"
import PollCard from "../components/PollCard"

export default function AllPolls() {
  const [polls] = useState([
    {
      id: "poll-001",
      title: "Best Programming Language for 2025",
      description: "Vote for the programming language you think will dominate in 2025",
      image: "/programming-code-abstract.png",
      creator: "TechGuru",
      endTime: "2025-02-15T23:59:59Z",
      totalVotes: 1247,
      isActive: true,
      options: ["JavaScript", "Python", "Rust", "Go"],
    },
    {
      id: "poll-002",
      title: "Favorite Coffee Type",
      description: "What's your go-to coffee choice?",
      image: "/pile-of-coffee-beans.png",
      creator: "CoffeeExpert",
      endTime: "2025-01-20T18:00:00Z",
      totalVotes: 892,
      isActive: true,
      options: ["Espresso", "Latte", "Cappuccino", "Cold Brew"],
    },
    {
      id: "poll-003",
      title: "Remote Work vs Office",
      description: "Where do you prefer to work?",
      image: "/modern-office-workspace.png",
      creator: "WorkLifeBalance",
      endTime: "2025-01-10T12:00:00Z",
      totalVotes: 2156,
      isActive: false,
      winner: "Remote Work",
      winnerVotes: 1294,
    },
  ])

  const activePolls = polls.filter((poll) => poll.isActive)
  const endedPolls = polls.filter((poll) => !poll.isActive)

  return (
    <div className="min-h-screen bg-black">
      {/* <Header /> */}

      <main className="pt-20 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-light text-white mb-4">
              <span className="font-medium italic instrument">Active</span> Polls
            </h1>
            <p className="text-white/70 text-sm max-w-2xl mx-auto">
              Discover and participate in ongoing polls from the community
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex justify-center gap-4 mb-12">
            <Link href="/create-poll">
              <button className="px-6 py-3 bg-white text-black rounded-full font-medium text-sm hover:bg-white/90 transition-all duration-200">
                Create Poll
              </button>
            </Link>
            <Link href="/join-poll">
              <button className="px-6 py-3 bg-white/10 text-white rounded-full font-medium text-sm hover:bg-white/20 transition-all duration-200">
                Join by ID
              </button>
            </Link>
          </div>

          {/* Active Polls */}
          <div className="mb-16">
            <h2 className="text-2xl font-light text-white mb-8">Currently Active ({activePolls.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activePolls.map((poll) => (
                <PollCard key={poll.id} poll={poll} />
              ))}
            </div>
          </div>

          {/* Ended Polls */}
          {endedPolls.length > 0 && (
            <div>
              <h2 className="text-2xl font-light text-white mb-8">Recently Ended ({endedPolls.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {endedPolls.map((poll) => (
                  <PollCard key={poll.id} poll={poll} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
