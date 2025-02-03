import { collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, deleteDoc, orderBy, limit, setDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { Event, BingoCard, EventParticipant } from '@/types/event'
import { userService } from './user.service'

const COLLECTION_NAME = 'events'

// Örnek sorular (gerçek uygulamada veritabanından gelecek)
const SAMPLE_QUESTIONS = [
  "Bir startup'ta çalışan biriyle tanış",
  "3'ten fazla dil bilen biriyle tanış",
  "Bir yazılımcıyla tanış",
  "Bir tasarımcıyla tanış",
  "Bir pazarlamacıyla tanış",
  "Bir yatırımcıyla tanış",
  "Bir freelancer ile tanış",
  "Bir CEO ile tanış",
  "Bir öğrenci ile tanış",
  "Bir akademisyen ile tanış",
  "Bir product manager ile tanış",
  "Bir data scientist ile tanış",
  "Bir blockchain geliştiricisi ile tanış",
  "Bir mobil uygulama geliştiricisi ile tanış",
  "Bir UI/UX tasarımcısı ile tanış",
  "Bir içerik üreticisi ile tanış",
  "Bir sosyal medya yöneticisi ile tanış",
  "Bir e-ticaret uzmanı ile tanış",
  "Bir SEO uzmanı ile tanış",
  "Bir growth hacker ile tanış",
  "Bir satış uzmanı ile tanış",
  "Bir müşteri deneyimi uzmanı ile tanış",
  "Bir proje yöneticisi ile tanış",
  "Bir insan kaynakları uzmanı ile tanış",
  "Bir hukuk danışmanı ile tanış",
]

export const eventService = {
  async createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      console.log('📝 Etkinlik oluşturma başladı:', eventData)
      
      const eventsRef = collection(db, 'events')
      const newEventRef = doc(eventsRef)
      
      // Undefined değerleri filtrele
      const eventDataToSave: Omit<Event, 'id'> & { id: string } = {
        id: newEventRef.id,
        name: eventData.name,
        description: eventData.description,
        maxParticipants: eventData.maxParticipants,
        currentParticipants: eventData.currentParticipants,
        startDate: eventData.startDate,
        isTimeboxed: eventData.isTimeboxed,
        duration: eventData.duration,
        status: eventData.status,
        createdBy: eventData.createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // Opsiyonel alanları sadece değer varsa ekle
      if (eventData.duration) {
        eventDataToSave['duration'] = eventData.duration
      }

      await setDoc(newEventRef, eventDataToSave)
      console.log('✅ Etkinlik başarıyla oluşturuldu:', eventDataToSave.id)
      
      return eventDataToSave.id
    } catch (error) {
      console.error('❌ Etkinlik oluşturma hatası:', error)
      if (error instanceof Error) {
        throw new Error(`Etkinlik oluşturulamadı: ${error.message}`)
      }
      throw new Error('Etkinlik oluşturulurken beklenmeyen bir hata oluştu')
    }
  },

  async getEvent(id: string): Promise<Event | null> {
    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Event : null
  },

  async getActiveEvents(): Promise<Event[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const events = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          name: data.name,
          description: data.description,
          currentParticipants: data.currentParticipants,
          maxParticipants: data.maxParticipants,
          isTimeboxed: data.isTimeboxed,
          duration: data.duration,
          createdBy: data.createdBy,
          startDate: data.startDate.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
          status: data.status,
        } as Event
      })

      console.log('📋 Aktif etkinlikler getirildi:', events)
      return events
    } catch (error) {
      console.error('❌ Etkinlikleri getirme hatası:', error)
      throw error
    }
  },

  async getEventParticipants(eventId: string): Promise<EventParticipant[]> {
    const q = query(
      collection(db, 'eventParticipants'),
      where('eventId', '==', eventId)
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as EventParticipant)
  },

  async getBingoCard(cardId: string): Promise<BingoCard | null> {
    const docRef = doc(db, 'bingoCards', cardId)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as BingoCard : null
  },

  async hasEventPermission(userId: string, eventId: string): Promise<boolean> {
    try {
      const user = await userService.getUser(userId)
      if (!user) return false

      // Admin her zaman yetkilidir
      if (user.role === 'admin') return true

      // Etkinliği oluşturan kullanıcı yetkilidir
      const event = await this.getEvent(eventId)
      return event?.createdBy === userId
    } catch (error) {
      console.error('Yetki kontrolü sırasında hata:', error)
      return false
    }
  },

  async updateEventDetails(eventId: string, userId: string, data: Partial<Event>): Promise<void> {
    if (!await this.hasEventPermission(userId, eventId)) {
      throw new Error('Bu işlem için yetkiniz bulunmamaktadır.')
    }

    const eventRef = doc(db, COLLECTION_NAME, eventId)
    await updateDoc(eventRef, {
      ...data,
      updatedAt: new Date(),
    })
  },

  async removeEvent(eventId: string, userId: string): Promise<void> {
    if (!await this.hasEventPermission(userId, eventId)) {
      throw new Error('Bu işlem için yetkiniz bulunmamaktadır.')
    }

    // Önce etkinliğe ait bingo kartlarını sil
    const q = query(
      collection(db, 'bingoCards'),
      where('eventId', '==', eventId)
    )
    const querySnapshot = await getDocs(q)
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref))
    await Promise.all(deletePromises)

    // Sonra etkinliği sil
    await deleteDoc(doc(db, COLLECTION_NAME, eventId))
  },

  async updateEventStatus(eventId: string, userId: string, isActive: boolean): Promise<void> {
    if (!await this.hasEventPermission(userId, eventId)) {
      throw new Error('Bu işlem için yetkiniz bulunmamaktadır.')
    }

    const eventRef = doc(db, COLLECTION_NAME, eventId)
    await updateDoc(eventRef, {
      isActive,
      updatedAt: new Date(),
    })
  },

  async updateParticipantLimit(eventId: string, userId: string, limit: number): Promise<void> {
    if (!await this.hasEventPermission(userId, eventId)) {
      throw new Error('Bu işlem için yetkiniz bulunmamaktadır.')
    }

    if (limit < 1) {
      throw new Error('Katılımcı limiti en az 1 olmalıdır.')
    }

    const event = await this.getEvent(eventId)
    if (!event) {
      throw new Error('Etkinlik bulunamadı.')
    }

    // Mevcut katılımcı sayısından düşük bir limit belirlenemez
    if (event.currentParticipants > limit) {
      throw new Error('Yeni limit mevcut katılımcı sayısından düşük olamaz.')
    }

    const eventRef = doc(db, COLLECTION_NAME, eventId)
    await updateDoc(eventRef, {
      participantLimit: limit,
      updatedAt: new Date(),
    })
  },

  async checkEventDate(eventId: string): Promise<{
    isStarted: boolean
    message?: string
  }> {
    const event = await this.getEvent(eventId)
    if (!event) {
      throw new Error('Etkinlik bulunamadı.')
    }

    const now = new Date()
    const startDate = event.startDate ? new Date(event.startDate) : new Date()
    const isStarted = now >= startDate

    // Etkinlik süresi dolmuşsa (eğer süre sınırı varsa)
    const isTimeExpired = event.isTimeboxed && event.duration 
      ? now > new Date(startDate.getTime() + event.duration * 60000)
      : false

    return {
      isStarted,
      message: now < startDate
        ? `Etkinlik ${startDate.toLocaleDateString('tr-TR')} tarihinde başlayacak`
        : isTimeExpired
        ? `Etkinlik süresi doldu`
        : `Etkinlik devam ediyor`,
    }
  },

  async joinEvent(eventId: string, userId: string): Promise<string> {
    try {
      const event = await this.getEvent(eventId)
      if (!event) throw new Error('Etkinlik bulunamadı')
      
      // Katılımcı limitini kontrol et
      if (event.currentParticipants >= event.maxParticipants) {
        throw new Error('Etkinlik katılımcı limiti dolmuş')
      }

      // Rastgele sorular seç
      const shuffledQuestions = SAMPLE_QUESTIONS
        .sort(() => Math.random() - 0.5)
        .slice(0, 25)
        .map((text, index) => ({
          id: `q${index + 1}`,
          text,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }))

      // Yeni bingo kartı oluştur
      const cardRef = await addDoc(collection(db, 'bingoCards'), {
        eventId,
        questions: shuffledQuestions,
        completedQuestions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      // Katılımcı kaydı oluştur
      await addDoc(collection(db, 'eventParticipants'), {
        eventId,
        userId,
        cardId: cardRef.id,
        points: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      // Etkinlik katılımcı sayısını güncelle
      await updateDoc(doc(db, 'events', eventId), {
        currentParticipants: event.currentParticipants + 1,
        updatedAt: new Date(),
      })

      return cardRef.id
    } catch (error) {
      console.error('Etkinliğe katılma hatası:', error)
      throw error
    }
  },

  async completeQuestion(cardId: string, questionId: string): Promise<void> {
    const cardRef = doc(db, 'bingoCards', cardId)
    const cardDoc = await getDoc(cardRef)
    
    if (!cardDoc.exists()) throw new Error('Bingo kartı bulunamadı')
    
    const card = cardDoc.data() as BingoCard
    if (card.completedQuestions.includes(questionId)) {
      throw new Error('Bu soru zaten tamamlanmış')
    }

    await updateDoc(cardRef, {
      completedQuestions: [...card.completedQuestions, questionId],
      updatedAt: new Date().toISOString(),
    })
  },

  async verifyQRCode(data: {
    cardId: string
    questionId: string
    userId: string
    timestamp: number
  }): Promise<boolean> {
    // QR kod doğrulama mantığı
    const now = Date.now()
    const isValid = now - data.timestamp < 5 * 60 * 1000 // 5 dakika geçerli
    return isValid
  },
}