"use client"

import { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import Home from "./pages/Home"
import AllPolls from "./pages/AllPolls"
import MyPolls from "./pages/MyPolls"
import MyVotes from "./pages/MyVotes"
import CreatePoll from "./pages/CreatePoll"
import PollDetails from "./pages/PollDetail"
import EnterPoll from "./pages/JoinPoll"
// import "./App.css"

function App() {
  // useEffect(() => {
  //   // Initialize smooth scrolling
  //   const initSmoothScroll = () => {
  //     const links = document.querySelectorAll('a[href^="#"]')
  //     links.forEach((link) => {
  //       link.addEventListener("click", (e) => {
  //         e.preventDefault()
  //         const target = document.querySelector(link.getAttribute("href"))
  //         if (target) {
  //           target.scrollIntoView({
  //             behavior: "smooth",
  //             block: "start",
  //           })
  //         }
  //       })
  //     })
  //   }

  //   initSmoothScroll()

  //   // Add scroll animations
  //   const observerOptions = {
  //     threshold: 0.1,
  //     rootMargin: "0px 0px -50px 0px",
  //   }

  //   const observer = new IntersectionObserver((entries) => {
  //     entries.forEach((entry) => {
  //       if (entry.isIntersecting) {
  //         entry.target.classList.add("fade-in-up")
  //       }
  //     })
  //   }, observerOptions)

  //   // Observe elements for animation
  //   const animateElements = document.querySelectorAll(".card, .feature-item, .stat-item")
  //   animateElements.forEach((el) => observer.observe(el))

  //   return () => {
  //     observer.disconnect()
  //   }
  // }, [])

  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/polls" element={<AllPolls />} />
          <Route path="/my-polls" element={<MyPolls />} />
          <Route path="/my-votes" element={<MyVotes />} />
          <Route path="/create-poll" element={<CreatePoll />} />
          <Route path="/poll/:id" element={<PollDetails />} />
          <Route path="/join-poll" element={<EnterPoll />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
