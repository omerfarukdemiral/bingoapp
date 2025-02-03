'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/auth.context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { eventService } from '@/services/event.service'
import type { Event } from '@/types/event'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { motion } from 'framer-motion'

export default function EventsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<Event[]>([])

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const events = await eventService.getActiveEvents()
        console.log('Yüklenen etkinlikler:', events)
        setEvents(events)
      } catch (error) {
        console.error('Etkinlik yükleme hatası:', error)
        setError('Etkinlikler yüklenirken bir hata oluştu.')
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [])

  return (
    <div className="container max-w-4xl py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Etkinlikler</h1>
        {user && (
          <Link href="/events/create">
            <Button>
              <Icons.plus className="mr-2 h-4 w-4" />
              Yeni Etkinlik
            </Button>
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center">
          <Icons.spinner className="h-8 w-8 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Henüz aktif etkinlik bulunmuyor.
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {events.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="card-hover bg-gradient-to-br from-purple-50 via-white to-green-50">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl text-secondary">
                          {event.name}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {event.description}
                        </CardDescription>
                      </div>
                      <div className="text-sm text-primary">
                        {format(event.startDate, 'dd MMMM yyyy HH:mm', { locale: tr })}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Icons.users className="h-4 w-4 text-primary" />
                        <span>
                          {event.currentParticipants} / {event.maxParticipants} Katılımcı
                        </span>
                      </div>
                      {event.isTimeboxed && event.duration && (
                        <div className="flex items-center gap-2">
                          <Icons.clock className="h-4 w-4 text-secondary" />
                          <span>Süre: {event.duration} dakika</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
} 