'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/icons'
import type { Event } from '@/types/event'

interface EventJoinFormProps {
  event: Event
  onSubmit: (answers: { questionId: string; answer: string | string[] }[]) => Promise<void>
  loading?: boolean
}

export function EventJoinForm({ event, onSubmit, loading }: EventJoinFormProps) {
  const [answers, setAnswers] = useState<{ [key: string]: string | string[] }>({})
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Tüm soruların cevaplanıp cevaplanmadığını kontrol et
    const unansweredQuestions = event.surveyQuestions.filter(
      question => !answers[question.id]
    )

    if (unansweredQuestions.length > 0) {
      setError('Lütfen tüm soruları cevaplayınız.')
      return
    }

    try {
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }))
      await onSubmit(formattedAnswers)
    } catch (error) {
      setError('Form gönderilirken bir hata oluştu.')
    }
  }

  const handleSingleChoiceChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const handleMultipleChoiceChange = (questionId: string, value: string, checked: boolean) => {
    setAnswers(prev => {
      const currentAnswers = (prev[questionId] as string[]) || []
      if (checked) {
        return {
          ...prev,
          [questionId]: [...currentAnswers, value],
        }
      } else {
        return {
          ...prev,
          [questionId]: currentAnswers.filter(answer => answer !== value),
        }
      }
    })
  }

  if (event.currentParticipants >= event.maxParticipants) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <p className="text-muted-foreground">
              Üzgünüz, bu etkinlik için katılımcı limiti dolmuştur.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Etkinliğe Katılım Formu</CardTitle>
          <CardDescription>
            Lütfen aşağıdaki soruları cevaplayarak etkinliğe katılın.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {event.surveyQuestions.map(question => (
            <div key={question.id} className="space-y-3">
              <Label>{question.text}</Label>
              {question.type === 'single' ? (
                <RadioGroup
                  value={answers[question.id] as string}
                  onValueChange={value => handleSingleChoiceChange(question.id, value)}
                >
                  {question.options.map(option => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                      <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              ) : (
                <div className="space-y-2">
                  {question.options.map(option => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${question.id}-${option}`}
                        checked={(answers[question.id] as string[] || []).includes(option)}
                        onCheckedChange={checked =>
                          handleMultipleChoiceChange(question.id, option, checked as boolean)
                        }
                      />
                      <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Katılınıyor...
              </>
            ) : (
              'Etkinliğe Katıl'
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
} 