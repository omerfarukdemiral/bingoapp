'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { QRGenerator } from './generator'
import { QRScanner } from './scanner'
import { Icons } from '@/components/icons'

interface QRDialogProps {
  mode: 'generate' | 'scan'
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
}

export function QRDialog({ mode, data, onScan }: QRDialogProps) {
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const handleScan = (scannedData: {
    cardId: string
    questionId: string
    userId: string
    timestamp: number
  }) => {
    onScan?.(scannedData)
    setOpen(false)
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={mode === 'generate' ? 'default' : 'outline'}>
          {mode === 'generate' ? (
            <>
              <Icons.qrcode className="mr-2 h-4 w-4" />
              QR Kod Göster
            </>
          ) : (
            <>
              <Icons.scan className="mr-2 h-4 w-4" />
              QR Kod Tara
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'generate' ? 'QR Kod' : 'QR Kod Tara'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'generate'
              ? 'Bu QR kodu diğer katılımcılara göstererek görevi tamamladığınızı kanıtlayabilirsiniz.'
              : 'Diğer katılımcıların QR kodlarını tarayarak görevleri tamamlayabilirsiniz.'}
          </DialogDescription>
        </DialogHeader>
        {mode === 'generate' && data ? (
          <QRGenerator data={data} />
        ) : (
          <QRScanner onScan={handleScan} onError={handleError} />
        )}
        {error && (
          <div className="text-sm text-red-500 text-center">
            {error}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 