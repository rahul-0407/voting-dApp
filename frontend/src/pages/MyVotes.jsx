"use client"

import { useState, useEffect, useContext } from "react"
import { useNavigate, Link } from "react-router-dom"
import PollCard from "../components/PollCard"
import { getContract } from "../utils/contract";
import abstract from "../assets/programming-code-abstract.png"
import coffee from "../assets/pile-of-coffee-beans.png"
import office from "../assets/modern-office-workspace.png"
import { MainContext } from "../context/MainContext";

export default function MyVotes() {
  const navigate = useNavigate()
  const [myVotedPolls, setMyVotedPolls] = useState([]);
  const [filter, setFilter] = useState("all") // all, results-declared
  const [pollId, setPollId] = useState("")
  const { walletAddress } = useContext(MainContext);

  useEffect(() => {
      if (walletAddress) fetchMyPolls();
    }, [walletAddress]);

    const fetchMyPolls = async () => {
    // console.log("🔍 Fetching My Polls from backend + contract...");
    setLoading(true);
    try {
      // --- 1️⃣ Fetch from Backend ---
      let backendPolls = [];
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/poll/v1/getVotedPoll`,
          { withCredentials:true}
        );
        if (res.data?.success && Array.isArray(res.data.polls)) {
          backendPolls = res.data.polls;
          console.log("✅ Backend polls fetched:", backendPolls.length);
        } else {
          console.warn("⚠️ Unexpected backend response:", res.data);
        }
      } catch (err) {
        console.error("❌ Backend fetch failed:", err.message);
      }

      // --- 2️⃣ Fetch from Blockchain ---
      let blockchainPolls = [];
      try {
        const { contract, signerAddress } = await getContract(true);
        if (!contract) throw new Error("❌ Contract instance not found.");
        if (!signerAddress)
          throw new Error("❌ Wallet not connected. Please connect wallet.");

        // console.log("🧩 Contract loaded:", contract.address);
        // console.log("👤 Fetching polls for:", signerAddress);

        const fetchedPolls = await contract.getMyVotedPolls(signerAddress);
        console.log("✅ Blockchain polls fetched:", fetchedPolls);

        blockchainPolls = fetchedPolls.map((p) => {
          const start = Number(p.startTime) * 1000;
          const end = Number(p.endTime) * 1000;
          const now = Date.now();
          return {
            pollId: p.pollId,
            title: p.question,
            creator: p.creator,
            startTime: start,
            endTime: end,
            totalVotes: Number(p.totalVotes),
            isActive: now >= start && now <= end && p.isActive,
            visibility: p.visible === 0n ? "Public" : "Private",
            options: p.options,
          };
        });
      } catch (error) {
        console.error("❌ Blockchain fetch error:", error);
        alert(
          `⚠️ Unable to fetch blockchain polls:\n\n${
            error.message || "Unknown error"
          }\n\nCheck console for details.`
        );
      }

      // --- 3️⃣ Merge Data ---
      const merged = blockchainPolls.map((chainPoll) => {
        const backendMatch = backendPolls.find(
          (b) => b.pollId === chainPoll.pollId
        );
        return {
          ...chainPoll,
          img: backendMatch?.img || "/placeholder.svg",
          description: backendMatch?.description || "No description available",
        };
      });

      console.log("✅ Final merged polls:", merged);
      setMyVotedPolls(merged);
    } catch (err) {
      console.error("❌ Unexpected error in fetchMyPolls:", err);
    } finally {
      setLoading(false);
    }
  };

  const [votedPolls] = useState([
    {
      id: "poll-001",
      title: "Best Programming Language for 2025",
      description: "Vote for the programming language you think will dominate in 2025",
      image: abstract,
      creator: "TechGuru",
      votedAt: "2025-01-15T10:30:00Z",
      myVote: "JavaScript",
      isActive: true,
      totalVotes: 1247,
    },
    {
      id: "poll-002",
      title: "Favorite Coffee Type",
      description: "What's your go-to coffee choice?",
      image: coffee,
      creator: "CoffeeExpert",
      votedAt: "2025-01-14T15:45:00Z",
      myVote: "Latte",
      isActive: true,
      totalVotes: 892,
    },
    {
      id: "poll-003",
      title: "Remote Work vs Office",
      description: "Where do you prefer to work?",
      image: office,
      creator: "WorkLifeBalance",
      votedAt: "2025-01-08T09:15:00Z",
      myVote: "Remote Work",
      isActive: false,
      winner: "Remote Work",
      winnerVotes: 1294,
      totalVotes: 2156,
    },
  ])

  const filteredPolls = filter === "results-declared" ? myVotedPolls.filter((poll) => !poll.isActive) : myVotedPolls
  const sortedPolls = filteredPolls.sort((a, b) => new Date(b.votedAt) - new Date(a.votedAt))

  // ✅ Added join poll function here (no extra change)
  const handleJoinPoll = (e) => {
    e.preventDefault()
    if (pollId.trim()) {
      navigate(`/poll/${pollId.trim()}`)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <main className="pt-20 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-light text-white mb-4">
              <span className="font-medium italic instrument">My</span> Votes
            </h1>
            <p className="text-white/70 text-sm mb-6">Track all the polls you've participated in</p>

            {/* Filter Options */}
            <div className="flex gap-4">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-full text-xs transition-all duration-200 ${
                  filter === "all" ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                All Votes ({myVotedPolls.length})
              </button>
              <button
                onClick={() => setFilter("results-declared")}
                className={`px-4 py-2 rounded-full text-xs transition-all duration-200 ${
                  filter === "results-declared" ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                Results Declared ({myVotedPolls.filter((p) => !p.isActive).length})
              </button>
            </div>
          </div>

          {/* ✅ Added Join Poll by ID Section */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 mb-12">
            <h3 className="text-white font-medium mb-4">Join Poll by ID</h3>
            <form onSubmit={handleJoinPoll} className="flex gap-4">
              <input
                type="text"
                value={pollId}
                onChange={(e) => setPollId(e.target.value)}
                placeholder="Enter poll ID (e.g., poll-001)"
                className="flex-1 px-4 py-3 bg-white/10 text-white placeholder-white/50 rounded-full border border-white/20 focus:border-white/40 focus:outline-none text-sm"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-black rounded-full font-medium text-sm hover:bg-white/90 transition-all duration-200"
              >
                Join Poll
              </button>
            </form>
            <div className="mt-4">
              <Link to="/join-poll">
                <button className="text-white/60 hover:text-white text-sm transition-colors">
                  Need help finding a poll? →
                </button>
              </Link>
            </div>
          </div>

          {/* Voted Polls */}
          {sortedPolls.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedPolls.map((poll) => (
                <div key={poll.id} className="relative">
                  <PollCard poll={poll} />
                  <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-white/70 text-xs">Your vote: </span>
                    <span className="text-white font-medium text-xs">{poll.myVote}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                <span className="text-4xl">🗳️</span>
              </div>
              <h3 className="text-white font-medium mb-2">No votes cast yet</h3>
              <p className="text-white/60 text-sm mb-6">Start participating in polls to see your voting history</p>
              <Link to="/polls">
                <button className="px-8 py-3 bg-white text-black rounded-full font-medium text-sm hover:bg-white/90 transition-all duration-200">
                  Browse Polls
                </button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
