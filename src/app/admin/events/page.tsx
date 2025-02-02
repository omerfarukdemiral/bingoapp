'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/auth.context'
import { useRouter } from 'next/navigation'
import { eventService } from '@/services/event.service'
import type { Event } from '@/types/event'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Icons } from '@/components/icons'
import { toast } from 'sonner'

export default function AdminEventsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Yetki kontrolü
    if (user && user.role !== 'admin') {
      router.push('/events')
      return
    }

    loadEvents()
  }, [user, router])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const allEvents = await eventService.getActiveEvents()
      setEvents(allEvents)
    } catch (error) {
      toast.error('Etkinlikler yüklenirken bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (eventId: string, isActive: boolean) => {
    try {
      if (!user) return
      await eventService.updateEventStatus(eventId, user.id, isActive)
      toast.success(`Etkinlik durumu ${isActive ? 'aktif' : 'pasif'} olarak güncellendi.`)
      loadEvents()
    } catch (error) {
      toast.error('Etkinlik durumu güncellenirken bir hata oluştu.')
    }
  }

  const handleLimitChange = async (eventId: string, limit: number) => {
    try {
      if (!user) return
      await eventService.updateParticipantLimit(eventId, user.id, limit)
      toast.success('Katılımcı limiti güncellendi.')
      loadEvents()
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('Katılımcı limiti güncellenirken bir hata oluştu.')
      }
    }
  }

  const handleDelete = async (eventId: string) => {
    try {
      if (!user) return
      if (!confirm('Bu etkinliği silmek istediğinize emin misiniz?')) return

      await eventService.removeEvent(eventId, user.id)
      toast.success('Etkinlik başarıyla silindi.')
      loadEvents()
    } catch (error) {
      toast.error('Etkinlik silinirken bir hata oluştu.')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR')
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

  return (
    <div className="container max-w-4xl py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Etkinlik Yönetimi</h1>
        <Button onClick={() => router.push('/events/new')}>
          <Icons.plus className="mr-2 h-4 w-4" />
          Yeni Etkinlik
        </Button>
      </div>

      <div className="space-y-4">
        {events.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <CardTitle>{event.name}</CardTitle>
              <CardDescription>
                {event.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Durum</span>
                  <Switch
                    checked={event.isActive}
                    onCheckedChange={(isActive: boolean) => handleStatusChange(event.id, isActive)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Katılımcı Limiti</span>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      min={event.currentParticipants}
                      value={event.participantLimit}
                      onChange={(e) => handleLimitChange(event.id, parseInt(e.target.value))}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">
                      ({event.currentParticipants} katılımcı)
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tarih</span>
                  <div className="text-sm">
                    {formatDate(event.startDate)} - {formatDate(event.endDate)}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => router.push(`/events/${event.id}/edit`)}
              >
                Düzenle
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(event.id)}
              >
                Sil
              </Button>
            </CardFooter>
          </Card>
        ))}

        {events.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Henüz hiç etkinlik oluşturulmamış.
          </div>
        )}
      </div>
    </div>
  )
} 