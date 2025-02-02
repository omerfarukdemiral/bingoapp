'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/auth.context'

export function MainNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  const routes = [
    {
      href: '/events',
      label: 'Etkinlikler',
      active: pathname === '/events',
    },
    {
      href: '/leaderboard',
      label: 'Sıralama',
      active: pathname === '/leaderboard',
    },
    ...(user?.role === 'admin'
      ? [
          {
            href: '/admin',
            label: 'Admin',
            active: pathname === '/admin',
          },
        ]
      : []),
  ]

  return (
    <nav className="flex items-center space-x-6 text-sm font-medium">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            'transition-colors hover:text-foreground/80',
            route.active ? 'text-foreground' : 'text-foreground/60'
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  )
} 