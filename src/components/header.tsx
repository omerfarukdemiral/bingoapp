'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/auth.context'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { motion } from 'framer-motion'

const navItems = [
  { href: '/', label: 'Ana Sayfa', icon: Icons.home },
  { href: '/events', label: 'Etkinlikler', icon: Icons.calendar },
  { href: '/leaderboard', label: 'Sıralama', icon: Icons.trophy },
]

export function Header() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <Icons.logo className="h-6 w-6 text-[#845EC2]" />
            <span className="font-bold text-gray-800">IceBreaker Bingo</span>
          </Link>

          <nav className="flex items-center space-x-4 lg:space-x-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link group flex items-center space-x-2 ${
                    isActive ? 'text-[#845EC2] font-medium' : ''
                  }`}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <item.icon className="h-4 w-4" />
                  </motion.div>
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-0 h-0.5 w-full bg-[#845EC2]"
                      layoutId="navbar-indicator"
                    />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full hover:bg-gray-100"
                >
                  <Avatar className="h-10 w-10">
                    {user.avatarUrl ? (
                      <AvatarImage
                        src={user.avatarUrl}
                        alt={user.name}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <AvatarFallback className="bg-[#845EC2]/10 text-[#845EC2]">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center cursor-pointer">
                    <Icons.user className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center cursor-pointer">
                    <Icons.settings className="mr-2 h-4 w-4" />
                    <span>Ayarlar</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <Icons.logout className="mr-2 h-4 w-4" />
                  <span>Çıkış Yap</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="secondary">
              <Link href="/login">Giriş Yap</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
} 