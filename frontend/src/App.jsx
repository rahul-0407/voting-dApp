"use client";

import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate,useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import AllPolls from "./pages/AllPolls";
import MyPolls from "./pages/MyPolls";
import MyVotes from "./pages/MyVotes";
import CreatePoll from "./pages/CreatePoll";
import Login from "./pages/Login";
import PollDetails from "./pages/PollDetail";
import PrivatePollDetail from "./pages/PrivatePollDetail";
import EnterPoll from "./pages/JoinPoll";
import Footer from "./components/Footer"
// import Demo from "./pages/Demo"
// import "./App.css"

function App() {
  const navigate = useNavigate();
  const location = useLocation();
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
  useEffect(() => {
    const savedAddress = localStorage.getItem("address");
    const savedUser = localStorage.getItem("userData");
    const savedToken = localStorage.getItem("authToken");

    const isLoggedIn = savedAddress && savedUser && savedToken;
    

    // ✅ If not logged in, restrict access except for "/" or "/login"
    if (!isLoggedIn && location.pathname !== "/" && location.pathname !== "/login") {
      navigate("/login", { replace: true });
    }

    // ✅ Optional: if logged in, prevent going back to /login
    if (isLoggedIn && location.pathname === "/login") {
      navigate("/", { replace: true });
    }
  }, [location.pathname, navigate]);

  const isLoginPage = location.pathname === "/login"

  return (
    <div className="App">
      {!isLoginPage && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/polls" element={<AllPolls />} />
        <Route path="/my-polls" element={<MyPolls />} />
        <Route path="/my-votes" element={<MyVotes />} />
        {/* <Route path="/demo" element={<Demo />} /> */}
        <Route path="/login" element={<Login />} />
        <Route path="/create-poll" element={<CreatePoll />} />
        {/* <Route path="/poll/:id" element={<PollDetails />} /> */}
        <Route path="/poll/:id" element={<PrivatePollDetail />} />
        <Route path="/private-poll/:id" element={<PrivatePollDetail />} />
        <Route path="/join-poll" element={<EnterPoll />} />
      </Routes>
      {!isLoginPage && <Footer />}
    </div>
  );
}

export default App;
