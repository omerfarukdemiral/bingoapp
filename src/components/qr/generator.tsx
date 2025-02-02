'use client'

import { QRCodeSVG } from 'qrcode.react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface QRGeneratorProps {
  data: {
    cardId: string
    questionId: string
    userId: string
    timestamp: number
  }
  size?: number
}

export function QRGenerator({ data, size = 256 }: QRGeneratorProps) {
  const qrData = JSON.stringify(data)

  const handleDownload = () => {
    const svg = document.getElementById('qr-code')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = size
      canvas.height = size
      ctx?.drawImage(img, 0, 0)
      const pngFile = canvas.toDataURL('image/png')
      
      const downloadLink = document.createElement('a')
      downloadLink.download = `qr-${data.questionId}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
        <QRCodeSVG
          id="qr-code"
          value={qrData}
          size={size}
          level="H"
          includeMargin
        />
        <Button onClick={handleDownload}>
          QR Kodu İndir
        </Button>
      </CardContent>
    </Card>
  )
} 