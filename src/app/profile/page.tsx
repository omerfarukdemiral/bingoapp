'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/auth.context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/icons'
import { eventService } from '@/services/event.service'
import type { Event, EventParticipant } from '@/types/event'

interface UserStats {
  totalEvents: number
  completedBingos: number
  totalQuestions: number
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [participatedEvents, setParticipatedEvents] = useState<Event[]>([])
  const [stats, setStats] = useState<UserStats>({
    totalEvents: 0,
    completedBingos: 0,
    totalQuestions: 0,
  })

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return

      try {
        // Tüm aktif etkinlikleri getir
        const events = await eventService.getActiveEvents()
        
        // Her etkinlik için kullanıcının katılım durumunu kontrol et
        const userEvents: Event[] = []
        let totalQuestions = 0
        let completedBingos = 0

        for (const event of events) {
          const participants = await eventService.getEventParticipants(event.id)
          const participant = participants.find(p => p.userId === user.id)
          
          if (participant) {
            userEvents.push(event)
            const card = await eventService.getBingoCard(participant.cardId)
            if (card) {
              totalQuestions += card.completedQuestions.length
              // 5x5 kartta bingo olup olmadığını kontrol et
              const hasBingo = checkBingo(card.completedQuestions, card.questions)
              if (hasBingo) completedBingos++
            }
          }
        }

        setParticipatedEvents(userEvents)
        setStats({
          totalEvents: userEvents.length,
          completedBingos,
          totalQuestions,
        })
      } catch (error) {
        setError('Profil bilgileri yüklenirken bir hata oluştu.')
      } finally {
        setLoading(false)
      }
    }

    loadUserData()
  }, [user])

  // Bingo kontrolü
  function checkBingo(completed: string[], questions: { id: string }[]): boolean {
    const size = 5
    const matrix = Array(size).fill(null).map(() => Array(size).fill(false))
    
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

    // Çapraz kontrol
    if (matrix.every((row, i) => row[i])) return true
    if (matrix.every((row, i) => row[size - 1 - i])) return true

    return false
  }

  if (!user) {
    return (
      <div className="container max-w-4xl py-10">
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Profil bilgilerini görüntülemek için giriş yapmalısınız.
            </div>
          </CardContent>
        </Card>
      </div>
    )
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

  if (error) {
    return (
      <div className="container max-w-4xl py-10">
        <div className="text-center text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-10">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Profil</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Katıldığın Etkinlikler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEvents}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Tamamlanan Bingolar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedBingos}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Tamamlanan Sorular
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalQuestions}</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Katıldığın Etkinlikler</CardTitle>
        </CardHeader>
        <CardContent>
          {participatedEvents.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              Henüz hiçbir etkinliğe katılmadınız.
            </div>
          ) : (
            <div className="grid gap-4">
              {participatedEvents.map((event) => (
                <Card key={event.id}>
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 