'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/icons'
import { userService } from '@/services/user.service'
import { eventService } from '@/services/event.service'
import type { User } from '@/types/user'
import type { Event } from '@/types/event'

interface LeaderboardUser extends User {
  rank: number
  eventCount: number
  bingoCount: number
  completionRate: number
}

export default function LeaderboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        // Aktif etkinlikleri getir
        const activeEvents = await eventService.getActiveEvents()
        setEvents(activeEvents)

        // En yüksek puanlı kullanıcıları getir
        const topUsers = await userService.getTopUsers(10)
        
        // Her kullanıcı için detaylı istatistikleri hesapla
        const leaderboardUsers = await Promise.all(
          topUsers.map(async (user, index) => {
            const stats = await userService.getUserStats(user.id)
            return {
              ...user,
              rank: index + 1,
              eventCount: stats.totalEvents,
              bingoCount: stats.bingoCount,
              completionRate: stats.totalEvents > 0
                ? (stats.completedEvents / stats.totalEvents) * 100
                : 0,
            }
          })
        )

        setUsers(leaderboardUsers)
      } catch (error) {
        setError('Liderlik tablosu yüklenirken bir hata oluştu.')
      } finally {
        setLoading(false)
      }
    }

    loadLeaderboard()
  }, [])

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
          <CardTitle>Liderlik Tablosu</CardTitle>
          <CardDescription>
            En yüksek puanlı katılımcılar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                      {user.rank}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-sm font-medium">Etkinlikler</div>
                        <div className="text-2xl font-bold">{user.eventCount}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Bingolar</div>
                        <div className="text-2xl font-bold">{user.bingoCount}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Tamamlama</div>
                        <div className="text-2xl font-bold">
                          %{user.completionRate.toFixed(0)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Etkinlik Sıralamaları</CardTitle>
            <CardDescription>
              Her etkinlik için ayrı sıralamalar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.map((event) => (
                <Card key={event.id}>
                  <CardHeader>
                    <CardTitle>{event.name}</CardTitle>
                    <CardDescription>
                      {event.currentParticipants} Katılımcı
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      Yakında...
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 