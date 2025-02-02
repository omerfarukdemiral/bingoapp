'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Question } from '@/types/event'
import { Icons } from '@/components/icons'
import { QRDialog } from '@/components/qr/dialog'
import ReactConfetti from 'react-confetti'

interface BingoCardProps {
  cardId: string
  userId: string
  questions: Question[]
  completedQuestions: string[]
  onQuestionClick?: (questionId: string) => void
  onQuestionVerify?: (data: {
    cardId: string
    questionId: string
    userId: string
    timestamp: number
  }) => void
  isInteractive?: boolean
  loading?: boolean
}

export function BingoCard({
  cardId,
  userId,
  questions,
  completedQuestions,
  onQuestionClick,
  onQuestionVerify,
  isInteractive = true,
  loading = false,
}: BingoCardProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null)
  const gridSize = 5 // 5x5 grid
  const hasBingo = checkBingo(completedQuestions, gridSize)

  // Bingo kontrolü
  function checkBingo(completed: string[], size: number): boolean {
    const matrix = Array(size).fill(null).map(() => Array(size).fill(false))
    
    // Tamamlanan soruları matrise yerleştir
    completed.forEach(id => {
      const index = questions.findIndex(q => q.id === id)
      if (index !== -1) {
        const row = Math.floor(index / size)
        const col = index % size
        matrix[row][col] = true
      }
    })

    // Yatay kontrol
    for (let row = 0; row < size; row++) {
      if (matrix[row].every(cell => cell)) return true
    }

    // Dikey kontrol
    for (let col = 0; col < size; col++) {
      if (matrix.every(row => row[col])) return true
    }

    // Çapraz kontrol (sol üstten sağ alta)
    if (matrix.every((row, i) => row[i])) return true

    // Çapraz kontrol (sağ üstten sol alta)
    if (matrix.every((row, i) => row[size - 1 - i])) return true

    return false
  }

  // Bingo olduğunda confetti göster
  if (hasBingo && !showConfetti) {
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 5000)
  }

  const handleQuestionClick = (questionId: string) => {
    setSelectedQuestion(questionId)
    onQuestionClick?.(questionId)
  }

  const handleQuestionVerify = (data: {
    cardId: string
    questionId: string
    userId: string
    timestamp: number
  }) => {
    onQuestionVerify?.(data)
    setSelectedQuestion(null)
  }

  return (
    <div className="relative">
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={200} />}
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="grid grid-cols-5 gap-2">
            {questions.map((question, index) => {
              const isCompleted = completedQuestions.includes(question.id)
              const isSelected = selectedQuestion === question.id
              return (
                <div key={question.id} className="relative">
                  <button
                    onClick={() => isInteractive && handleQuestionClick(question.id)}
                    disabled={!isInteractive || loading}
                    className={cn(
                      "w-full aspect-square p-2 text-xs sm:text-sm md:text-base rounded-lg border transition-all duration-200",
                      "hover:border-primary hover:shadow-md",
                      "flex items-center justify-center text-center",
                      isCompleted && "bg-primary text-primary-foreground border-primary",
                      !isInteractive && "cursor-default",
                      loading && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {loading ? (
                      <Icons.spinner className="h-4 w-4 animate-spin" />
                    ) : (
                      question.text
                    )}
                  </button>
                  {isSelected && (
                    <div className="absolute top-full left-0 mt-2 w-full z-10 flex gap-2">
                      <QRDialog
                        mode="generate"
                        data={{
                          cardId,
                          questionId: question.id,
                          userId,
                          timestamp: Date.now(),
                        }}
                      />
                      <QRDialog
                        mode="scan"
                        onScan={handleQuestionVerify}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 