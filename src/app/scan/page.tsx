'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { QRScanner } from '@/components/qr/scanner'
import { eventService } from '@/services/event.service'
import { useAuth } from '@/context/auth.context'
import { toast } from 'sonner'

export default function ScanPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [error, setError] = useState<string | null>(null)

  const handleScan = async (data: {
    cardId: string
    questionId: string
    userId: string
    timestamp: number
  }) => {
    try {
      if (!user?.id) {
        setError('Oturum açmanız gerekiyor')
        return
      }

      const returnUrl = searchParams.get('returnUrl')
      const result = await eventService.verifyQRCode({
        ...data,
        verifiedByUserId: user.id
      })

      if (result) {
        toast.success('Görev başarıyla tamamlandı!')
        if (returnUrl) {
          router.push(returnUrl)
        } else {
          router.back()
        }
      }
    } catch (error) {
      setError('QR kod doğrulanamadı.')
    }
  }

  return (
    <div className="container flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">QR Kod Tara</h1>
        <p className="text-center text-muted-foreground">
          Görevi tamamlamak için bir QR kod tarayın.
        </p>
        <QRScanner onScan={handleScan} onError={setError} />
        {error && (
          <div className="text-sm text-red-500 text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  )
} 