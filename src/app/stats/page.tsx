'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/icons'
import { eventService } from '@/services/event.service'
import type { Event, EventParticipant } from '@/types/event'

interface EventStats {
  id: string
  name: string
  totalParticipants: number
  completedBingos: number
  totalQuestions: number
  averageCompletionRate: number
}

export default function StatsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [eventStats, setEventStats] = useState<EventStats[]>([])

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Tüm aktif etkinlikleri getir
        const events = await eventService.getActiveEvents()
        
        // Her etkinlik için istatistikleri hesapla
        const stats = await Promise.all(
          events.map(async (event) => {
            const participants = await eventService.getEventParticipants(event.id)
            let completedBingos = 0
            let totalQuestions = 0
            
            // Her katılımcının kartını kontrol et
            for (const participant of participants) {
              const card = await eventService.getBingoCard(participant.cardId)
              if (card) {
                totalQuestions += card.completedQuestions.length
                if (checkBingo(card.completedQuestions.map(q => q.id), card.questions)) {
                  completedBingos++
                }
              }
            }

            const averageCompletionRate = participants.length > 0
              ? (totalQuestions / (participants.length * 25)) * 100 // 25 soru var her kartta
              : 0

            return {
              id: event.id,
              name: event.name,
              totalParticipants: participants.length,
              completedBingos,
              totalQuestions,
              averageCompletionRate,
            }
          })
        )

        setEventStats(stats)
      } catch (error) {
        setError('İstatistikler yüklenirken bir hata oluştu.')
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

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
          <CardTitle>Genel İstatistikler</CardTitle>
          <CardDescription>
            Tüm etkinliklerin genel istatistikleri
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Toplam Etkinlik
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{eventStats.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Toplam Katılımcı
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {eventStats.reduce((sum, stat) => sum + stat.totalParticipants, 0)}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Etkinlik İstatistikleri</CardTitle>
        </CardHeader>
        <CardContent>
          {eventStats.length === 0 ? (
            <div className="text-center text-muted-foreground py-4">
              Henüz hiç etkinlik yok.
            </div>
          ) : (
            <div className="grid gap-4">
              {eventStats.map((stat) => (
                <Card key={stat.id}>
                  <CardHeader>
                    <CardTitle>{stat.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">
                          Katılımcı Sayısı
                        </div>
                        <div className="text-xl font-bold">
                          {stat.totalParticipants}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">
                          Tamamlanan Bingolar
                        </div>
                        <div className="text-xl font-bold">
                          {stat.completedBingos}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">
                          Tamamlanan Sorular
                        </div>
                        <div className="text-xl font-bold">
                          {stat.totalQuestions}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">
                          Ortalama Tamamlanma
                        </div>
                        <div className="text-xl font-bold">
                          %{stat.averageCompletionRate.toFixed(1)}
                        </div>
                      </div>
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