'use client'

import { useEffect, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'

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

  useEffect(() => {
    // Component unmount olduğunda scanner'ı temizle
    return () => {
      const scanner = new Html5Qrcode('qr-reader')
      if (scanning) {
        scanner.stop().catch(console.error)
      }
      scanner.clear()
    }
  }, [scanning])

  const startScanning = async () => {
    try {
      const cameras = await Html5Qrcode.getCameras()
      if (!cameras || cameras.length === 0) {
        onError?.('Kamera bulunamadı')
        return
      }

      const scanner = new Html5Qrcode('qr-reader')
      await scanner.start(
        cameras[0].id,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
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
              onScan(data)
              stopScanning(scanner)
            } else {
              onError?.('Geçersiz QR kod formatı')
            }
          } catch (error) {
            onError?.('QR kod okunamadı')
          }
        },
        undefined
      )
      setScanning(true)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
          onError?.('Kamera izni reddedildi. Lütfen tarayıcı ayarlarından kamera iznini etkinleştirin.')
        } else {
          onError?.('Kamera başlatılırken bir hata oluştu: ' + error.message)
        }
      }
      console.error('Kamera hatası:', error)
    }
  }

  const stopScanning = async (scanner?: Html5Qrcode) => {
    try {
      if (scanner) {
        await scanner.stop()
      } else {
        const newScanner = new Html5Qrcode('qr-reader')
        await newScanner.stop()
      }
    } catch (error) {
      // Scanner zaten durmuş olabilir, hatayı yok sayabiliriz
      console.log('Scanner durduruluyor:', error)
    } finally {
      setScanning(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>QR Kod Tara</CardTitle>
        <CardDescription>
          Görevi tamamlamak için diğer katılımcıların QR kodlarını tarayın.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div id="qr-reader" className="w-full max-w-sm" />
        {!scanning ? (
          <Button onClick={startScanning} className="w-full">
            <Icons.scan className="mr-2 h-4 w-4" />
            Kamerayı Aç
          </Button>
        ) : (
          <Button variant="outline" onClick={() => stopScanning()} className="w-full">
            <Icons.scan className="mr-2 h-4 w-4" />
            Kamerayı Kapat
          </Button>
        )}
      </CardContent>
    </Card>
  )
} 