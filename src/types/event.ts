export interface Question {
  id: string
  text: string
  createdAt: string
  updatedAt: string
}

export interface BingoCard {
  id: string
  eventId: string
  questions: Question[]
  completedQuestions: string[]
  createdAt: string
  updatedAt: string
}

export interface EventDateCheck {
  isStarted: boolean
  message?: string
}

export interface Event {
  id: string
  name: string
  description: string
  currentParticipants: number
  maxParticipants: number
  isTimeboxed: boolean
  duration?: number
  createdBy: string
  startDate: Date
  createdAt: Date
  updatedAt: Date
  status: 'active' | 'completed' | 'cancelled'
}

export interface EventParticipant {
  id: string
  eventId: string
  userId: string
  cardId: string
  points: number
  completedAt?: string
  createdAt: string
  updatedAt: string
} 