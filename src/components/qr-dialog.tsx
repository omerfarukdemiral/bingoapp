import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { QRCode } from 'react-qr-code'
import { QRScanner } from '@/components/qr-scanner'

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
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function QRDialog({
  mode,
  data,
  onScan,
  open,
  onOpenChange
}: QRDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open)
    }
  }, [open])

  const handleOpenChange = (value: boolean) => {
    setIsOpen(value)
    onOpenChange?.(value)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'generate' ? 'QR Kod' : 'QR Kod Tara'}
          </DialogTitle>
        </DialogHeader>
        {mode === 'generate' && data ? (
          <div className="flex items-center justify-center p-4">
            <QRCode value={JSON.stringify(data)} size={256} />
          </div>
        ) : (
          <QRScanner onScan={onScan} />
        )}
      </DialogContent>
    </Dialog>
  )
} 