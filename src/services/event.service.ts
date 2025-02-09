import { collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, deleteDoc, orderBy, limit, setDoc, increment, Timestamp } from 'firebase/firestore'
import { db } from '@/config/firebase'
import type { Event, BingoCard, EventParticipant, BingoCardMatch, CompletedQuestion, Question } from '@/types/event'
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

interface IEventService {
  createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<string>
  getEvent(id: string): Promise<Event | null>
  getActiveEvents(): Promise<Event[]>
  getEventParticipants(eventId: string): Promise<EventParticipant[]>
  getBingoCard(cardId: string): Promise<BingoCard | null>
  hasEventPermission(userId: string, eventId: string): Promise<boolean>
  updateEventDetails(eventId: string, userId: string, data: Partial<Event>): Promise<void>
  removeEvent(eventId: string, userId: string): Promise<void>
  updateEventStatus(eventId: string, userId: string, isActive: boolean): Promise<void>
  updateParticipantLimit(eventId: string, userId: string, limit: number): Promise<void>
  checkEventDate(eventId: string): Promise<{ isStarted: boolean; message?: string }>
  canJoinEvent(userId: string, eventId: string): Promise<boolean>
  joinEvent(eventId: string, userId: string, surveyAnswers: { questionId: string; answer: string | string[] }[]): Promise<string>
  updateTaskMatches(eventId: string, userId: string, surveyAnswers: { questionId: string; answer: string | string[] }[]): Promise<void>
  completeQuestion(cardId: string, questionId: string, userId: string, verifiedByUserId: string): Promise<void>
  verifyQRCode(data: { 
    cardId: string; 
    questionId: string; 
    userId: string; 
    timestamp: number;
    verifiedByUserId: string;
  }): Promise<boolean>
  removeParticipant(eventId: string, userId: string): Promise<void>
}

