import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SvarAI — AI-drevet e-postsvar for norske SMBer',
  description: 'La AI svare på e-postene dine automatisk. SvarAI hjelper norske bedrifter spare tid og forbedre kundeservice.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no" suppressHydrationWarning className="h-full">
      <body className={`${inter.className} h-full bg-gray-50`}>{children}</body>
    </html>
  )
}
