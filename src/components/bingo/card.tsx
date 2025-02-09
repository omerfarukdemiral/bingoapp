'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Question, CompletedQuestion, BingoCardMatch } from '@/types/event'
import { Icons } from '@/components/icons'
import { QRDialog } from '@/components/qr/dialog'
import ReactConfetti from 'react-confetti'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface BingoCardProps {
  cardId: string
  userId: string
  questions: Question[]
  completedQuestions: CompletedQuestion[]
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
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false)
  const gridSize = 5 // 5x5 grid
  const hasBingo = checkBingo(completedQuestions, gridSize)

  // Bingo kontrolü
  function checkBingo(completed: CompletedQuestion[], size: number): boolean {
    const matrix = Array(size).fill(null).map(() => Array(size).fill(false))
    
    // Tamamlanan soruları matrise yerleştir
    completed.forEach(q => {
      const index = questions.findIndex(question => question.id === q.id)
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

  const handleQuestionClick = (question: Question) => {
    setSelectedQuestion(question)
    setIsQRDialogOpen(true)
  }

  return (
    <div className="relative">
      {showConfetti && <ReactConfetti />}
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="grid grid-cols-5 gap-2">
            {questions.map((question) => {
              const isCompleted = completedQuestions.some(q => q.id === question.id)
              return (
                <div
                  key={question.id}
                  className={cn(
                    "relative w-full aspect-square p-2 text-xs sm:text-sm md:text-base rounded-lg border transition-all",
                    isCompleted
                      ? "bg-primary text-primary-foreground border-primary"
                      : "hover:bg-accent hover:text-accent-foreground",
                    isInteractive && !loading && !isCompleted && "cursor-pointer"
                  )}
                  onClick={() => {
                    if (isInteractive && !loading && !isCompleted) {
                      handleQuestionClick(question)
                    }
                  }}
                >
                  {isCompleted && (
                    <div className="absolute top-1 left-1">
                      <Icons.check className="h-4 w-4" />
                    </div>
                  )}
                  <div className="flex flex-col h-full">
                    <div className="flex-1 flex items-center justify-center text-center">
                      {question.text}
                    </div>
                    {question.matches && question.matches.length > 0 && (
                      <div className="absolute bottom-1 right-1 flex flex-wrap justify-end gap-1">
                        {question.matches.map((match) => (
                          <TooltipProvider key={match.userId}>
                            <Tooltip>
                              <TooltipTrigger>
                                <Avatar className="h-6 w-6 border-2 border-background">
                                  {match.user.avatarUrl ? (
                                    <AvatarImage
                                      src={match.user.avatarUrl}
                                      alt={match.user.name}
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <AvatarFallback>
                                      {match.user.name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  )}
                                </Avatar>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{match.user.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {match.surveyAnswers.map(a => a.answer).join(', ')}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
      {selectedQuestion && (
        <QRDialog
          mode="generate"
          question={selectedQuestion}
          data={{
            cardId,
            questionId: selectedQuestion.id,
            userId,
            timestamp: Date.now()
          }}
          onScan={onQuestionVerify}
          onComplete={onQuestionClick}
          open={isQRDialogOpen}
          onOpenChange={setIsQRDialogOpen}
        />
      )}
    </div>
  )
} 