const eventService: IEventService = {
  async createEvent(eventData) {
    try {
      const eventDataToSave = {
        ...eventData,
        currentParticipants: 0,
        startDate: Timestamp.fromDate(eventData.startDate),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }

      const docRef = await addDoc(collection(db, COLLECTION_NAME), eventDataToSave)
      return docRef.id
    } catch (error) {
      console.error('Etkinlik oluşturma hatası:', error)
      throw error
    }
  },

  async getEvent(id) {
    try {
      const eventRef = doc(db, COLLECTION_NAME, id)
      const eventDoc = await getDoc(eventRef)
      
      if (!eventDoc.exists()) return null
      
      const data = eventDoc.data()
      return {
        ...data,
        id: eventDoc.id,
        startDate: data.startDate.toDate(),
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as Event
    } catch (error) {
      console.error('Etkinlik getirme hatası:', error)
      return null
    }
  },

  async getActiveEvents() {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          ...data,
          id: doc.id,
          startDate: data.startDate.toDate(),
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        } as Event
      })
    } catch (error) {
      console.error('Etkinlikleri getirme hatası:', error)
      throw error
    }
  },

  async getEventParticipants(eventId) {
    try {
      const q = query(
        collection(db, 'event_participants'),
        where('eventId', '==', eventId)
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as EventParticipant)
    } catch (error) {
      console.error('Katılımcıları getirme hatası:', error)
      throw error
    }
  },

  async getBingoCard(cardId) {
    try {
      const docRef = doc(db, 'bingo_cards', cardId)
      const docSnap = await getDoc(docRef)
      if (!docSnap.exists()) return null

      const data = docSnap.data()
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
        completedQuestions: data.completedQuestions.map((q: any) => ({
          ...q,
          completedAt: q.completedAt.toDate()
        }))
      } as BingoCard
    } catch (error) {
      console.error('Bingo kartı getirme hatası:', error)
      return null
    }
  },

  async hasEventPermission(userId, eventId) {
    try {
      const user = await userService.getUser(userId)
      if (!user) return false

      if (user.role === 'admin') return true

      const event = await this.getEvent(eventId)
      return event?.adminId === userId
    } catch (error) {
      console.error('Yetki kontrolü hatası:', error)
      return false
    }
  },

  async updateEventDetails(eventId, userId, data) {
    if (!await this.hasEventPermission(userId, eventId)) {
      throw new Error('Bu işlem için yetkiniz bulunmamaktadır.')
    }

    const eventRef = doc(db, COLLECTION_NAME, eventId)
    await updateDoc(eventRef, {
      ...data,
      updatedAt: Timestamp.now()
    })
  },

  async removeEvent(eventId, userId) {
    try {
      if (!await this.hasEventPermission(userId, eventId)) {
        throw new Error('Bu işlem için yetkiniz bulunmamaktadır.')
      }

      // Bingo kartlarını sil
      const cardsQuery = query(
        collection(db, 'bingo_cards'),
        where('eventId', '==', eventId)
      )
      const cardsSnapshot = await getDocs(cardsQuery)
      const cardDeletePromises = cardsSnapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(cardDeletePromises)

      // Katılımcı kayıtlarını sil
      const participantsQuery = query(
        collection(db, 'event_participants'),
        where('eventId', '==', eventId)
      )
      const participantsSnapshot = await getDocs(participantsQuery)
      const participantDeletePromises = participantsSnapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(participantDeletePromises)

      // Etkinliği sil
      await deleteDoc(doc(db, COLLECTION_NAME, eventId))
    } catch (error) {
      console.error('Etkinlik silme hatası:', error)
      throw error
    }
  },

  async updateEventStatus(eventId, userId, isActive) {
    if (!await this.hasEventPermission(userId, eventId)) {
      throw new Error('Bu işlem için yetkiniz bulunmamaktadır.')
    }

    const eventRef = doc(db, COLLECTION_NAME, eventId)
    await updateDoc(eventRef, {
      status: isActive ? 'active' : 'completed',
      updatedAt: Timestamp.now()
    })
  },

  async updateParticipantLimit(eventId, userId, limit) {
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

    if (event.currentParticipants > limit) {
      throw new Error('Yeni limit mevcut katılımcı sayısından düşük olamaz.')
    }

    const eventRef = doc(db, COLLECTION_NAME, eventId)
    await updateDoc(eventRef, {
      maxParticipants: limit,
      updatedAt: Timestamp.now()
    })
  },

  async checkEventDate(eventId) {
    const event = await this.getEvent(eventId)
    if (!event) {
      throw new Error('Etkinlik bulunamadı')
    }

    const now = new Date()
    const startDate = event.startDate
    const isStarted = now >= startDate

    const isTimeExpired = event.isTimeboxed && event.duration 
      ? now > new Date(startDate.getTime() + event.duration * 60000)
      : false

    return {
      isStarted,
      message: now < startDate
        ? `Etkinlik ${startDate.toLocaleDateString('tr-TR')} tarihinde başlayacak`
        : isTimeExpired
        ? 'Etkinlik süresi doldu'
        : 'Etkinlik devam ediyor',
    }
  },

  async canJoinEvent(userId, eventId) {
    try {
      const event = await this.getEvent(eventId)
      if (!event) return false

      if (event.adminId === userId) return false

      if (event.currentParticipants >= event.maxParticipants) return false

      const q = query(
        collection(db, 'event_participants'),
        where('eventId', '==', eventId),
        where('userId', '==', userId)
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.empty
    } catch (error) {
      console.error('Katılım kontrolü hatası:', error)
      return false
    }
  },

  async joinEvent(eventId, userId, surveyAnswers) {
    try {
      const event = await this.getEvent(eventId)
      if (!event) throw new Error('Etkinlik bulunamadı')

      if (!await this.canJoinEvent(userId, eventId)) {
        throw new Error('Bu etkinliğe katılamazsınız')
      }

      const user = await userService.getUser(userId)
      if (!user) throw new Error('Kullanıcı bulunamadı')

      const questions: Question[] = event.bingoTasks.map(task => ({
        id: task.id,
        text: task.text,
        category: task.category,
        points: task.points,
        matches: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }))

      const cardRef = await addDoc(collection(db, 'bingo_cards'), {
        eventId,
        questions,
        completedQuestions: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })

      await addDoc(collection(db, 'event_participants'), {
        eventId,
        userId,
        cardId: cardRef.id,
        points: 0,
        surveyAnswers,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })

      const eventRef = doc(db, COLLECTION_NAME, eventId)
      await updateDoc(eventRef, {
        currentParticipants: increment(1),
        updatedAt: Timestamp.now()
      })

      await this.updateTaskMatches(eventId, userId, surveyAnswers)

      return cardRef.id
    } catch (error) {
      console.error('Etkinliğe katılım hatası:', error)
      throw error
    }
  },

  async updateTaskMatches(eventId, userId, surveyAnswers) {
    try {
      const event = await this.getEvent(eventId)
      if (!event) throw new Error('Etkinlik bulunamadı')

      const user = await userService.getUser(userId)
      if (!user) throw new Error('Kullanıcı bulunamadı')

      const q = query(
        collection(db, 'bingo_cards'),
        where('eventId', '==', eventId)
      )
      const querySnapshot = await getDocs(q)

      const updatePromises = querySnapshot.docs.map(async doc => {
        const card = doc.data() as BingoCard
        const updatedQuestions = card.questions.map(question => {
          // Görev kategorisi ile ilgili cevapları bul
          const relevantAnswers = surveyAnswers.filter(answer => {
            const answerText = Array.isArray(answer.answer) ? answer.answer.join(' ') : answer.answer
            
            // Kategori bazlı eşleşme kontrolü
            if (question.category === 'tech-stack' && answer.questionId === 'tech-stack') {
              return true
            }
            if (question.category === 'dev-role' && answer.questionId === 'role') {
              return true
            }
            if (question.category === 'interests' && answer.questionId === 'interests') {
              return true
            }
            
            // Genel metin bazlı eşleşme kontrolü
            return question.text.toLowerCase().includes(answerText.toLowerCase()) ||
                   answerText.toLowerCase().includes(question.text.toLowerCase())
          })

          if (relevantAnswers.length > 0) {
            // Kullanıcı zaten eşleşmiş mi kontrol et
            const existingMatch = question.matches?.find(m => m.userId === userId)
            if (existingMatch) {
              return question // Zaten eşleşme varsa değişiklik yapma
            }

            const newMatch: BingoCardMatch = {
              userId,
              user: {
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl
              },
              surveyAnswers: relevantAnswers,
              matchedAt: new Date()
            }

            return {
              ...question,
              matches: [...(question.matches || []), newMatch],
              updatedAt: new Date().toISOString()
            }
          }

          return question
        })

        return updateDoc(doc.ref, {
          questions: updatedQuestions,
          updatedAt: Timestamp.now()
        })
      })

      await Promise.all(updatePromises)
    } catch (error) {
      console.error('Görev eşleştirme hatası:', error)
      throw error
    }
  },

  async completeQuestion(cardId, questionId, userId, verifiedByUserId) {
    try {
      const cardRef = doc(db, 'bingo_cards', cardId)
      const cardDoc = await getDoc(cardRef)

      if (!cardDoc.exists()) {
        throw new Error('Bingo kartı bulunamadı')
      }

      const card = cardDoc.data() as BingoCard
      const question = card.questions.find(q => q.id === questionId)
      
      if (!question) {
        throw new Error('Soru bulunamadı')
      }

      const verifyingUserMatch = question.matches.find(m => m.userId === verifiedByUserId)
      if (!verifyingUserMatch) {
        throw new Error('Bu görevi doğrulama yetkiniz yok')
      }

      const completedQuestion: CompletedQuestion = {
        id: questionId,
        completedBy: userId,
        completedAt: new Date(),
        verifiedBy: verifiedByUserId
      }

      await updateDoc(cardRef, {
        completedQuestions: [...card.completedQuestions, completedQuestion],
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Soru tamamlama hatası:', error)
      throw error
    }
  },

  async verifyQRCode(data) {
    try {
      const now = Date.now()
      if (now - data.timestamp > 5 * 60 * 1000) {
        return false
      }

      const cardRef = doc(db, 'bingo_cards', data.cardId)
      const cardDoc = await getDoc(cardRef)
      
      if (!cardDoc.exists()) return false
      
      const card = cardDoc.data() as BingoCard
      const question = card.questions.find(q => q.id === data.questionId)
      
      if (!question) return false

      return question.matches.some(match => match.userId === data.verifiedByUserId)
    } catch (error) {
      console.error('QR kod doğrulama hatası:', error)
      return false
    }
  },

  async removeParticipant(eventId: string, userId: string) {
    try {
      // Katılımcı kaydını bul
      const participantsQuery = query(
        collection(db, 'event_participants'),
        where('eventId', '==', eventId),
        where('userId', '==', userId)
      )
      const participantSnapshot = await getDocs(participantsQuery)
      
      if (participantSnapshot.empty) {
        throw new Error('Katılımcı bulunamadı')
      }

      const participantDoc = participantSnapshot.docs[0]
      const participant = participantDoc.data() as EventParticipant

      // Bingo kartını sil
      if (participant.cardId) {
        await deleteDoc(doc(db, 'bingo_cards', participant.cardId))
      }

      // Katılımcı kaydını sil
      await deleteDoc(participantDoc.ref)

      // Etkinlikteki katılımcı sayısını güncelle
      const eventRef = doc(db, COLLECTION_NAME, eventId)
      await updateDoc(eventRef, {
        currentParticipants: increment(-1)
      })
    } catch (error) {
      console.error('Katılımcı silme hatası:', error)
      throw error
    }
  }
}

export { eventService, type IEventService }