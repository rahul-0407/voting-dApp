"use client"

import { useState } from "react"
import { useLocation } from "react-router-dom"

export default function ShareModal({ poll, isOpen, onClose }) {
  const [copied, setCopied] = useState(false)
  const location = useLocation()

  if (!isOpen) return null

  const pollUrl = `${window.location.origin}${window.location.pathname}`


  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(pollUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Vote on: ${poll.title}`)
    const body = encodeURIComponent(`I'd like you to vote on this poll: ${poll.title}\n\n${pollUrl}`)
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const shareViaTwitter = () => {
    const text = encodeURIComponent(`Vote on: ${poll.title}`)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${pollUrl}`)
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black border border-white/20 rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-medium text-lg">Share Poll</h3>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-white/70 text-sm mb-2">Poll URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={pollUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-white/10 text-white text-sm rounded border border-white/20"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-white text-black text-sm rounded hover:bg-white/90 transition-all duration-200"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-white/70 text-sm mb-2">Share via</label>
            <div className="flex gap-2">
              <button
                onClick={shareViaEmail} disabled
                className="flex-1 px-4 py-2 bg-white/10 text-white text-sm rounded opacity-50 cursor-not-allowed"
              >
                Email
              </button>
              <button
                onClick={shareViaTwitter} disabled
                className="flex-1 px-4 py-2 bg-white/10 text-white text-sm rounded opacity-50 cursor-not-allowed"
              >
                Twitter
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <p className="text-white/60 text-xs">
              Poll ID: <span className="font-mono">{poll.pollId}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
