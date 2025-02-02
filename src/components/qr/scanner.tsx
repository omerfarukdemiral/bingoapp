'use client'

import { useEffect, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface QRScannerProps {
  onScan: (data: {
    cardId: string
    questionId: string
    userId: string
    timestamp: number
  }) => void
  onError?: (error: string) => void
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [scanner, setScanner] = useState<Html5QrcodeScanner | null>(null)

  useEffect(() => {
    return () => {
      scanner?.clear()
    }
  }, [scanner])

  const startScanning = () => {
    const qrScanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1,
      },
      false
    )

    qrScanner.render(
      (decodedText) => {
        try {
          const data = JSON.parse(decodedText)
          onScan(data)
          qrScanner.clear()
          setScanner(null)
          setScanning(false)
        } catch (error) {
          onError?.('Geçersiz QR kod formatı.')
        }
      },
      (error) => {
        console.error(error)
        onError?.('QR kod taranırken bir hata oluştu.')
      }
    )

    setScanner(qrScanner)
    setScanning(true)
  }

  const stopScanning = () => {
    scanner?.clear()
    setScanner(null)
    setScanning(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>QR Kod Tara</CardTitle>
        <CardDescription>
          Diğer katılımcıların QR kodlarını tarayarak görevleri tamamlayabilirsiniz.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div id="qr-reader" className="w-full max-w-sm" />
        {!scanning ? (
          <Button onClick={startScanning}>
            Taramayı Başlat
          </Button>
        ) : (
          <Button variant="outline" onClick={stopScanning}>
            Taramayı Durdur
          </Button>
        )}
      </CardContent>
    </Card>
  )
} 