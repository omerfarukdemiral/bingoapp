'use client'

import { useAuth } from '@/context/auth.context'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { redirect } from 'next/navigation'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return null
  }

  if (!user) {
    redirect('/login')
  }

  return <DashboardLayout>{children}</DashboardLayout>
} 