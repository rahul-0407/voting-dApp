"use client"

import { useState, useEffect } from "react"

export default function ErrorBoundary({ children, fallback }) {
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const handleError = (error) => {
      console.error("Error caught by boundary:", error)
      setHasError(true)
    }

    window.addEventListener("error", handleError)
    window.addEventListener("unhandledrejection", handleError)

    return () => {
      window.removeEventListener("error", handleError)
      window.removeEventListener("unhandledrejection", handleError)
    }
  }, [])

  if (hasError) {
    return (
      fallback || (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
              <span className="text-4xl">⚠️</span>
            </div>
            <h2 className="text-white font-medium mb-2">Something went wrong</h2>
            <p className="text-white/60 text-sm mb-6">Please refresh the page and try again</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-white text-black rounded-full font-medium text-sm hover:bg-white/90 transition-all duration-200"
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    )
  }

  return children
}
