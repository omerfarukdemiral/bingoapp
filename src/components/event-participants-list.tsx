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
        <CardTitle className="text-lg sm:text-xl">Katılımcılar ({participants.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
            >
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                  {participant.user.avatarUrl ? (
                    <AvatarImage
                      src={participant.user.avatarUrl}
                      alt={participant.user.name}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <AvatarFallback className="text-xs sm:text-sm">
                      {getInitials(participant.user.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm sm:text-base truncate">
                    {participant.user.name}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    {participant.user.email}
                  </p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {participant.points} puan
                  </p>
                </div>
              </div>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-2 h-8 w-8 sm:h-9 sm:w-9"
                  onClick={() => handleRemoveParticipant(participant.id, participant.userId)}
                  disabled={loading === participant.id}
                >
                  {loading === participant.id ? (
                    <Icons.spinner className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                  ) : (
                    <Icons.trash className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                </Button>
              )}
            </div>
          ))}

          {participants.length === 0 && (
            <div className="text-center py-6 sm:py-8 text-sm sm:text-base text-muted-foreground">
              Henüz katılımcı bulunmuyor.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 