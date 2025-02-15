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

export default function MyEventsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<Event[]>([])

  const loadEvents = async () => {
    try {
      const allEvents = await eventService.getActiveEvents()
      // Sadece kullanıcının oluşturduğu veya yönetici olduğu etkinlikleri filtrele
      const userEvents = allEvents.filter(event => 
        event.createdBy === user?.id || event.adminId === user?.id
      )
      setEvents(userEvents)
    } catch (error) {
      console.error('Etkinlik yükleme hatası:', error)
      setError('Etkinlikler yüklenirken bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      loadEvents()
    }
  }, [user])

  return (
    <div className="container max-w-7xl mx-auto py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Etkinliklerim
          </h1>
          <p className="text-lg text-muted-foreground">
            Oluşturduğunuz ve yönettiğiniz etkinlikler
          </p>
        </div>
        <Button size="lg" asChild className="w-full sm:w-auto text-lg h-12">
          <Link href="/events/create">
            <Icons.plus className="mr-2 h-5 w-5" />
            Yeni Etkinlik
          </Link>
        </Button>
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
              <h3 className="text-xl font-medium mb-2">Henüz etkinliğiniz bulunmuyor</h3>
              <p className="text-muted-foreground text-lg mb-6">
                Yeni bir etkinlik oluşturarak başlayabilirsiniz.
              </p>
              <Button size="lg" asChild className="text-lg h-12">
                <Link href="/events/create">
                  <Icons.plus className="mr-2 h-5 w-5" />
                  Yeni Etkinlik Oluştur
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {events.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="group h-full bg-gradient-to-br from-card via-background to-card hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <CardHeader className="pb-4">
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
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4 text-base">
                        <div className="flex items-center gap-2 text-primary">
                          <Icons.users className="h-5 w-5" />
                          <span className="font-medium">
                            {event.currentParticipants} / {event.maxParticipants}
                          </span>
                        </div>
                        {event.isTimeboxed && event.duration && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Icons.clock className="h-5 w-5" />
                            <span>{event.duration} dakika</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-base text-muted-foreground">
                        <Icons.calendar className="h-5 w-5 text-primary" />
                        <span>
                          {format(event.startDate, 'dd MMMM yyyy HH:mm', { locale: tr })}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="lg"
                          className="flex-1 text-base"
                          onClick={(e) => {
                            e.preventDefault()
                            router.push(`/events/${event.id}/edit`)
                          }}
                        >
                          <Icons.settings className="mr-2 h-5 w-5" />
                          Düzenle
                        </Button>
                        <Button
                          variant="destructive"
                          size="lg"
                          className="flex-1 text-base"
                          onClick={async (e) => {
                            e.preventDefault()
                            if (window.confirm('Bu etkinliği silmek istediğinize emin misiniz?')) {
                              try {
                                await eventService.removeEvent(event.id, user!.id)
                                toast.success('Etkinlik başarıyla silindi')
                                loadEvents()
                              } catch (error) {
                                toast.error('Etkinlik silinirken bir hata oluştu')
                              }
                            }
                          }}
                        >
                          <Icons.trash className="mr-2 h-5 w-5" />
                          Sil
                        </Button>
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