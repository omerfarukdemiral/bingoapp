'use client'

import { useEffect, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import { toast } from 'sonner'

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
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)

  useEffect(() => {
    // Component mount olduğunda scanner'ı oluştur
    const qrScanner = new Html5Qrcode('qr-reader')
    setScanner(qrScanner)

    // Component unmount olduğunda scanner'ı temizle
    return () => {
      if (scanning) {
        qrScanner.stop().catch(console.error)
      }
      qrScanner.clear()
    }
  }, [])

  const startScanning = async () => {
    if (!scanner) return

    try {
      setCameraError(null)
      const cameras = await Html5Qrcode.getCameras()
      
      if (!cameras || cameras.length === 0) {
        setCameraError('Kamera bulunamadı. Lütfen cihazınızda kamera olduğundan emin olun.')
        return
      }

      // Önce arka kamerayı dene, yoksa ön kamerayı kullan
      const backCamera = cameras.find(camera => camera.label.toLowerCase().includes('back'))
      const selectedCamera = backCamera || cameras[0]

      try {
        await scanner.start(
          selectedCamera.id,
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
                stopScanning()
              } else {
                toast.error('Geçersiz QR kod formatı')
              }
            } catch (error) {
              toast.error('QR kod okunamadı')
            }
          },
          undefined
        )
        setScanning(true)
      } catch (error) {
        if (error instanceof Error) {
          if (error.message.includes('permission')) {
            setCameraError('Kamera izni reddedildi. Lütfen tarayıcı ayarlarından kamera iznini etkinleştirin.')
          } else if (error.message.includes('starting')) {
            setCameraError('Kamera başlatılamadı. Lütfen başka bir uygulamanın kamerayı kullanmadığından emin olun.')
          } else {
            setCameraError('Kamera başlatılırken bir hata oluştu: ' + error.message)
          }
        }
        console.error('Kamera hatası:', error)
      }
    } catch (error) {
      setCameraError('Kameralara erişilemiyor. Lütfen tarayıcı izinlerini kontrol edin.')
      console.error('Kamera listesi alınamadı:', error)
    }
  }

  const stopScanning = async () => {
    if (!scanner) return

    try {
      await scanner.stop()
    } catch (error) {
      console.log('Scanner durduruluyor:', error)
    } finally {
      setScanning(false)
    }
  }

  const handleRetry = async () => {
    setCameraError(null)
    await startScanning()
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="space-y-2">
        <CardTitle className="text-lg sm:text-xl">QR Kod Tara</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Görevi tamamlamak için diğer katılımcıların QR kodlarını tarayın.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div id="qr-reader" className="w-full aspect-square max-w-[280px] sm:max-w-[320px] mx-auto overflow-hidden rounded-lg" />
        
        {cameraError ? (
          <div className="space-y-4 w-full max-w-[280px] sm:max-w-[320px]">
            <p className="text-sm text-red-500 text-center">{cameraError}</p>
            <Button onClick={handleRetry} className="w-full text-sm">
              <Icons.refresh className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Tekrar Dene
            </Button>
          </div>
        ) : !scanning ? (
          <Button onClick={startScanning} className="w-full max-w-[280px] sm:max-w-[320px] text-sm">
            <Icons.scan className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Kamerayı Aç
          </Button>
        ) : (
          <Button variant="outline" onClick={stopScanning} className="w-full max-w-[280px] sm:max-w-[320px] text-sm">
            <Icons.scan className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Kamerayı Kapat
          </Button>
        )}
      </CardContent>
    </Card>
  )
} 