"use client";

import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { getContract } from "../utils/contract";
import { MainContext } from "../context/MainContext";
import PollCard from "../components/PollCard";
import ShareModal from "../components/ShareModal";

export default function MyPolls() {
  const [myPolls, setMyPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareModal, setShareModal] = useState({ isOpen: false, poll: null });
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
          `${import.meta.env.VITE_BACKEND_URL}/api/poll/v1/getCreatedPoll`,
          { withCredentials:true}
        );
        if (res.data?.success && Array.isArray(res.data.polls)) {
          backendPolls = res.data.polls;
          // console.log("✅ Backend polls fetched:", backendPolls.length);
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

        const fetchedPolls = await contract.getMyCreatedPolls(signerAddress);
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
      setMyPolls(merged);
    } catch (err) {
      console.error("❌ Unexpected error in fetchMyPolls:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (poll) => {
    setShareModal({ isOpen: true, poll });
  };

  const handleDelete = (pollToDelete) => {
    if (confirm(`Are you sure you want to delete "${pollToDelete.title}"?`)) {
      setMyPolls(myPolls.filter((poll) => poll.id !== pollToDelete.id));
    }
  };

  const activePolls = myPolls.filter((p) => p.isActive);
  const totalVotes = myPolls.reduce((sum, p) => sum + (p.totalVotes || 0), 0);

  return (
    <div className="min-h-screen bg-black pt-7">
      <main className="pt-20 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <h1 className="text-4xl font-light text-white mb-4">
                <span className="font-medium italic instrument">My</span> Polls
              </h1>
              <p className="text-white/70 text-sm">
                Manage and track your created polls
              </p>
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
                {activePolls.length}
              </div>
              <div className="text-white/70 text-sm">Active Polls</div>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
              <div className="text-2xl font-light text-white mb-2">
                {totalVotes}
              </div>
              <div className="text-white/70 text-sm">Total Votes</div>
            </div>
          </div>

          {/* My Polls Grid */}
          {loading ? (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
              <p className="text-white">⏳ Loading your polls...</p>
            </div>
          ) : myPolls.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myPolls.map((poll) => (
                <PollCard
                  key={poll.pollId}
                  poll={poll}
                  showActions={true}
                  onShare={handleShare}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                <span className="text-4xl">📊</span>
              </div>
              <h3 className="text-white font-medium mb-2">
                No polls created yet
              </h3>
              <p className="text-white/60 text-sm mb-6">
                Create your first poll to get started
              </p>
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
  );
}
