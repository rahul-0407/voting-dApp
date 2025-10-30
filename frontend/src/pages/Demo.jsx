"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Navbar";
import Breadcrumb from "../components/Breadcrumb";
import { getContract } from "../utils/contract";
import LoadingSpinner from "../components/LoadingSpinner";
// import { BACKEND_URL } from "../config";

export default function CreatePoll() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    question: "",
    description: "",
    options: ["", ""],
    endTime: "",
    isPublic: true,
    type: "standard",
    image: null,
  });

  // ✅ ADD THIS NEW FUNCTION
  const handleFetchAllPolls = async () => {
    console.log("🔍 Fetching all public polls from blockchain...");
    try {
      const { contract, signerAddress } = await getContract(true);

      if (!contract) throw new Error("❌ Contract instance not found.");
      if (!signerAddress) throw new Error("❌ Wallet not connected. Please connect your wallet first.");

      console.log("🧩 Contract loaded:", contract.address);
      console.log("👤 User address:", signerAddress);

      const polls = await contract.getAllPublicPolls(signerAddress);
      console.log("✅ Fetched polls successfully!");
      console.log("📊 Poll Data:", polls);

      if (!polls || polls.length === 0) {
        console.warn("⚠️ No public polls found at this moment (might be expired or inactive).");
      }
    } catch (error) {
      console.error("❌ Failed to fetch public polls:", error);

      // Detailed error diagnostics
      if (error.reason) {
        console.error("🧠 Revert reason:", error.reason);
      }
      if (error.data) {
        console.error("📦 Error data:", error.data);
      }
      if (error.code) {
        console.error("⚙️ Error code:", error.code);
      }

      alert(`⚠️ Unable to fetch public polls:\n\n${error.message || "Unknown error"}\n\nCheck console for details.`);
    }
  };

  const addOption = () => {
    if (formData.options.length < 10)
      setFormData({ ...formData, options: [...formData.options, ""] });
  };

  const removeOption = (index) => {
    if (formData.options.length > 2)
      setFormData({
        ...formData,
        options: formData.options.filter((_, i) => i !== index),
      });
  };

  const updateOption = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files?.[0] || null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Please connect your wallet and authenticate first.");
      }

      const endMs = new Date(formData.endTime).getTime();
      if (isNaN(endMs) || endMs <= Date.now()) {
        throw new Error("End time must be in the future");
      }

      const fd = new FormData();
      fd.append("question", formData.question);
      fd.append("description", formData.description || "");
      fd.append("options", JSON.stringify(formData.options));

      const nowMs = Date.now();
      fd.append("startTime", nowMs.toString());
      fd.append("endTime", endMs.toString());
      fd.append("visibility", formData.isPublic ? "Public" : "Private");
      fd.append("votingMode", formData.type === "standard" ? "Standard" : "Anonymous");

      if (formData.image) {
        fd.append("image0", formData.image);
      }

      console.log("📝 Creating poll with data:", {
        question: formData.question,
        options: formData.options,
        visibility: formData.isPublic ? "Public" : "Private",
        votingMode: formData.type === "standard" ? "Standard" : "Anonymous",
      });

      console.log("⏳ Step 1: Creating poll in backend...");
      const backendRes = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL || BACKEND_URL}/api/poll/v1/createPoll`,
        fd,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const backendData = backendRes.data;

      if (!backendData.success) {
        const msg = backendData?.message || backendData?.error || "Backend createPoll failed";
        throw new Error(msg);
      }

      const pollFromBackend = backendData.poll;
      if (!pollFromBackend || !pollFromBackend.pollId) {
        throw new Error("Backend did not return pollId");
      }

      const pollId = pollFromBackend.pollId;
      console.log("✅ Step 1 Complete: Poll created in backend with ID:", pollId);

      console.log("⏳ Step 2: Creating poll on blockchain...");

      try {
        const { contract } = await getContract(true);

        const startTimestamp = Math.floor(Date.now() / 1000) + 60;
        const endTimestamp = Math.floor(endMs / 1000);

        if (endTimestamp <= startTimestamp) {
          throw new Error("End time must be at least 1 minute in the future");
        }

        const visibilityEnum = formData.isPublic ? 0 : 1;

        console.log("📊 Blockchain transaction details:", {
          pollId,
          question: formData.question,
          optionsCount: formData.options.length,
          visibility: visibilityEnum === 0 ? "Public" : "Private",
          startTimestamp: new Date(startTimestamp * 1000).toLocaleString(),
          endTimestamp: new Date(endTimestamp * 1000).toLocaleString(),
        });

        const tx = await contract.createPoll(
          pollId,
          formData.question,
          formData.options,
          visibilityEnum,
          startTimestamp,
          endTimestamp
        );

        console.log("⏳ Transaction sent, waiting for confirmation...");
        console.log("📝 Transaction hash:", tx.hash);

        const receipt = await tx.wait();

        console.log("✅ Step 2 Complete: Poll created on blockchain!");
        console.log("📝 Block number:", receipt.blockNumber);
        console.log("⛽ Gas used:", receipt.gasUsed.toString());

        alert("🎉 Poll successfully created on both backend and blockchain!");
      } catch (blockchainError) {
        console.error("❌ Step 2 Failed: Blockchain error:", blockchainError);

        let errorMsg = blockchainError?.message || blockchainError?.toString() || "Unknown blockchain error";

        if (errorMsg.includes("user rejected")) {
          errorMsg = "Transaction cancelled by user";
        } else if (errorMsg.includes("insufficient funds")) {
          errorMsg = "Insufficient funds for gas fees";
        } else if (errorMsg.includes("Start time must be in future")) {
          errorMsg = "Start time must be in the future (blockchain time)";
        } else if (errorMsg.includes("Poll already exist")) {
          errorMsg = "A poll with this ID already exists on the blockchain";
        }

        alert(
          `⚠️ Poll created in backend but blockchain creation failed:\n\n${errorMsg}\n\n` +
            `The poll exists in the database but won't appear on the blockchain. ` +
            `You can try again or contact support.`
        );

        navigate("/my-polls");
      }
    } catch (err) {
      console.error("❌ Poll creation failed:", err);

      let errorMessage = "Unknown error occurred";

      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || err.response?.data?.error || err.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      alert("❌ Failed to create poll:\n\n" + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      <main className="pt-20 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <Breadcrumb />

          <div className="text-center mb-12" data-scroll-fade>
            <h1 className="text-4xl font-light text-white mb-4">
              <span className="font-medium italic instrument">Create</span> New Poll
            </h1>
            <p className="text-white/70 text-sm max-w-2xl mx-auto">
              Design your poll with custom options and privacy settings
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Question */}
            <div className="bg-white/5 rounded-lg p-6">
              <label className="block text-white font-medium mb-4">Poll Question *</label>
              <input
                type="text"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="What would you like to ask?"
                className="w-full px-4 py-3 bg-white/10 text-white rounded-lg border border-white/20 focus:border-white/40 focus:outline-none"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Description */}
            <div className="bg-white/5 rounded-lg p-6">
              <label className="block text-white font-medium mb-4">Description (Optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add context..."
                rows={4}
                className="w-full px-4 py-3 bg-white/10 text-white rounded-lg border border-white/20 focus:border-white/40 focus:outline-none"
                disabled={isSubmitting}
              />
            </div>

            {/* Options */}
            <div className="bg-white/5 rounded-lg p-6">
              <div className="flex justify-between mb-4">
                <label className="text-white font-medium">Options *</label>
                <span className="text-white/50 text-xs">{formData.options.length}/10 options</span>
              </div>
              <div className="space-y-3">
                {formData.options.map((option, i) => (
                  <div key={i} className="flex gap-3">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(i, e.target.value)}
                      placeholder={`Option ${i + 1}`}
                      className="flex-1 px-4 py-3 bg-white/10 text-white rounded-lg border border-white/20 focus:border-white/40 focus:outline-none"
                      required
                      disabled={isSubmitting}
                    />
                    {formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(i)}
                        className="px-3 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-200"
                        disabled={isSubmitting}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {formData.options.length < 10 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-4 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all duration-200 text-sm"
                  disabled={isSubmitting}
                >
                  + Add Option
                </button>
              )}
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-lg p-6">
                <label className="block text-white font-medium mb-4">End Time *</label>
                <input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 text-white rounded-lg border border-white/20 focus:border-white/40"
                  required
                  disabled={isSubmitting}
                  min={new Date(Date.now() + 60000).toISOString().slice(0, 16)} // At least 1 minute in future
                />
                <p className="text-white/50 text-xs mt-2">Must be at least 1 minute in the future</p>
              </div>

              <div className="bg-white/5 rounded-lg p-6">
                <label className="block text-white font-medium mb-4">Privacy Setting</label>
                <select
                  value={formData.isPublic ? "public" : "private"}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.value === "public" })}
                  className="w-full px-4 py-3 bg-white/10 text-white rounded-lg border border-white/20"
                  disabled={isSubmitting}
                >
                  <option value="public">Public - Anyone can vote</option>
                  <option value="private">Private - With poll ID</option>
                </select>
              </div>

              <div className="bg-white/5 rounded-lg p-6">
                <label className="block text-white font-medium mb-4">Poll Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 text-white rounded-lg border border-white/20"
                  disabled={isSubmitting}
                >
                  <option value="standard">Standard (Normal Voting)</option>
                  <option value="anonymous">Anonymous (ZK Proof)</option>
                </select>
              </div>
            </div>

            {/* Image upload */}
            <div className="bg-white/5 rounded-lg p-6">
              <label className="block text-white font-medium mb-4">Poll Image *</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isSubmitting}
                required
                className="text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white file:text-black hover:file:bg-white/90"
              />
              {formData.image && (
                <p className="text-green-400 mt-2 text-sm flex items-center gap-2">
                  ✓ Selected: {formData.image.name}
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-4 justify-center pt-8">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-8 py-3 bg-white/10 text-white rounded-full font-medium hover:bg-white/20 transition-all duration-200"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-all duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Creating Poll...</span>
                  </>
                ) : (
                  "Create Poll"
                )}
              </button>
            </div>

            {/* ✅ ADDED BUTTON BELOW CREATE POLL */}
            <div className="flex justify-center mt-6">
              <button
                type="button"
                onClick={handleFetchAllPolls}
                className="px-6 py-3 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-all duration-200"
              >
                🔍 Get All Public Polls
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
