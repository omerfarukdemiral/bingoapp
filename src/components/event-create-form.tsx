'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth.context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Icons } from '@/components/icons'
import { templates } from '@/config/templates'
import { eventService } from '@/services/event.service'
import { toast } from 'sonner'
import type { Event } from '@/types/event'

export function EventCreateForm() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isTimeboxed, setIsTimeboxed] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<typeof templates[0] | null>(null)

  const handleTemplateChange = (value: string) => {
    const template = templates.find(t => t.id === value)
    setSelectedTemplate(template || null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user || !selectedTemplate) return

    setError(null)
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const name = formData.get('name') as string
      const description = formData.get('description') as string
      const maxParticipants = parseInt(formData.get('maxParticipants') as string)
      const startDate = formData.get('startDate') as string
      const duration = isTimeboxed ? formData.get('duration') as string : undefined

      if (!name || !description || !maxParticipants || !startDate || (isTimeboxed && !duration)) {
        setError('Lütfen tüm alanları doldurun')
        return
      }

      const event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'> = {
        name,
        description,
        maxParticipants,
        currentParticipants: 0,
        startDate: new Date(startDate),
        isTimeboxed,
        duration: isTimeboxed ? Number(duration) : undefined,
        status: 'active',
        createdBy: user.id,
        adminId: user.id,
        templateId: selectedTemplate.id,
        surveyQuestions: selectedTemplate.surveyQuestions,
        bingoTasks: selectedTemplate.bingoTasks
      }

      const eventId = await eventService.createEvent(event)
      toast.success('Etkinlik başarıyla oluşturuldu!')
      router.push(`/events/${eventId}`)
    } catch (error) {
      setError('Etkinlik oluşturulurken bir hata oluştu')
      console.error('Etkinlik oluşturma hatası:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Yeni Etkinlik Oluştur</CardTitle>
          <CardDescription>
            Etkinlik detaylarını girin ve bir şablon seçin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Etkinlik Adı</Label>
            <Input
              id="name"
              name="name"
              placeholder="Örn: Startup Networking Etkinliği"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Input
              id="description"
              name="description"
              placeholder="Etkinlik hakkında kısa bir açıklama"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxParticipants">Maksimum Katılımcı Sayısı</Label>
            <Input
              id="maxParticipants"
              name="maxParticipants"
              type="number"
              min="1"
              placeholder="Örn: 50"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate">Başlangıç Tarihi</Label>
            <Input
              id="startDate"
              name="startDate"
              type="datetime-local"
              disabled={loading}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="timeboxed"
              checked={isTimeboxed}
              onCheckedChange={setIsTimeboxed}
              disabled={loading}
            />
            <Label htmlFor="timeboxed">Süre Sınırı</Label>
          </div>

          {isTimeboxed && (
            <div className="space-y-2">
              <Label htmlFor="duration">Süre (dakika)</Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                min="1"
                placeholder="Örn: 120"
                disabled={loading}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Şablon</Label>
            <Select onValueChange={handleTemplateChange} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Bir şablon seçin" />
              </SelectTrigger>
              <SelectContent>
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">Anket Soruları</h4>
                <ul className="mt-2 space-y-2">
                  {selectedTemplate.surveyQuestions.map(question => (
                    <li key={question.id} className="text-sm text-muted-foreground">
                      • {question.text}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium">Bingo Görevleri</h4>
                <ul className="mt-2 space-y-2">
                  {selectedTemplate.bingoTasks.map(task => (
                    <li key={task.id} className="text-sm text-muted-foreground">
                      • {task.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading || !selectedTemplate}>
            {loading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Oluşturuluyor...
              </>
            ) : (
              'Etkinlik Oluştur'
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  )
} 