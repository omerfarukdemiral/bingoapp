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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Icons } from '@/components/icons'
import { eventService } from '@/services/event.service'
import { templates } from '@/config/templates'
import type { Event } from '@/types/event'
import type { Template } from '@/config/templates'
import Link from 'next/link'

export default function CreateEventPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isTimeboxed, setIsTimeboxed] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    setSelectedTemplate(template || null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user || !selectedTemplate) return

    setError(null)
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const maxParticipants = parseInt(formData.get('maxParticipants') as string)
    const duration = isTimeboxed ? parseInt(formData.get('duration') as string) || null : null
    const startDate = new Date(formData.get('startDate') as string)

    try {
      const event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'> = {
        name,
        description,
        maxParticipants,
        currentParticipants: 0,
        startDate,
        isTimeboxed,
        ...(duration && { duration }),
        status: 'active',
        createdBy: user.id,
        adminId: user.id,
        templateId: selectedTemplate.id,
        surveyQuestions: selectedTemplate.surveyQuestions,
        bingoTasks: selectedTemplate.bingoTasks
      }

      console.log('📝 Etkinlik oluşturma isteği:', event)
      const eventId = await eventService.createEvent(event)
      console.log('✅ Etkinlik oluşturuldu:', eventId)
      router.push(`/events/${eventId}`)
    } catch (error) {
      console.error('❌ Etkinlik oluşturma hatası:', error)
      setError(error instanceof Error ? error.message : 'Etkinlik oluşturulurken bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Link href="/events" className="hover:text-primary transition-colors">
              Etkinlikler
            </Link>
            <Icons.chevronRight className="h-4 w-4" />
            <span>Yeni Etkinlik</span>
          </div>
          <h1 className="text-4xl font-bold mb-2 text-foreground">
            Yeni Etkinlik Oluştur
          </h1>
          <p className="text-lg text-muted-foreground">
            Etkinlik detaylarını girin ve bir şablon seçerek Bingo kartlarını oluşturun.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="template">Etkinlik Şablonu</Label>
              <Select
                onValueChange={handleTemplateChange}
                required
              >
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
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle>{selectedTemplate.name}</CardTitle>
                  <CardDescription>{selectedTemplate.description}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <div>
                    <h4 className="mb-2 font-medium">Anket Soruları</h4>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                      {selectedTemplate.surveyQuestions.map(question => (
                        <li key={question.id}>{question.text}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-2 font-medium">Bingo Görevleri</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {selectedTemplate.bingoTasks.map(task => (
                        <div
                          key={task.id}
                          className="p-2 rounded-md bg-background border"
                        >
                          <div className="font-medium">{task.text}</div>
                          <div className="text-xs text-muted-foreground">
                            {task.category} • {task.points} puan
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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

            <div className="space-y-2">
              <Label htmlFor="startDate">Başlangıç Tarihi ve Saati</Label>
              <Input
                id="startDate"
                name="startDate"
                type="datetime-local"
                required
                disabled={loading}
                min={new Date().toISOString().slice(0, 16)}
                defaultValue={new Date().toISOString().slice(0, 16)}
              />
            </div>

            {error && (
              <div className="text-sm text-red-500">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !selectedTemplate}
            >
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