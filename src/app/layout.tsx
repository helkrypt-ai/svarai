import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SvarAI — AI-chatbot for norske SMBer',
  description: 'Legg en AI-chatbot på nettsiden din på 5 minutter. SvarAI svarer kundehenvendelser automatisk, hele døgnet. Ingen koding nødvendig.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no" suppressHydrationWarning className="h-full">
      <body className={`${inter.className} h-full bg-gray-50`}>{children}</body>
    </html>
  )
}
