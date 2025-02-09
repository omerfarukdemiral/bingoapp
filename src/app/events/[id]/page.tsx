'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth.context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { BingoCard } from '@/components/bingo/card'
import { EventJoinForm } from '@/components/event-join-form'
import { eventService } from '@/services/event.service'
import { userService } from '@/services/user.service'
import type { Event, BingoCard as BingoCardType, EventParticipant } from '@/types/event'
import type { User } from '@/types/user'
import { toast } from 'sonner'
import { EventParticipantsList } from '@/components/event-participants-list'

export default function EventPage() {
  const params = useParams()
  const eventId = params?.id as string
  const router = useRouter()
  const { user } = useAuth()
  const [event, setEvent] = useState<Event | null>(null)
  const [bingoCard, setBingoCard] = useState<BingoCardType | null>(null)
  const [participants, setParticipants] = useState<(EventParticipant & { user: User })[]>([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!eventId) return
    
    const init = async () => {
      setLoading(true)
      await Promise.all([loadEvent(), loadParticipants()])
      setLoading(false)
    }

    init()
  }, [eventId, user?.id])

  const loadEvent = async () => {
    try {
      const eventData = await eventService.getEvent(eventId)
      if (!eventData) {
        setError('Etkinlik bulunamadı')
        return
      }
      setEvent(eventData)

      if (user) {
        const participants = await eventService.getEventParticipants(eventId)
        const participant = participants.find(p => p.userId === user.id)
        if (participant) {
          try {
            const card = await eventService.getBingoCard(participant.cardId)
            if (card) {
              setBingoCard(card)
              console.log('Bingo kartı yüklendi:', card)
            } else {
              throw new Error('Kart bulunamadı')
            }
          } catch (error) {
            console.error('Bingo kartı yükleme hatası:', error)
            setError('Bingo kartı yüklenemedi')
          }
        }
      }
    } catch (error) {
      console.error('Etkinlik yükleme hatası:', error)
      setError('Etkinlik yüklenirken bir hata oluştu')
    }
  }

  const loadParticipants = async () => {
    if (!eventId) return
    try {
      const eventParticipants = await eventService.getEventParticipants(eventId)
      const participantsWithUser = await Promise.all(
        eventParticipants.map(async (participant) => {
          const user = await userService.getUser(participant.userId)
          if (!user) throw new Error('Kullanıcı bulunamadı')
          return {
            ...participant,
            user
          }
        })
      )
      setParticipants(participantsWithUser)
    } catch (error) {
      console.error('Katılımcılar yüklenirken hata:', error)
    }
  }

  const handleJoin = async (surveyAnswers: { questionId: string; answer: string | string[] }[]) => {
    if (!user || !event) return
    setJoining(true)
    setError(null)

    try {
      const cardId = await eventService.joinEvent(eventId, user.id, surveyAnswers)
      console.log('Etkinliğe katılım başarılı, kart ID:', cardId)
      
      // Kartı yüklemeyi birkaç kez deneyelim
      let retryCount = 0
      const maxRetries = 3
      let card = null

      while (retryCount < maxRetries && !card) {
        try {
          card = await eventService.getBingoCard(cardId)
          if (card) {
            setBingoCard(card)
            console.log('Bingo kartı başarıyla yüklendi')
            break
          }
        } catch (error) {
          console.error(`Bingo kartı yükleme denemesi ${retryCount + 1} başarısız:`, error)
          retryCount++
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000)) // 1 saniye bekle
          }
        }
      }

      await loadParticipants()
      
      if (!card) {
        toast.error('Bingo kartı yüklenemedi, lütfen sayfayı yenileyin')
      } else {
        toast.success('Etkinliğe başarıyla katıldınız!')
      }
    } catch (error) {
      console.error('Etkinliğe katılma hatası:', error)
      toast.error('Etkinliğe katılırken bir hata oluştu')
    } finally {
      setJoining(false)
    }
  }

  const handleQuestionComplete = async (questionId: string) => {
    if (!user || !bingoCard) return
    setCompleting(true)

    try {
      await eventService.completeQuestion(bingoCard.id, questionId, user.id, user.id)
      await loadEvent()
      toast.success('Görev tamamlandı!')
    } catch (error) {
      toast.error('Görev tamamlanırken bir hata oluştu')
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
    if (!user) return
    setCompleting(true)
    console.log('QR Doğrulama başladı:', data)

    try {
      const isValid = await eventService.verifyQRCode({
        ...data,
        verifiedByUserId: user.id
      })
      console.log('QR Kod geçerli mi:', isValid)
      
      if (!isValid) {
        toast.error('Geçersiz QR kod')
        return
      }

      await eventService.completeQuestion(data.cardId, data.questionId, data.userId, user.id)
      console.log('Görev tamamlama başarılı')
      
      // Kartı direkt olarak yükleyelim
      const updatedCard = await eventService.getBingoCard(data.cardId)
      console.log('Güncel kart durumu:', updatedCard)
      if (updatedCard) {
        setBingoCard(updatedCard)
      }
      
      await loadEvent()
      toast.success('Görev doğrulandı!')
    } catch (error) {
      console.error('Görev doğrulama hatası:', error)
      toast.error('Görev doğrulanırken bir hata oluştu')
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <div className="container max-w-4xl py-6 sm:py-10 px-4 sm:px-6">
        <div className="flex items-center justify-center">
          <div className="animate-pulse text-lg">Yükleniyor...</div>
        </div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="container max-w-4xl py-6 sm:py-10 px-4 sm:px-6">
        <div className="text-center text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-6 sm:py-10 px-4 sm:px-6 space-y-6 sm:space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">{event.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm sm:text-base">{event.description}</p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Icons.users className="h-4 w-4 text-primary" />
              <span>
                {event.currentParticipants} / {event.maxParticipants} Katılımcı
              </span>
            </div>
            {event.isTimeboxed && (
              <div className="flex items-center gap-2">
                <Icons.clock className="h-4 w-4 text-secondary" />
                <span>Süre: {event.duration} dakika</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {user ? (
        bingoCard ? (
          <>
            {!loading && (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="min-w-[320px] px-4 sm:px-0">
                  <BingoCard
                    cardId={bingoCard.id}
                    userId={user.id}
                    questions={bingoCard.questions}
                    completedQuestions={bingoCard.completedQuestions}
                    onQuestionClick={handleQuestionComplete}
                    onQuestionVerify={handleQuestionVerify}
                    loading={completing}
                  />
                </div>
              </div>
            )}
            <EventParticipantsList
              eventId={eventId}
              participants={participants}
              isAdmin={event.adminId === user.id}
              onParticipantRemove={loadParticipants}
            />
          </>
        ) : (
          <>
            {participants.some(p => p.userId === user.id) ? (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center text-muted-foreground text-sm sm:text-base">
                    Bingo kartınız hazırlanıyor...
                  </div>
                </CardContent>
              </Card>
            ) : (
              <EventJoinForm
                event={event}
                onSubmit={handleJoin}
                loading={joining}
              />
            )}
          </>
        )
      ) : (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground text-sm sm:text-base">
              Etkinliğe katılmak için giriş yapmalısınız.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 