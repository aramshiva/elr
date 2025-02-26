"use client"

import type React from "react"
import { useEffect, useRef } from "react"

interface Star {
  x: number
  y: number
  brightness: number
  twinkleSpeed: number
  opacity: number
  fadingOut: boolean
  newX?: number
  newY?: number
}

const StarrySky: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const animationFrameRef = useRef<number>()
  const lastUpdateTimeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const createStars = () => {
      const stars: Star[] = []
      const starCount = Math.floor((canvas.width * canvas.height) / 2000)
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          brightness: Math.random() * Math.PI * 2, // Random start phase
          twinkleSpeed: 0.0005 + Math.random() * 0.001, // Much slower twinkle speed
          opacity: 1,
          fadingOut: false,
        })
      }
      starsRef.current = stars
    }

    const drawBackground = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, "black")
      gradient.addColorStop(1, "#000033")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    const drawStars = () => {
      starsRef.current.forEach((star) => {
        const twinkle = (Math.sin(star.brightness) + 1) / 2
        const alpha = twinkle * star.opacity * 0.8 + 0.2
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
        ctx.fillRect(star.x, star.y, 1, 1)
        star.brightness += star.twinkleSpeed

        if (star.fadingOut) {
          star.opacity -= 0.06
          if (star.opacity <= 0) {
            star.opacity = 0
            star.fadingOut = false
            star.x = star.newX!
            star.y = star.newY!
          }
        } else if (star.opacity < 1) {
          star.opacity += 0.06 
          if (star.opacity >= 1) {
            star.opacity = 1
          }
        }
      })
    }

    const updateStars = () => {
      starsRef.current.forEach((star) => {
        if (Math.random() < 0.2) {
          star.fadingOut = true
          star.newX = Math.random() * canvas.width
          star.newY = Math.random() * canvas.height
        }
      })
    }

    const animate = (currentTime: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drawBackground()
      drawStars()

      if (currentTime - lastUpdateTimeRef.current >= 2500) {
        updateStars()
        lastUpdateTimeRef.current = currentTime
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    resizeCanvas()
    createStars()
    lastUpdateTimeRef.current = performance.now()
    animate(performance.now())

    window.addEventListener("resize", resizeCanvas)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0" />
}

export default StarrySky

