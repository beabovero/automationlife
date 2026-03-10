'use client'
import { useEffect, useState } from 'react'

const SEQUENCE = [
  { delay: 0,    type: 'cmd',     text: 'va-nightmare --run-job JOB_7f3a9c' },
  { delay: 600,  type: 'info',    text: '→ Claiming job from queue...' },
  { delay: 1100, type: 'success', text: '✓ Job claimed. 3 accounts queued.' },
  { delay: 1700, type: 'cmd',     text: 'geelark create-phone --region US' },
  { delay: 2300, type: 'success', text: '✓ Phone provisioned  envId=a8f3c1' },
  { delay: 2900, type: 'info',    text: '→ Starting session...' },
  { delay: 3600, type: 'success', text: '✓ Remote session live' },
  { delay: 4100, type: 'cmd',     text: 'upload-photos --count 4' },
  { delay: 4700, type: 'success', text: '✓ 4/4 photos delivered to phone' },
  { delay: 5200, type: 'info',    text: '→ Stage 3: Phone verification' },
  { delay: 5900, type: 'info',    text: '  pvapins → +1 (347) 555-0192' },
  { delay: 6800, type: 'info',    text: '  SMS received → code: 482917' },
  { delay: 7500, type: 'success', text: '✓ Verified. Moving to profile...' },
  { delay: 8200, type: 'info',    text: '→ Stage 4: Profile setup' },
  { delay: 9100, type: 'info',    text: '  Uploading photos to Bumble...' },
  { delay: 9900, type: 'success', text: '✓ Stage 4 complete' },
  { delay: 10400,type: 'info',    text: '→ Stage 5: Questions + preferences' },
  { delay: 11200,type: 'success', text: '✓ Stage 5 complete' },
  { delay: 11700,type: 'info',    text: '→ Stage 6: AI confirmation' },
  { delay: 12500,type: 'success', text: '✓ ACCOUNT LIVE — credit charged' },
  { delay: 13200,type: 'divider', text: '' },
  { delay: 13400,type: 'stat',    text: '  Account 1/3 completed  ████████ 33%' },
]

const COLORS: Record<string, string> = {
  cmd:     '#e0e0e0',
  info:    'rgba(0,212,255,0.8)',
  success: '#00e5c8',
  divider: 'rgba(0,229,200,0.15)',
  stat:    'rgba(168,85,247,0.9)',
}

export default function TerminalWindow() {
  const [visible, setVisible] = useState<number[]>([])

  useEffect(() => {
    const timers = SEQUENCE.map((item, i) =>
      setTimeout(() => setVisible(v => [...v, i]), item.delay),
    )
    // Loop
    const reset = setTimeout(() => setVisible([]), 15000)
    return () => { timers.forEach(clearTimeout); clearTimeout(reset) }
  }, [])

  // Re-trigger loop
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setTick(x => x + 1), 15500)
    return () => clearTimeout(t)
  }, [tick])

  return (
    <div style={{
      background: 'rgba(0,0,0,0.85)',
      border: '1px solid rgba(0,229,200,0.2)',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 0 0 1px rgba(0,229,200,0.05), 0 40px 80px rgba(0,0,0,0.8), 0 0 60px rgba(0,229,200,0.05)',
      backdropFilter: 'blur(20px)',
      fontFamily: '"JetBrains Mono", monospace',
    }}>
      {/* Title bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '12px 16px',
        borderBottom: '1px solid rgba(0,229,200,0.1)',
        background: 'rgba(0,229,200,0.03)',
      }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['#ff5f57','#febc2e','#28c840'].map(c => (
            <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.8 }} />
          ))}
        </div>
        <span style={{ flex: 1, textAlign: 'center', fontSize: '11px', color: 'rgba(224,224,224,0.35)', letterSpacing: '0.05em' }}>
          va-nightmare — automation
        </span>
      </div>

      {/* Terminal body */}
      <div style={{ padding: '20px', minHeight: '340px', maxHeight: '340px', overflowY: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span style={{ fontSize: '10px', color: 'rgba(0,229,200,0.4)', letterSpacing: '0.15em' }}>OPERATOR@VA-NIGHTMARE</span>
          <span style={{ fontSize: '10px', color: 'rgba(0,229,200,0.2)' }}>~</span>
          <span style={{ width: '6px', height: '13px', background: '#00e5c8', display: 'inline-block', animation: 'blink 1s step-end infinite' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {SEQUENCE.map((item, i) => {
            if (!visible.includes(i)) return null
            if (item.type === 'divider') {
              return <div key={i} style={{ height: '1px', background: COLORS.divider, margin: '4px 0' }} />
            }
            return (
              <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', animation: 'slide-up 0.2s ease forwards' }}>
                {item.type === 'cmd' && (
                  <span style={{ color: 'rgba(0,229,200,0.5)', fontSize: '12px', userSelect: 'none', flexShrink: 0 }}>❯</span>
                )}
                <span style={{
                  fontSize: '12px',
                  letterSpacing: item.type === 'cmd' ? '0.02em' : '0',
                  fontWeight: item.type === 'success' ? '600' : '400',
                  paddingLeft: item.type !== 'cmd' ? '16px' : '0',
                  ...(item.type === 'success'
                    ? { background: 'linear-gradient(135deg, #00b8d9, #00e5c8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }
                    : { color: COLORS[item.type] || '#e0e0e0' }
                  ),
                }}>
                  {item.text}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
