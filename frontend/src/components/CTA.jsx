"use client"

import {Link} from "react-router-dom"
import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"

export default function CTA() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="py-20 px-6 bg-black" ref={ref}>
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 border border-white/10 relative overflow-hidden"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.95 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-purple-600/10 opacity-50" />
          <div className="relative z-10">
            <motion.h2
              className="text-4xl md:text-5xl font-light text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              <span className="font-medium italic instrument">Ready</span> to Start
              <br />
              <span className="font-light">Voting?</span>
            </motion.h2>
            <motion.p
              className="text-white/70 text-sm mb-8 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              Join thousands of users who trust VoteChain for secure, transparent, and efficient democratic
              decision-making. Create your first poll in minutes.
            </motion.p>

            <motion.div
              className="flex items-center justify-center gap-4 flex-wrap"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            >
              <Link href="/create-poll">
                <button className="px-8 py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-full font-medium text-sm hover:from-violet-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-violet-500/25">
                  Create Your First Poll
                </button>
              </Link>
              <Link href="/polls">
                <button className="px-8 py-4 bg-transparent border border-violet-500/50 text-white font-medium text-sm rounded-full hover:bg-violet-500/10 hover:border-violet-400 transition-all duration-200">
                  Browse Existing Polls
                </button>
              </Link>
            </motion.div>

            <motion.div
              className="mt-8 pt-8 border-t border-white/10"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
            >
              <p className="text-white/50 text-xs">No credit card required • Free to start • Secure & Private</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
