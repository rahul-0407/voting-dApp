"use client";

import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const location = useLocation();

  const navItems = [
    { name: "All Polls", path: "/polls" },
    { name: "My Polls", path: "/my-polls" },
    { name: "My Votes", path: "/my-votes" },
    { name: "Join Poll", path: "/join-poll" },
  ];

  return (
    <header className="fixed w-full z-20 flex items-center justify-between p-6 ">
      {/* Logo */}
      <Link to="/" className="flex items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-sm">V</span>
          </div>
          <span className="text-white font-semibold text-lg">VoteChain</span>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex items-center space-x-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`text-xs font-light px-3 py-2 rounded-full transition-all duration-200 ${
              location.pathname === item.path
                ? "bg-purple-600 text-white"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      {/* Login Button Group with Arrow */}
      <div
        id="gooey-btn"
        className="relative flex items-center group"
        style={{ filter: "url(#gooey-filter)" }}
      >
        <button className="absolute right-0 px-2.5 py-2 rounded-full bg-white text-black font-normal text-xs transition-all duration-300 hover:bg-white/90 cursor-pointer h-8 flex items-center justify-center -translate-x-10 group-hover:-translate-x-19 z-0">
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 17L17 7M17 7H7M17 7V17"
            />
          </svg>
        </button>
        <Link
          to="/login"
          className="px-6 py-2 rounded-full bg-white text-black font-normal text-xs transition-all duration-300 hover:bg-white/90 cursor-pointer h-8 flex items-center z-10"
        >
          Login
        </Link>
      </div>
    </header>
  );
}