"use client"

import { useEffect } from "react"

export default function ScrollAnimations({ children }) {
  useEffect(() => {
    const initScrollAnimations = async () => {
      const { gsap } = await import("gsap")
      const { ScrollTrigger } = await import("gsap/ScrollTrigger")

      gsap.registerPlugin(ScrollTrigger)

      const waitForLocomotiveScroll = () => {
        return new Promise((resolve) => {
          const checkForScroller = () => {
            const scrollContainer = document.querySelector("[data-scroll-container]")
            if (scrollContainer) {
              resolve(scrollContainer)
            } else {
              setTimeout(checkForScroller, 100)
            }
          }
          checkForScroller()
        })
      }

      const scrollContainer = await waitForLocomotiveScroll()

      const scrollerConfig = {
        scroller: scrollContainer,
      }

      // Fade in animations
      gsap.utils.toArray("[data-scroll-fade]").forEach((element) => {
        gsap.fromTo(
          element,
          {
            opacity: 0,
            y: 50,
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              ...scrollerConfig,
              trigger: element,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse",
            },
          },
        )
      })

      // Slide in from left
      gsap.utils.toArray("[data-scroll-slide-left]").forEach((element) => {
        gsap.fromTo(
          element,
          {
            opacity: 0,
            x: -100,
          },
          {
            opacity: 1,
            x: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              ...scrollerConfig,
              trigger: element,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse",
            },
          },
        )
      })

      // Slide in from right
      gsap.utils.toArray("[data-scroll-slide-right]").forEach((element) => {
        gsap.fromTo(
          element,
          {
            opacity: 0,
            x: 100,
          },
          {
            opacity: 1,
            x: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              ...scrollerConfig,
              trigger: element,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse",
            },
          },
        )
      })

      // Scale animations
      gsap.utils.toArray("[data-scroll-scale]").forEach((element) => {
        gsap.fromTo(
          element,
          {
            opacity: 0,
            scale: 0.8,
          },
          {
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              ...scrollerConfig,
              trigger: element,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse",
            },
          },
        )
      })

      // Stagger animations for grids
      gsap.utils.toArray("[data-scroll-stagger]").forEach((container) => {
        const items = container.querySelectorAll("[data-scroll-stagger-item]")
        gsap.fromTo(
          items,
          {
            opacity: 0,
            y: 30,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            stagger: 0.1,
            scrollTrigger: {
              ...scrollerConfig,
              trigger: container,
              start: "top 80%",
              end: "bottom 20%",
              toggleActions: "play none none reverse",
            },
          },
        )
      })

      // Parallax effect for hero elements
      gsap.utils.toArray("[data-scroll-parallax]").forEach((element) => {
        const speed = element.dataset.scrollSpeed || 0.5
        gsap.to(element, {
          yPercent: -50 * speed,
          ease: "none",
          scrollTrigger: {
            ...scrollerConfig,
            trigger: element,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        })
      })
    }

    const timer = setTimeout(() => {
      initScrollAnimations()
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  return <>{children}</>
}
