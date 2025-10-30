"use client";

import { useState } from "react";

export default function VotingInterface({ poll, onVote }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (selectedOption === null) return;

    setIsSubmitting(true);
    // Simulate API call delay
    setTimeout(() => {
      onVote(selectedOption);
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8">
      <h2 className="text-white font-medium text-xl mb-6">Cast Your Vote</h2>

      <div className="space-y-4 mb-8">
        {poll.options.map((option, index) => (
          <div
            key={index}
            onClick={() => setSelectedOption(index)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
              selectedOption === index
                ? "border-white bg-white/10"
                : "border-white/20 hover:border-white/40 hover:bg-white/5"
            }`}
          >
            <div className="flex items-center">
              <div
                className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                  selectedOption === index ? "border-white bg-white" : "border-white/40"
                }`}
              >
                {selectedOption === index && (
                  <div className="w-2 h-2 bg-black rounded-full" />
                )}
              </div>
              <span className="text-white font-medium">
                {typeof option === "string" ? option : option.text || `Option ${index + 1}`}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleSubmit}
          disabled={selectedOption === null || isSubmitting}
          className="flex-1 px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting Vote..." : "Submit Vote"}
        </button>
      </div>

      <div className="mt-6 p-4 bg-white/5 rounded-lg">
        <p className="text-white/70 text-xs">
          Your vote is anonymous and cannot be changed once submitted. Make sure you've selected the option you prefer.
        </p>
      </div>
    </div>
  );
}
