'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth.context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Icons } from '@/components/icons'
import { eventService } from '@/services/event.service'
import { toast } from 'sonner'
import type { Event } from '@/types/event'

export default function EditEventPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [event, setEvent] = useState<Event | null>(null)
  const [isTimeboxed, setIsTimeboxed] = useState(false)

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const eventData = await eventService.getEvent(params.id)
        if (!eventData) {
          setError('Etkinlik bulunamadı')
          return
        }

        if (eventData.createdBy !== user?.id) {
          router.push('/events')
          return
        }

        setEvent(eventData)
        setIsTimeboxed(eventData.isTimeboxed)
      } catch (error) {
        setError('Etkinlik yüklenirken bir hata oluştu')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadEvent()
    }
  }, [params.id, user, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user || !event) return

    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const maxParticipants = parseInt(formData.get('maxParticipants') as string)
    const duration = isTimeboxed ? parseInt(formData.get('duration') as string) || null : null
    const startDate = new Date(formData.get('startDate') as string)

    try {
      await eventService.updateEventDetails(event.id, user.id, {
        name,
        description,
        maxParticipants,
        startDate,
        isTimeboxed,
        ...(duration && { duration }),
      })

      toast.success('Etkinlik başarıyla güncellendi')
      router.push(`/events/${event.id}`)
    } catch (error) {
      setError('Etkinlik güncellenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container flex items-center justify-center py-10">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              {error || 'Etkinlik bulunamadı'}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-10">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Etkinliği Düzenle</CardTitle>
          <CardDescription>
            Etkinlik detaylarını güncelleyin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Etkinlik Adı</Label>
              <Input
                id="name"
                name="name"
                defaultValue={event.name}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Etkinlik Açıklaması</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={event.description}
                required
                disabled={loading}
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Maksimum Katılımcı Sayısı</Label>
              <Input
                id="maxParticipants"
                name="maxParticipants"
                type="number"
                min={event.currentParticipants}
                defaultValue={event.maxParticipants}
                required
                disabled={loading}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isTimeboxed"
                checked={isTimeboxed}
                onCheckedChange={setIsTimeboxed}
                disabled={loading}
              />
              <Label htmlFor="isTimeboxed">Süre Sınırı Koy</Label>
            </div>

            {isTimeboxed && (
              <div className="space-y-2">
                <Label htmlFor="duration">Süre (dakika)</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  min={5}
                  defaultValue={event.duration}
                  required
                  disabled={loading}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="startDate">Başlangıç Tarihi ve Saati</Label>
              <Input
                id="startDate"
                name="startDate"
                type="datetime-local"
                defaultValue={new Date(event.startDate).toISOString().slice(0, 16)}
                required
                disabled={loading}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            {error && (
              <div className="text-sm text-red-500">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={loading}
              >
                {loading ? (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Değişiklikleri Kaydet
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                İptal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 