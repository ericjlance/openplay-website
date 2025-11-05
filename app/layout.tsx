import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'OpenPlay Pickleball Directory',
  description: 'Find open play / drop-in pickleball near you.',
  metadataBase: new URL('https://example.com')
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
