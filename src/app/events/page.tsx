'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth.context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { eventService } from '@/services/event.service'
import type { Event } from '@/types/event'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

export default function EventsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<Event[]>([])

  const loadEvents = async () => {
    try {
      const events = await eventService.getActiveEvents()
      setEvents(events)
    } catch (error) {
      console.error('Etkinlik yükleme hatası:', error)
      setError('Etkinlikler yüklenirken bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  return (
    <div className="container max-w-7xl mx-auto py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-foreground">
            Etkinlikler
          </h1>
          <p className="text-lg text-muted-foreground">
            Aktif etkinliklere katılabilir veya yeni etkinlik oluşturabilirsiniz.
          </p>
        </div>
        {user && (
          <Button size="lg" asChild className="w-full sm:w-auto text-lg h-12">
            <Link href="/events/create">
              <Icons.plus className="mr-2 h-5 w-5" />
              Yeni Etkinlik
            </Link>
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Icons.spinner className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : error ? (
        <Card className="border-destructive">
          <CardContent className="py-12">
            <div className="text-center text-lg text-destructive">{error}</div>
          </CardContent>
        </Card>
      ) : events.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <Icons.calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">Henüz aktif etkinlik bulunmuyor</h3>
              <p className="text-muted-foreground text-lg mb-6">
                Yeni bir etkinlik oluşturarak başlayabilirsiniz.
              </p>
              {user && (
                <Button size="lg" asChild className="text-lg h-12">
                  <Link href="/events/create">
                    <Icons.plus className="mr-2 h-5 w-5" />
                    Yeni Etkinlik Oluştur
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2">
          {events.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="h-full"
              >
                <Card className="group h-full relative overflow-hidden bg-card hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-500" />
                  <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/5 rounded-full blur-3xl group-hover:bg-secondary/10 transition-all duration-500" />
                  
                  <CardHeader className="pb-4 relative">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1.5">
                          <CardTitle className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                            {event.name}
                          </CardTitle>
                          <CardDescription className="text-base line-clamp-2">
                            {event.description}
                          </CardDescription>
                        </div>
                        {event.creator && (
                          <Avatar className="h-12 w-12 ring-2 ring-background shadow-xl">
                            {event.creator.avatarUrl ? (
                              <AvatarImage
                                src={event.creator.avatarUrl}
                                alt={event.creator.name}
                                referrerPolicy="no-referrer"
                                className="object-cover"
                              />
                            ) : (
                              <AvatarFallback className="text-lg bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-medium">
                                {event.creator.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                        )}
                      </div>
                      {event.creator && (
                        <div className="flex flex-col text-sm">
                          <span className="font-medium text-foreground/90">{event.creator.name}</span>
                          <span className="text-muted-foreground truncate">{event.creator.email}</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="relative">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-6 text-base">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-full bg-primary/10 text-primary">
                            <Icons.users className="h-5 w-5" />
                          </div>
                          <span className="font-medium text-foreground">
                            {event.currentParticipants} / {event.maxParticipants}
                          </span>
                        </div>
                        {event.isTimeboxed && event.duration && (
                          <div className="flex items-center gap-2">
                            <div className="p-2 rounded-full bg-secondary/10 text-secondary-foreground">
                              <Icons.clock className="h-5 w-5" />
                            </div>
                            <span className="text-muted-foreground">{event.duration} dakika</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-base">
                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                          <Icons.calendar className="h-5 w-5" />
                        </div>
                        <span className="text-muted-foreground">
                          {format(event.startDate, 'dd MMMM yyyy HH:mm', { locale: tr })}
                        </span>
                      </div>
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