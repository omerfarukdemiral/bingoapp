import React, { useEffect, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Button } from '@/components/ui/button'

interface QRScannerProps {
  onScan?: (data: {
    cardId: string
    questionId: string
    userId: string
    timestamp: number
  }) => void
}

export function QRScanner({ onScan }: QRScannerProps) {
  const [error, setError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    if (!scanning) return

    const scanner = new Html5QrcodeScanner('qr-reader', {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 5,
      rememberLastUsedCamera: true,
    })

    scanner.render(
      (decodedText) => {
        try {
          const data = JSON.parse(decodedText)
          if (
            typeof data === 'object' &&
            data.cardId &&
            data.questionId &&
            data.userId &&
            data.timestamp
          ) {
            onScan?.(data)
            scanner.clear()
            setScanning(false)
          } else {
            setError('Geçersiz QR kod formatı')
          }
        } catch (error) {
          setError('QR kod okunamadı')
        }
      },
      (error) => {
        console.error('QR kod okuma hatası:', error)
      },
      undefined
    )

    return () => {
      scanner.clear()
    }
  }, [scanning, onScan])

  return (
    <div className="space-y-4">
      {error && <div className="text-red-500 text-center">{error}</div>}
      {!scanning ? (
        <div className="text-center">
          <Button onClick={() => setScanning(true)}>
            Taramayı Başlat
          </Button>
        </div>
      ) : (
        <div id="qr-reader" />
      )}
    </div>
  )
} 