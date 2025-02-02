'use client'

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth.context"
import Link from "next/link"

export default function HomePage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <div className="animate-pulse text-lg">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <main className="gradient-bg min-h-[calc(100vh-3.5rem)]">
      <div className="container section-padding">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <h1 className="gradient-text mb-4 text-5xl font-bold tracking-tight md:text-6xl">
            IceBreaker Bingo
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Etkinliklerde eğlenceli bir şekilde networking yapmanın en iyi yolu!
          </p>
          {user ? (
            <div className="flex justify-center gap-4">
              <Link href="/events">
                <Button className="button-gradient">Etkinliklere Katıl</Button>
              </Link>
              <Link href="/events/create">
                <Button variant="outline">Etkinlik Oluştur</Button>
              </Link>
            </div>
          ) : (
            <div className="flex justify-center gap-4">
              <Link href="/login">
                <Button className="button-gradient">Giriş Yap</Button>
              </Link>
              <Link href="/register">
                <Button variant="outline">Kayıt Ol</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2">
          <Card className="card-hover p-6">
            <h2 className="mb-4 text-2xl font-bold">Nasıl Çalışır?</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                Bir etkinliğe katılın
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                Bingo kartınızı alın
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                Diğer katılımcılarla tanışın
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                QR kodları okutun
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">•</span>
                Bingo yapın ve kazanın!
              </li>
            </ul>
          </Card>

          <Card className="card-hover p-6">
            <h2 className="mb-4 text-2xl font-bold">Özellikler</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="text-secondary">•</span>
                5x5 Bingo kartı
              </li>
              <li className="flex items-center gap-2">
                <span className="text-secondary">•</span>
                QR kod sistemi
              </li>
              <li className="flex items-center gap-2">
                <span className="text-secondary">•</span>
                Gerçek zamanlı sıralama
              </li>
              <li className="flex items-center gap-2">
                <span className="text-secondary">•</span>
                Detaylı istatistikler
              </li>
              <li className="flex items-center gap-2">
                <span className="text-secondary">•</span>
                Başarı rozetleri
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </main>
  )
} 