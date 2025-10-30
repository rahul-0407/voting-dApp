"use client";

import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import PollCard from "../components/PollCard";
import axios from "axios";
import { getContract } from "../utils/contract"; // ✅ using your working version
import { MainContext } from "../context/MainContext";

export default function AllPolls() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const { walletAddress } = useContext(MainContext);

  useEffect(() => {
    if (walletAddress) fetchAllPolls();
  }, [walletAddress]);

  const fetchAllPolls = async () => {
    // console.log("🔍 Fetching polls from backend + blockchain...");
    setLoading(true);

    try {
      // --- 1️⃣ Fetch from Backend ---
      let backendPolls = [];
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/poll/v1/allPublicPolls`
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
          throw new Error("❌ Wallet not connected. Please connect your wallet.");

        // console.log("🧩 Contract loaded:", contract.address);
        // console.log("👤 Wallet address:", signerAddress);

        const fetchedPolls = await contract.getAllPublicPolls(signerAddress);
        // console.log("✅ Blockchain polls fetched:", fetchedPolls.length);

        blockchainPolls = fetchedPolls.map((p) => {
          const start = Number(p.startTime) * 1000;
          const end = Number(p.endTime) * 1000;
          const now = Date.now();
          return {
            pollId: p.pollId,
            question: p.question,
            creator: p.creator,
            startTime: start,
            endTime: end,
            totalVotes: Number(p.totalVotes),
            isActive: now >= start && now <= end && p.isActive,
            visibility: p.visible === 0 ? "Public" : "Private",
            options: p.options,
          };
        });
      } catch (error) {
        console.error("❌ Blockchain fetch error:", error);
        if (error.reason) console.error("🧠 Reason:", error.reason);
        if (error.data) console.error("📦 Data:", error.data);
        if (error.code) console.error("⚙️ Code:", error.code);
        alert(
          `⚠️ Unable to fetch blockchain polls:\n\n${
            error.message || "Unknown error"
          }\n\nCheck console for details.`
        );
      }

      // --- 3️⃣ Merge Data (use blockchain status + backend img/description) ---
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

      // console.log("✅ Final merged polls:", merged);
      setPolls(merged);
    } catch (err) {
      console.error("❌ Unexpected error in fetchAllPolls:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- Filter Active / Ended polls ---
  const now = Date.now();
  const activePolls = polls.filter((p) => now >= p.startTime && now <= p.endTime && p.isActive);
  const endedPolls = polls.filter((p) => now > p.endTime || !p.isActive);

  return (
    <div className="min-h-screen bg-black pt-7">
      <main className="pt-20 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-light text-white mb-4">
              <span className="font-medium italic instrument">Active</span> Polls
            </h1>
            <p className="text-white/70 text-sm max-w-2xl mx-auto">
              Discover and participate in ongoing polls from the community
            </p>
          </div>

          <div className="flex justify-center gap-4 mb-12">
            <Link to="/create-poll">
              <button className="px-6 py-3 bg-white text-black rounded-full font-medium text-sm hover:bg-white/90 transition-all duration-200">
                Create Poll
              </button>
            </Link>
            <Link to="/join-poll">
              <button className="px-6 py-3 bg-white/10 text-white rounded-full font-medium text-sm hover:bg-white/20 transition-all duration-200">
                Join by ID
              </button>
            </Link>
          </div>

          {loading ? (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
              <p className="text-white">⏳ Loading polls...</p>
            </div>
          ) : (
            <>
              {activePolls.length === 0 && endedPolls.length === 0 ? (
                <div className="text-center py-12">
                  <h2 className="text-2xl font-light text-white mb-4">No Polls Yet</h2>
                  <p className="text-white/60 text-sm mb-8">
                    Be the first to create a poll and start collecting votes!
                  </p>
                  <Link to="/create-poll">
                    <button className="px-8 py-3 bg-white text-black rounded-full font-medium text-sm hover:bg-white/90 transition-all duration-200">
                      Create First Poll
                    </button>
                  </Link>
                </div>
              ) : (
                <>
                  {activePolls.length > 0 && (
                    <div className="mb-16">
                      <h2 className="text-2xl font-light text-white mb-8">
                        Currently Active ({activePolls.length})
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activePolls.map((poll, idx) => (
                          <PollCard key={poll.pollId || idx} poll={poll} />
                        ))}
                      </div>
                    </div>
                  )}

                  {endedPolls.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-light text-white mb-8">
                        Recently Ended ({endedPolls.length})
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {endedPolls.map((poll, idx) => (
                          <PollCard key={poll.pollId || idx} poll={poll} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {process.env.NODE_ENV === "development" && (
            <div className="mt-8 p-4 bg-white/5 rounded-lg text-xs text-white/60">
              <p>Debug Info:</p>
              <p>• Total Polls: {polls.length}</p>
              <p>• Active: {activePolls.length}</p>
              <p>• Ended: {endedPolls.length}</p>
              <p>• Wallet: {walletAddress || "Not connected"}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
