'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth.context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { BingoCard } from '@/components/bingo/card'
import { eventService } from '@/services/event.service'
import type { Event, BingoCard as BingoCardType } from '@/types/event'

interface EventPageProps {
  params: {
    id: string
  }
}

export default function EventPage({ params }: EventPageProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [event, setEvent] = useState<Event | null>(null)
  const [bingoCard, setBingoCard] = useState<BingoCardType | null>(null)

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const event = await eventService.getEvent(params.id)
        if (!event) {
          router.push('/events')
          return
        }
        setEvent(event)

        // Kullanıcının kartını bul
        if (user) {
          const participants = await eventService.getEventParticipants(event.id)
          const participant = participants.find(p => p.userId === user.id)
          if (participant) {
            const card = await eventService.getBingoCard(participant.cardId)
            setBingoCard(card)
          }
        }
      } catch (error) {
        setError('Etkinlik yüklenirken bir hata oluştu.')
      } finally {
        setLoading(false)
      }
    }

    loadEvent()
  }, [params.id, user, router])

  const handleJoin = async () => {
    if (!user || !event) return

    try {
      setJoining(true)
      const cardId = await eventService.joinEvent(event.id, user.id)
      const card = await eventService.getBingoCard(cardId)
      setBingoCard(card)
    } catch (error) {
      setError('Etkinliğe katılırken bir hata oluştu.')
    } finally {
      setJoining(false)
    }
  }

  const handleQuestionComplete = async (questionId: string) => {
    if (!bingoCard) return

    try {
      setCompleting(true)
      await eventService.completeQuestion(bingoCard.id, questionId)
      setBingoCard({
        ...bingoCard,
        completedQuestions: [...bingoCard.completedQuestions, questionId],
      })
    } catch (error) {
      setError('Soru tamamlanırken bir hata oluştu.')
    } finally {
      setCompleting(false)
    }
  }

  const handleQuestionVerify = async (data: {
    cardId: string
    questionId: string
    userId: string
    timestamp: number
  }) => {
    if (!bingoCard) return

    try {
      setCompleting(true)
      // QR kodun geçerliliğini kontrol et
      const isValid = await eventService.verifyQRCode(data)
      if (isValid) {
        await eventService.completeQuestion(bingoCard.id, data.questionId)
        setBingoCard({
          ...bingoCard,
          completedQuestions: [...bingoCard.completedQuestions, data.questionId],
        })
      } else {
        setError('Geçersiz QR kod.')
      }
    } catch (error) {
      setError('QR kod doğrulanırken bir hata oluştu.')
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <div className="container max-w-4xl py-10">
        <div className="flex items-center justify-center">
          <Icons.spinner className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="container max-w-4xl py-10">
        <div className="text-center text-red-500">
          {error || 'Etkinlik bulunamadı.'}
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-10">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{event.name}</CardTitle>
          <CardDescription>{event.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              {event.currentParticipants} / {event.maxParticipants} Katılımcı
            </div>
            {event.isTimeboxed && (
              <div>
                Süre: {event.duration} dakika
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {user ? (
        bingoCard ? (
          <BingoCard
            cardId={bingoCard.id}
            userId={user.id}
            questions={bingoCard.questions}
            completedQuestions={bingoCard.completedQuestions}
            onQuestionClick={handleQuestionComplete}
            onQuestionVerify={handleQuestionVerify}
            loading={completing}
          />
        ) : (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <p className="mb-4 text-muted-foreground">
                  Bu etkinliğe henüz katılmadınız.
                </p>
                <Button
                  onClick={handleJoin}
                  disabled={joining || event.currentParticipants >= event.maxParticipants}
                >
                  {joining ? (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {event.currentParticipants >= event.maxParticipants
                    ? 'Etkinlik Dolu'
                    : 'Etkinliğe Katıl'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      ) : (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="mb-4 text-muted-foreground">
                Etkinliğe katılmak için giriş yapmalısınız.
              </p>
              <Button onClick={() => router.push('/login')}>
                Giriş Yap
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 