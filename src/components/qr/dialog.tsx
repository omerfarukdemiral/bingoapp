'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import QRCode from 'react-qr-code'
import { QRScanner } from './scanner'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Icons } from '@/components/icons'
import type { Question, BingoCardMatch } from '@/types/event'

interface QRDialogProps {
  mode: 'generate' | 'scan'
  question?: Question
  data?: {
    cardId: string
    questionId: string
    userId: string
    timestamp: number
  }
  onScan?: (data: {
    cardId: string
    questionId: string
    userId: string
    timestamp: number
  }) => void
  onComplete?: (questionId: string) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function QRDialog({
  mode,
  question,
  data,
  onScan,
  onComplete,
  open,
  onOpenChange
}: QRDialogProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [showScanner, setShowScanner] = useState(false)

  const canShowQR = useMemo(() => {
    if (!question || !data) return false
    return question.matches?.some(match => match.userId === data.userId) ?? false
  }, [question, data])

  const handleComplete = () => {
    if (!question) return
    onComplete?.(question.id)
    onOpenChange?.(false)
  }

  const handleScan = (data: {
    cardId: string
    questionId: string
    userId: string
    timestamp: number
  }) => {
    setError(null)
    onScan?.(data)
    onOpenChange?.(false)
  }

  const handleScanClick = () => {
    // Mobil cihazlar için QR tarama sayfasına yönlendir
    const currentUrl = window.location.href
    router.push(`/scan?returnUrl=${encodeURIComponent(currentUrl)}`)
    onOpenChange?.(false)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Görev Detayı</DialogTitle>
          {question && (
            <DialogDescription className="text-base font-medium text-foreground">
              {question.text}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* Eşleşen Kullanıcılar */}
          {question?.matches && question.matches.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Bu görev için eşleşen kişiler:</h4>
              <p className="text-xs text-muted-foreground">
                Bu kişilerden birinin QR kodunu okutarak görevi tamamlayabilirsiniz.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {question.matches.map((match: BingoCardMatch) => (
                  <div key={match.userId} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <Avatar className="h-8 w-8">
                      {match.user.avatarUrl ? (
                        <AvatarImage
                          src={match.user.avatarUrl}
                          alt={match.user.name}
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <AvatarFallback>
                          {getInitials(match.user.name)}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{match.user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{match.user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Görev Tamamlama Seçenekleri */}
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-medium">Görevi nasıl tamamlamak istersiniz?</h4>
            <div className="flex gap-3">
              {mode === 'generate' ? (
                <div className="w-full flex flex-col items-center gap-4">
                  {canShowQR ? (
                    <>
                      <QRCode value={JSON.stringify(data)} size={256} />
                      <Button onClick={handleScanClick} className="w-full">
                        <Icons.scan className="mr-2 h-4 w-4" />
                        QR Kod Tara
                      </Button>
                    </>
                  ) : (
                    <Button onClick={handleScanClick} className="w-full">
                      <Icons.scan className="mr-2 h-4 w-4" />
                      QR Kod Tara
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleScanClick}
                  >
                    <Icons.scan className="mr-2 h-4 w-4" />
                    QR Kod Tara
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleComplete}
                  >
                    <Icons.check className="mr-2 h-4 w-4" />
                    Tamamlandı
                  </Button>
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 