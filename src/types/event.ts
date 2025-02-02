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

export interface Event {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  location: string
  createdBy: string
  currentParticipants: number
  participantLimit: number
  isActive: boolean
  createdAt: string
  updatedAt: string
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