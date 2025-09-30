"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"

export default function HowItWorks() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const steps = [
    {
      step: "01",
      title: "Create Your Poll",
      description: "Design your poll with custom questions, options, and settings in minutes",
      icon: "📝",
    },
    {
      step: "02",
      title: "Share & Invite",
      description: "Share your poll publicly or privately with specific participants",
      icon: "📤",
    },
    {
      step: "03",
      title: "Collect Votes",
      description: "Watch real-time results as participants cast their secure votes",
      icon: "🗳️",
    },
    {
      step: "04",
      title: "Analyze Results",
      description: "Get detailed analytics and insights from your poll results",
      icon: "📊",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: "easeOut",
      },
    },
  }

  return (
    <section className="py-20 px-6 bg-black" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-4xl font-light text-white mb-4">
            <span className="font-medium italic instrument">How</span> It Works
          </h2>
          <p className="text-white/70 text-sm max-w-2xl mx-auto">Create and manage polls in four simple steps</p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {steps.map((step, index) => (
            <motion.div key={index} className="text-center group" variants={itemVariants}>
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-violet-500/20 to-purple-600/20 backdrop-blur-sm flex items-center justify-center group-hover:from-violet-500/30 group-hover:to-purple-600/30 transition-all duration-300 mb-4 border border-violet-500/10">
                  <span className="text-3xl">{step.icon}</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold shadow-lg">
                  {step.step}
                </div>
              </div>
              <h3 className="text-white font-medium mb-3 group-hover:text-violet-200 transition-colors duration-300">
                {step.title}
              </h3>
              <p className="text-white/60 text-xs leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
