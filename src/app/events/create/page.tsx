'use client'

import { useState } from 'react'
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
import type { Event } from '@/types/event'

export default function CreateEventPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isTimeboxed, setIsTimeboxed] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return

    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const maxParticipants = parseInt(formData.get('maxParticipants') as string)
    const duration = isTimeboxed ? parseInt(formData.get('duration') as string) : undefined

    try {
      const event: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'cards' | 'currentParticipants'> = {
        name,
        description,
        maxParticipants,
        startDate: new Date(),
        isTimeboxed,
        duration,
        status: 'draft',
        createdBy: user.id,
      }

      const eventId = await eventService.createEvent(event)
      router.push(`/events/${eventId}`)
    } catch (error) {
      setError('Etkinlik oluşturulurken bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl py-10">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Yeni Etkinlik Oluştur</CardTitle>
          <CardDescription>
            Etkinlik detaylarını girin ve katılımcılar için bir Bingo kartı oluşturun.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Etkinlik Adı</Label>
              <Input
                id="name"
                name="name"
                required
                disabled={loading}
                placeholder="Örn: Startup Networking Etkinliği"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Etkinlik Açıklaması</Label>
              <Textarea
                id="description"
                name="description"
                required
                disabled={loading}
                placeholder="Etkinliğinizi kısaca açıklayın..."
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Maksimum Katılımcı Sayısı</Label>
              <Input
                id="maxParticipants"
                name="maxParticipants"
                type="number"
                min={2}
                required
                disabled={loading}
                placeholder="Örn: 50"
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
                  required
                  disabled={loading}
                  placeholder="Örn: 60"
                />
              </div>
            )}
            {error && (
              <div className="text-sm text-red-500">
                {error}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Etkinlik Oluştur
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 