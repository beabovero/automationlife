'use client'
import { useEffect, useState } from 'react'

const STEPS = [
  { stage: 1, label: 'Initializing cloud phone...',       color: '#00d4ff' },
  { stage: 2, label: 'Configuring Geelark profile...',    color: '#00d4ff' },
  { stage: 3, label: 'Launching Bumble app...',            color: '#00e5c8' },
  { stage: 3, label: 'Entering phone number...',           color: '#00e5c8' },
  { stage: 3, label: 'Verifying SMS code...',              color: '#a855f7' },
  { stage: 4, label: 'Uploading profile photos...',        color: '#00e5c8' },
  { stage: 4, label: 'Setting profile name...',            color: '#00e5c8' },
  { stage: 5, label: 'Answering profile questions...',     color: '#00e5c8' },
  { stage: 5, label: 'Setting location preferences...',    color: '#00e5c8' },
  { stage: 6, label: 'Verifying account creation...',      color: '#a855f7' },
  { stage: 6, label: 'Account created successfully!',      color: '#00e5c8' },
]

export default function SimulationPanel() {
  const [activeStep, setActiveStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  useEffect(() => {
    let step = 0
    const next = () => {
      if (step >= STEPS.length) {
        // reset
        setActiveStep(0)
        setCompletedSteps([])
        step = 0
        setTimeout(next, 1500)
        return
      }
      setActiveStep(step)
      const current = step
      setTimeout(() => {
        setCompletedSteps(prev => [...prev, current])
        step++
        setTimeout(next, 600)
      }, 1200)
    }
    const t = setTimeout(next, 800)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="glass-card rounded-xl p-6 font-mono">
      <div className="mb-4 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[#00e5c8] animate-pulse" />
        <span className="text-xs tracking-widest text-[#00e5c8] uppercase">Live Simulation</span>
        <span className="ml-auto text-[10px] text-[rgba(0,229,200,0.4)]">DEMO MODE</span>
      </div>

      <div className="space-y-2">
        {STEPS.map((s, i) => {
          const done = completedSteps.includes(i)
          const active = activeStep === i && !done
          return (
            <div
              key={i}
              className={`flex items-center gap-3 rounded px-3 py-2 transition-all duration-300 ${
                active ? 'bg-[rgba(0,229,200,0.06)] border border-[rgba(0,229,200,0.15)]' : 'border border-transparent'
              } ${done ? 'opacity-50' : i > activeStep ? 'opacity-20' : ''}`}
            >
              <span className="text-xs" style={{ color: done ? '#00e5c8' : active ? s.color : 'rgba(224,224,224,0.3)' }}>
                {done ? '✓' : active ? '▶' : '○'}
              </span>
              <span className="text-xs" style={{ color: done ? 'rgba(0,229,200,0.6)' : active ? s.color : 'rgba(224,224,224,0.3)' }}>
                {s.label}
              </span>
              {active && (
                <span className="ml-auto flex gap-1">
                  {[0, 1, 2].map(d => (
                    <span
                      key={d}
                      className="h-1 w-1 rounded-full bg-[#00e5c8]"
                      style={{ animation: `blink 1s step-end ${d * 0.3}s infinite` }}
                    />
                  ))}
                </span>
              )}
              <span className="ml-auto text-[10px] text-[rgba(0,229,200,0.3)]">
                S{s.stage}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-4 rounded border border-[rgba(0,229,200,0.1)] bg-[rgba(0,0,0,0.4)] px-4 py-2 text-center">
        <span className="text-xs tracking-widest text-[rgba(0,229,200,0.5)]">
          Add credits to run real automations
        </span>
      </div>
    </div>
  )
}
