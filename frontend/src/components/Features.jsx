"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"

export default function Features() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const features = [
    {
      icon: "🔒",
      title: "Secure Voting",
      description:
        "End-to-end encryption ensures your vote remains private and secure with advanced cryptographic protection",
    },
    {
      icon: "⚡",
      title: "Real-time Results",
      description: "Watch results update live as votes are cast across the platform with instant data synchronization",
    },
    {
      icon: "🌐",
      title: "Decentralized",
      description: "No single point of failure with distributed voting infrastructure ensuring maximum reliability",
    },
    {
      icon: "📊",
      title: "Advanced Analytics",
      description: "Comprehensive insights and detailed analytics help you understand voting patterns and trends",
    },
    {
      icon: "🎯",
      title: "Flexible Options",
      description: "Create polls with up to 10 options, custom end times, and public or private visibility settings",
    },
    {
      icon: "🚀",
      title: "Lightning Fast",
      description: "Optimized performance ensures quick loading times and smooth user experience across all devices",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
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
            <span className="font-medium italic instrument">Powerful</span> Features
          </h2>
          <p className="text-white/70 text-sm max-w-2xl mx-auto">
            Experience the next generation of digital voting with our comprehensive platform features
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white/5 backdrop-blur-sm rounded-lg p-6 hover:bg-white/10 transition-all duration-300 group border border-transparent hover:border-violet-500/20"
              variants={itemVariants}
            >
              <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center group-hover:from-violet-500/30 group-hover:to-purple-600/30 transition-all duration-300 border border-violet-500/10">
                <span className="text-2xl">{feature.icon}</span>
              </div>
              <h3 className="text-white font-medium mb-3 text-lg group-hover:text-violet-200 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
