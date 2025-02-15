'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/auth.context'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ModeToggle } from '@/components/mode-toggle'
import { cn } from '@/lib/utils'

const navItems = [
  {
    title: 'Ana Sayfa',
    href: '/',
    icon: Icons.home,
  },
  {
    title: 'Etkinlikler',
    href: '/events',
    icon: Icons.calendar,
  },
  {
    title: 'Etkinliklerim',
    href: '/my-events',
    icon: Icons.settings,
    requireAuth: true,
  },
  {
    title: 'Sıralama',
    href: '/leaderboard',
    icon: Icons.trophy,
  },
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  // Login ve register sayfalarında sidebar'ı gösterme
  if (pathname === '/login' || pathname === '/register') {
    return <div className="min-h-screen bg-background">{children}</div>
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 flex h-full w-96 flex-col border-r bg-card">
        {/* Logo */}
        <div className="flex h-24 items-center border-b px-8">
          <Link href="/" className="flex items-center gap-4">
            <Icons.logo className="h-12 w-12 text-primary" />
            <span className="font-semibold text-2xl">IceBreaker</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-3 p-8">
          {navItems.map((item) => {
            if (item.requireAuth && !user) return null
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 rounded-xl px-6 py-5 text-lg font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-[1.02]"
                )}
              >
                <item.icon className="h-6 w-6" />
                {item.title}
              </Link>
            )
          })}
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto space-y-6">
          {/* Theme Toggle */}
          <div className="border-t border-b py-6">
            <div className="px-8">
              <ModeToggle />
            </div>
          </div>

          {user ? (
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  {user.avatarUrl ? (
                    <AvatarImage
                      src={user.avatarUrl}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <AvatarFallback className="text-xl">
                      {user.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex flex-1 flex-col">
                  <span className="text-lg font-medium">{user.name}</span>
                  <span className="text-base text-muted-foreground truncate max-w-[200px]">
                    {user.email}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-4 rounded-lg px-4 py-3 text-base hover:bg-muted transition-colors"
                >
                  <Icons.user className="h-5 w-5" />
                  <span>Profil</span>
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-4 rounded-lg px-4 py-3 text-base hover:bg-muted transition-colors"
                >
                  <Icons.settings className="h-5 w-5" />
                  <span>Ayarlar</span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="flex w-full items-center gap-4 rounded-lg px-4 py-3 text-base text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
                >
                  <Icons.logout className="h-5 w-5" />
                  <span>Çıkış Yap</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8">
              <Button asChild variant="secondary" className="w-full text-lg py-6">
                <Link href="/login">Giriş Yap</Link>
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pl-96">
        <div className="relative min-h-screen">
          {/* Background Pattern */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
            <div className="absolute inset-0 bg-grid-white/10 bg-grid-16 [mask-image:radial-gradient(white,transparent_85%)]" />
          </div>

          {/* Content */}
          <div className="relative z-10">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
} 