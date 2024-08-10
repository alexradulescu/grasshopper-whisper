import './globals.css'

import type { Metadata } from 'next'
import { Noto_Sans } from 'next/font/google'

const notoSans = Noto_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BullsAI ChatGPT',
  description: 'BullsAI ChatGPT'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-color-mode="dark">
      <body className={notoSans.className}>{children}</body>
    </html>
  )
}
