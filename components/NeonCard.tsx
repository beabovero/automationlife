import { type ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  color?: 'green' | 'cyan' | 'purple'
  glow?: boolean
}

export default function NeonCard({ children, className = '', color = 'green', glow = false }: Props) {
  const borderClass = {
    green:  glow ? 'neon-border  animate-pulse-green' : 'glass-card',
    cyan:   glow ? 'neon-border-cyan' : 'glass-card',
    purple: glow ? 'neon-border-purple' : 'glass-card',
  }[color]

  return (
    <div className={`rounded-lg p-6 ${borderClass} ${className}`}>
      {children}
    </div>
  )
}
