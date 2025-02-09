import type { SurveyQuestion, BingoTask } from '@/config/templates'
import type { User } from './user'
import { Timestamp } from 'firebase/firestore'

export interface CompletedQuestion {
  id: string
  completedBy: string
  completedAt: Date
  verifiedBy: string
}

export interface Question {
  id: string
  text: string
  category: string
  points: number
  matches: BingoCardMatch[]
  createdAt: string
  updatedAt: string
}

export interface BingoCardMatch {
  userId: string
  user: {
    name: string
    email: string
    avatarUrl?: string
  }
  surveyAnswers: {
    questionId: string
    answer: string | string[]
  }[]
  matchedAt: Date
}

export interface BingoCard {
  id: string
  eventId: string
  questions: Question[]
  completedQuestions: CompletedQuestion[]
  createdAt: Date
  updatedAt: Date
}

export interface EventDateCheck {
  isStarted: boolean
  message?: string
}

export interface Event {
  id: string
  name: string
  description: string
  maxParticipants: number
  currentParticipants: number
  startDate: Date
  isTimeboxed: boolean
  duration?: number
  status: 'active' | 'completed' | 'cancelled'
  createdBy: string
  adminId: string
  createdAt: Date
  updatedAt: Date
  templateId: string
  surveyQuestions: SurveyQuestion[]
  bingoTasks: BingoTask[]
  creator?: {
    name: string
    email: string
    avatarUrl?: string
  } | null
}

export interface EventParticipant {
  id: string
  eventId: string
  userId: string
  cardId: string
  points: number
  surveyAnswers: {
    questionId: string
    answer: string | string[]
  }[]
  createdAt: Date
  updatedAt: Date
} 