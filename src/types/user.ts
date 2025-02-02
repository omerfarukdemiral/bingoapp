export interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
  isActive: boolean
  totalPoints: number
  completedEvents: number
  createdAt: string
  updatedAt: string
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