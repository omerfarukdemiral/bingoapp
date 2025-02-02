export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  role: 'user' | 'admin'
  isActive: boolean
  totalPoints: number
  completedEvents: number
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile {
  id: string
  userId: string
  bio?: string
  avatar?: string
  location?: string
  website?: string
  social?: {
    twitter?: string
    github?: string
    linkedin?: string
  }
  createdAt: string
  updatedAt: string
}

export interface UserStats {
  totalEvents: number
  completedEvents: number
  totalPoints: number
  bingoCount: number
  averageCompletionTime: number // dakika cinsinden
  fastestCompletion: number // dakika cinsinden
}

// Yeni kullanıcı oluşturma için tip
export type NewUser = Omit<User, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string
  createdAt?: Date
  updatedAt?: Date
} 