'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@/types/user'
import { authService } from '@/services/auth.service'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const user = await authService.signIn(email, password)
      setUser(user)
      router.push('/')
    } catch (error) {
      console.error('Giriş hatası:', error)
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      const user = await authService.signInWithGoogle()
      setUser(user)
      router.push('/')
    } catch (error) {
      console.error('Google giriş hatası:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await authService.signOut()
      setUser(null)
      router.push('/login')
    } catch (error) {
      console.error('Çıkış hatası:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 