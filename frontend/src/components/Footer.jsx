"use client"

import {Link} from "react-router-dom"

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 py-16 px-6" data-scroll-fade>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-lg">V</span>
              </div>
              <span className="text-white font-semibold text-xl">VoteChain</span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed max-w-md mb-6">
              The future of democratic decision-making. Create, participate, and track polls with complete transparency,
              security, and real-time results.
            </p>
            <div className="flex space-x-4">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-200 cursor-pointer">
                <span className="text-white text-xs">𝕏</span>
              </div>
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-200 cursor-pointer">
                <span className="text-white text-xs">in</span>
              </div>
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-200 cursor-pointer">
                <span className="text-white text-xs">gh</span>
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-white font-medium mb-6">Platform</h4>
            <div className="space-y-3">
              <Link href="/polls" className="block text-white/60 hover:text-white text-sm transition-colors">
                Browse Polls
              </Link>
              <Link href="/create-poll" className="block text-white/60 hover:text-white text-sm transition-colors">
                Create Poll
              </Link>
              <Link href="/my-polls" className="block text-white/60 hover:text-white text-sm transition-colors">
                My Polls
              </Link>
              <Link href="/my-votes" className="block text-white/60 hover:text-white text-sm transition-colors">
                My Votes
              </Link>
              <Link href="/join-poll" className="block text-white/60 hover:text-white text-sm transition-colors">
                Join Poll
              </Link>
            </div>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="text-white font-medium mb-6">Support</h4>
            <div className="space-y-3">
              <Link href="#" className="block text-white/60 hover:text-white text-sm transition-colors">
                Help Center
              </Link>
              <Link href="#" className="block text-white/60 hover:text-white text-sm transition-colors">
                API Documentation
              </Link>
              <Link href="#" className="block text-white/60 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="block text-white/60 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="block text-white/60 hover:text-white text-sm transition-colors">
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-white/40 text-sm mb-4 md:mb-0">
              © 2025 VoteChain. All rights reserved. Built with modern web technologies.
            </p>
            <div className="flex items-center space-x-6">
              <span className="text-white/40 text-sm">Status: All systems operational</span>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
