"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"

export default function Testimonials() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Product Manager",
      company: "TechCorp",
      avatar: "/professional-woman-diverse.png",
      quote:
        "VoteChain has revolutionized how we make team decisions. The real-time results and analytics are incredible.",
    },
    {
      name: "Marcus Rodriguez",
      role: "Community Leader",
      company: "Local Government",
      avatar: "/professional-man.jpg",
      quote: "The transparency and security features give our community confidence in the democratic process.",
    },
    {
      name: "Emily Watson",
      role: "Event Organizer",
      company: "EventPro",
      avatar: "/professional-woman-organizer.png",
      quote: "Perfect for gathering feedback from attendees. The interface is intuitive and the results are instant.",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.7,
        ease: "easeOut",
      },
    },
  }

  return (
    <section className="py-20 px-6 bg-black border-t border-white/10" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-4xl font-light text-white mb-4">
            <span className="font-medium italic instrument">What</span> People Say
          </h2>
          <p className="text-white/70 text-sm max-w-2xl mx-auto">
            Hear from our community of users who trust VoteChain for their decision-making
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              className="bg-white/5 backdrop-blur-sm rounded-lg p-6 hover:bg-white/10 transition-all duration-300 border border-transparent hover:border-violet-500/20 relative overflow-hidden"
              variants={itemVariants}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4 border-2 border-violet-500/20"
                  />
                  <div>
                    <div className="text-white font-medium text-sm">{testimonial.name}</div>
                    <div className="text-violet-300/80 text-xs">{testimonial.role}</div>
                    <div className="text-white/40 text-xs">{testimonial.company}</div>
                  </div>
                </div>
                <p className="text-white/80 text-sm leading-relaxed italic">"{testimonial.quote}"</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
