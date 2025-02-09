import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Icons } from '@/components/icons'
import { toast } from 'sonner'
import { eventService } from '@/services/event.service'
import type { EventParticipant } from '@/types/event'
import type { User } from '@/types/user'

interface EventParticipantsListProps {
  eventId: string
  participants: (EventParticipant & { user: User })[]
  isAdmin: boolean
  onParticipantRemove?: () => void
}

export function EventParticipantsList({
  eventId,
  participants,
  isAdmin,
  onParticipantRemove
}: EventParticipantsListProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleRemoveParticipant = async (participantId: string, userId: string) => {
    if (!confirm('Bu katılımcıyı etkinlikten çıkarmak istediğinize emin misiniz?')) return

    try {
      setLoading(participantId)
      await eventService.removeParticipant(eventId, userId)
      toast.success('Katılımcı etkinlikten çıkarıldı')
      onParticipantRemove?.()
    } catch (error) {
      toast.error('Katılımcı çıkarılırken bir hata oluştu')
    } finally {
      setLoading(null)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Katılımcılar ({participants.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  {participant.user.avatarUrl ? (
                    <AvatarImage
                      src={participant.user.avatarUrl}
                      alt={participant.user.name}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <AvatarFallback>
                      {getInitials(participant.user.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="font-medium">{participant.user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {participant.user.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {participant.points} puan
                  </p>
                </div>
              </div>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleRemoveParticipant(participant.id, participant.userId)}
                  disabled={loading === participant.id}
                >
                  {loading === participant.id ? (
                    <Icons.spinner className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icons.trash className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          ))}

          {participants.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Henüz katılımcı bulunmuyor.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 