'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from '@/context/auth.context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'

const features = [
  {
    icon: Icons.community,
    title: 'Topluluk Oluşturun',
    description: 'Etkinliklerinizde katılımcılar arasında etkileşimi artırın ve güçlü bir topluluk oluşturun.'
  },
  {
    icon: Icons.network,
    title: 'Networking Yapın',
    description: 'Bingo kartları ile katılımcıların birbirleriyle tanışmasını ve network oluşturmasını sağlayın.'
  },
  {
    icon: Icons.connection,
    title: 'Bağlantılar Kurun',
    description: 'Ortak ilgi alanlarına sahip kişilerle tanışın ve kalıcı bağlantılar oluşturun.'
  },
  {
    icon: Icons.event,
    title: 'Etkinlikler Düzenleyin',
    description: 'Kendi etkinliklerinizi oluşturun ve katılımcıların etkileşimini artırın.'
  },
  {
    icon: Icons.bingo,
    title: 'Eğlenceli Görevler',
    description: "Bingo kartları ile networking'i eğlenceli bir oyuna dönüştürün."
  },
  {
    icon: Icons.trophy,
    title: 'Başarıları Kutlayın',
    description: 'Görevleri tamamlayan katılımcıları ödüllendirin ve başarılarını takip edin.'
  }
]

const stats = [
  { value: '500+', label: 'Aktif Kullanıcı' },
  { value: '100+', label: 'Başarılı Etkinlik' },
  { value: '5000+', label: 'Tamamlanan Görev' },
  { value: '1000+', label: 'Yeni Bağlantı' },
]

export default function HomePage() {
  const { user } = useAuth()
  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, 100])
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360])
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.5])

  return (
    <div ref={containerRef} className="relative">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-grid-white/10 bg-grid-16 [mask-image:radial-gradient(white,transparent_85%)]" />
        </div>

        <div className="container relative z-10 mx-auto px-4 py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl"
          >
            <h1 className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-4xl sm:text-6xl font-bold mb-6">
              Networking'i Eğlenceye Dönüştürün
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8">
              IceBreaker Bingo ile etkinliklerinizi daha interaktif hale getirin. 
              Katılımcılar arasında eğlenceli bir networking deneyimi yaratın.
            </p>
            {!user ? (
              <Button size="lg" asChild className="text-lg h-12">
                <Link href="/login">
                  Hemen Başlayın
                </Link>
              </Button>
            ) : (
              <Button size="lg" asChild className="text-lg h-12">
                <Link href="/events">
                  Etkinliklere Göz Atın
                </Link>
              </Button>
            )}
          </motion.div>
        </div>

        {/* Floating Icons */}
        <motion.div
          style={{ y }}
          className="absolute -bottom-20 left-1/2 -translate-x-1/2"
        >
          <div className="relative">
            <motion.div
              style={{ rotate }}
              className="absolute -top-16 -left-16 text-primary/20"
            >
              <Icons.bingo className="w-32 h-32" />
            </motion.div>
            <motion.div
              style={{ rotate }}
              className="absolute -top-8 left-8 text-secondary/20"
            >
              <Icons.network className="w-24 h-24" />
            </motion.div>
            <motion.div
              style={{ scale }}
              className="absolute top-0 right-0 text-primary/20"
            >
              <Icons.community className="w-20 h-20" />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Neler Sunuyoruz?
            </h2>
            <p className="text-lg text-muted-foreground">
              IceBreaker Bingo ile networking etkinliklerinizi daha etkili hale getirin
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="group h-full bg-gradient-to-br from-card via-background to-card hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="mb-4 p-3 rounded-lg bg-primary/10 w-fit group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
        <div className="container relative z-10 mx-auto px-4">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl sm:text-5xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-lg text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-muted/50 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0 text-primary/10">
          <Icons.wave className="w-full h-auto" />
        </div>
        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Etkinliğinizi Daha Etkileşimli Hale Getirin
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              IceBreaker Bingo ile katılımcılarınızın networking deneyimini bir üst seviyeye taşıyın.
            </p>
            {!user ? (
              <Button size="lg" asChild className="text-lg h-12">
                <Link href="/login">
                  Ücretsiz Deneyin
                </Link>
              </Button>
            ) : (
              <Button size="lg" asChild className="text-lg h-12">
                <Link href="/events/create">
                  Yeni Etkinlik Oluşturun
                </Link>
              </Button>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  )
} 