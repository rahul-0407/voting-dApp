"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Header from "../components/Navbar"
import Breadcrumb from "../components/Breadcrumb"
import LoadingSpinner from "../components/LoadingSpinner"

export default function CreatePoll() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    question: "",
    description: "",
    options: ["", ""],
    endTime: "",
    isPublic: true,
    image: "",
  })

  const addOption = () => {
    if (formData.options.length < 10) {
      setFormData({
        ...formData,
        options: [...formData.options, ""],
      })
    }
  }

  const removeOption = (index) => {
    if (formData.options.length > 2) {
      setFormData({
        ...formData,
        options: formData.options.filter((_, i) => i !== index),
      })
    }
  }

  const updateOption = (index, value) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData({
      ...formData,
      options: newOptions,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      console.log("Creating poll:", formData)
      setIsSubmitting(false)
      navigate("/my-polls")
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <main className="pt-20 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          <Breadcrumb />

          {/* Page Header */}
          <div className="text-center mb-12" data-scroll-fade>
            <h1 className="text-4xl font-light text-white mb-4">
              <span className="font-medium italic instrument">Create</span> New Poll
            </h1>
            <p className="text-white/70 text-sm max-w-2xl mx-auto">Design your poll with custom options and settings</p>
          </div>

          {/* Create Poll Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Poll Question */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6" data-scroll-slide-left>
              <label className="block text-white font-medium mb-4">Poll Question *</label>
              <input
                type="text"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="What would you like to ask?"
                className="w-full px-4 py-3 bg-white/10 text-white placeholder-white/50 rounded-lg border border-white/20 focus:border-white/40 focus:outline-none transition-all duration-200"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Poll Description */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6" data-scroll-slide-right>
              <label className="block text-white font-medium mb-4">Description (Optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide additional context for your poll..."
                rows={4}
                className="w-full px-4 py-3 bg-white/10 text-white placeholder-white/50 rounded-lg border border-white/20 focus:border-white/40 focus:outline-none resize-none transition-all duration-200"
                disabled={isSubmitting}
              />
            </div>

            {/* Poll Options */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6" data-scroll-scale>
              <div className="flex items-center justify-between mb-4">
                <label className="text-white font-medium">Poll Options *</label>
                <span className="text-white/50 text-xs">{formData.options.length}/10 options</span>
              </div>

              <div className="space-y-3">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 px-4 py-3 bg-white/10 text-white placeholder-white/50 rounded-lg border border-white/20 focus:border-white/40 focus:outline-none transition-all duration-200"
                      required
                      disabled={isSubmitting}
                    />
                    {formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
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

            {/* Poll Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* End Time */}
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6" data-scroll-slide-left>
                <label className="block text-white font-medium mb-4">End Time *</label>
                <input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 text-white rounded-lg border border-white/20 focus:border-white/40 focus:outline-none transition-all duration-200"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Privacy Setting */}
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6" data-scroll-slide-right>
                <label className="block text-white font-medium mb-4">Privacy Setting</label>
                <select
                  value={formData.isPublic ? "public" : "private"}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.value === "public" })}
                  className="w-full px-4 py-3 bg-white/10 text-white rounded-lg border border-white/20 focus:border-white/40 focus:outline-none transition-all duration-200"
                  disabled={isSubmitting}
                >
                  <option value="public">Public - Anyone can vote</option>
                  <option value="private">Private - Only with poll ID</option>
                </select>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 justify-center pt-8" data-scroll-fade>
              <button
                type="button"
                onClick={() => navigate.back()}
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
          </form>
        </div>
      </main>
    </div>
  )
}
