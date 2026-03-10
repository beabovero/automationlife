import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VA Nightmare — Automation Platform',
  description: 'Agency-grade Bumble automation. Scale without limits.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="scanlines" />
        {children}
      </body>
    </html>
  )
}
