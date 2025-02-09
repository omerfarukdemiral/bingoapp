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
      console.log('Yüklenen etkinlikler:', events)
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
    <div className="container max-w-4xl py-6 sm:py-10 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Etkinlikler</h1>
        {user && (
          <Link href="/events/create">
            <Button className="w-full sm:w-auto">
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
        <div className="grid gap-4 sm:gap-6">
          {events.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="card-hover bg-gradient-to-br from-purple-50 via-white to-green-50">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div>
                        <CardTitle className="text-lg sm:text-xl text-secondary">
                          {event.name}
                        </CardTitle>
                        <CardDescription className="mt-2 text-sm">
                          {event.description}
                        </CardDescription>
                        <div className="mt-2 flex items-center gap-2">
                          {event.creator ? (
                            <>
                              <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                                {event.creator.avatarUrl ? (
                                  <AvatarImage
                                    src={event.creator.avatarUrl}
                                    alt={event.creator.name}
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <AvatarFallback className="text-[10px] sm:text-xs">
                                    {event.creator.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div className="min-w-0">
                                <p className="text-xs sm:text-sm font-medium truncate">
                                  {event.creator.name}
                                </p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                                  {event.creator.email}
                                </p>
                              </div>
                            </>
                          ) : (
                            <div className="text-xs sm:text-sm text-muted-foreground">
                              Oluşturan bilgisi bulunamadı
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2 w-full sm:w-auto">
                        <div className="text-xs sm:text-sm text-primary">
                          {format(event.startDate, 'dd MMMM yyyy HH:mm', { locale: tr })}
                        </div>
                        {event.createdBy === user?.id && (
                          <div className="flex gap-2 ml-auto sm:ml-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault()
                                router.push(`/events/${event.id}/edit`)
                              }}
                            >
                              <Icons.settings className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={async (e) => {
                                e.preventDefault()
                                if (window.confirm('Bu etkinliği silmek istediğinize emin misiniz?')) {
                                  try {
                                    await eventService.removeEvent(event.id, user.id)
                                    toast.success('Etkinlik başarıyla silindi')
                                    loadEvents()
                                  } catch (error) {
                                    toast.error('Etkinlik silinirken bir hata oluştu')
                                  }
                                }
                              }}
                            >
                              <Icons.trash className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm text-muted-foreground">
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