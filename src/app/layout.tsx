import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { Providers } from './providers'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'IceBreaker Bingo',
  description: 'Networking etkinlikleri için eğlenceli bir bingo oyunu',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background`}>
        <Providers>
          <DashboardLayout>
            {children}
          </DashboardLayout>
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  )
} 