"use client"

import { useState, useEffect } from "react"

let toastId = 0

export function useToast() {
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = "info", duration = 3000) => {
    const id = ++toastId
    const toast = { id, message, type, duration }

    setToasts((prev) => [...prev, toast])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)

    return id
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return { toasts, addToast, removeToast }
}

export default function ToastContainer({ toasts, removeToast }) {
  if (!toasts.length) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

function Toast({ toast, onRemove }) {
  const typeStyles = {
    success: "bg-green-500/20 border-green-500/30 text-green-400",
    error: "bg-red-500/20 border-red-500/30 text-red-400",
    warning: "bg-yellow-500/20 border-yellow-500/30 text-yellow-400",
    info: "bg-blue-500/20 border-blue-500/30 text-blue-400",
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id)
    }, toast.duration)

    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onRemove])

  return (
    <div
      className={`px-4 py-3 rounded-lg border backdrop-blur-sm ${typeStyles[toast.type]} animate-in slide-in-from-right duration-300`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm">{toast.message}</span>
        <button onClick={() => onRemove(toast.id)} className="ml-4 text-current hover:opacity-70 transition-opacity">
          ✕
        </button>
      </div>
    </div>
  )
}
