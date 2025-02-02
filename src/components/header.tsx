'use client'

import Link from 'next/link'
import { MainNav } from '@/components/main-nav'
import { useAuth } from '@/context/auth.context'
import { Button } from '@/components/ui/button'

export function Header() {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="font-bold">IceBreaker Bingo</span>
        </Link>
        <MainNav />
        <div className="flex flex-1 items-center justify-end space-x-4">
          {user ? (
            <Link href="/profile">
              <Button variant="ghost" size="sm">
                Profil
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Giriş Yap
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
} 