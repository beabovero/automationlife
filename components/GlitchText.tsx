'use client'
import { useEffect, useRef, useState } from 'react'

const GLITCH_CHARS = '!<>-_\\/[]{}—=+*^?#'

function scramble(text: string, progress: number): string {
  return text
    .split('')
    .map((char, i) => {
      if (char === ' ') return ' '
      if (i / text.length < progress) return char
      return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
    })
    .join('')
}

interface Props {
  text: string
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
  delay?: number
}

export default function GlitchText({ text, className = '', as: Tag = 'span', delay = 0 }: Props) {
  const [displayed, setDisplayed] = useState(() => scramble(text, 0))
  const frameRef = useRef<number>(0)
  const startRef = useRef<number>(0)

  useEffect(() => {
    const duration = 800
    let timer: ReturnType<typeof setTimeout>

    timer = setTimeout(() => {
      const animate = (ts: number) => {
        if (!startRef.current) startRef.current = ts
        const elapsed = ts - startRef.current
        const progress = Math.min(elapsed / duration, 1)
        setDisplayed(scramble(text, progress))
        if (progress < 1) {
          frameRef.current = requestAnimationFrame(animate)
        } else {
          setDisplayed(text)
        }
      }
      frameRef.current = requestAnimationFrame(animate)
    }, delay)

    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(frameRef.current)
    }
  }, [text, delay])

  return <Tag className={className}>{displayed}</Tag>
}
