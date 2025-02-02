'use client'

import { useEffect } from 'react'
import { useAuth } from '@/context/auth.context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Icons } from '@/components/icons'

interface AdminLayoutProps {
  children: React.ReactNode
}

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: Icons.home,
  },
  {
    title: 'Etkinlikler',
    href: '/admin/events',
    icon: Icons.calendar,
  },
  {
    title: 'Kullanıcılar',
    href: '/admin/users',
    icon: Icons.users,
  },
  {
    title: 'Raporlar',
    href: '/admin/reports',
    icon: Icons.barChart,
  },
  {
    title: 'Ayarlar',
    href: '/admin/settings',
    icon: Icons.settings,
  },
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Yetki kontrolü
    if (user && user.role !== 'admin') {
      router.push('/')
      return
    }
  }, [user, router])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-muted/30 border-r">
        <div className="p-6">
          <h2 className="text-lg font-semibold">Admin Paneli</h2>
        </div>
        <nav className="space-y-1 px-3">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  pathname === item.href
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  )
} 