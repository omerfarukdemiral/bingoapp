import { collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, orderBy, limit as firestoreLimit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { User, UserProfile, UserStats } from '@/types/user'
import { eventService } from './event.service'
import { setDoc } from 'firebase/firestore'
import { Timestamp } from 'firebase/firestore'

const COLLECTION_NAME = 'users'

export const userService = {
  async createUser(uid: string, userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user: User = {
      id: uid,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    try {
      await setDoc(doc(db, 'users', uid), user)
      console.log('👤 Yeni kullanıcı oluşturuldu:', user.name)
      return user
    } catch (error) {
      console.error('Kullanıcı oluşturma hatası:', error)
      throw error
    }
  },

  async getUser(uid: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (!userDoc.exists()) {
        console.log('❌ Kullanıcı bulunamadı:', uid)
        return null
      }

      const data = userDoc.data()
      if (!data) return null

      const userData: User = {
        id: uid,
        name: data.name,
        email: data.email,
        avatarUrl: data.avatarUrl,
        role: data.role as 'user' | 'admin',
        isActive: data.isActive,
        totalPoints: data.totalPoints,
        completedEvents: data.completedEvents,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
      }

      console.log('✅ Kullanıcı verileri getirildi:', userData)
      return userData
    } catch (error) {
      console.error('Kullanıcı getirme hatası:', error)
      throw error
    }
  },

  async getAllUsers(): Promise<User[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as User)
  },

  async updateUser(uid: string, data: Partial<User>): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid)
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date(),
      })
      console.log('✏️ Kullanıcı güncellendi:', uid)
    } catch (error) {
      console.error('Kullanıcı güncelleme hatası:', error)
      throw error
    }
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const q = query(
      collection(db, 'userProfiles'),
      where('userId', '==', userId)
    )
    const querySnapshot = await getDocs(q)
    const doc = querySnapshot.docs[0]
    return doc ? { id: doc.id, ...doc.data() } as UserProfile : null
  },

  async updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
    const q = query(
      collection(db, 'userProfiles'),
      where('userId', '==', userId)
    )
    const querySnapshot = await getDocs(q)
    const doc = querySnapshot.docs[0]
    
    if (doc) {
      await updateDoc(doc.ref, {
        ...profile,
        updatedAt: new Date(),
      })
    } else {
      await addDoc(collection(db, 'userProfiles'), {
        userId,
        ...profile,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }
  },

  async getUserStats(userId: string): Promise<UserStats> {
    try {
      // Kullanıcının katıldığı etkinlikleri bul
      const events = await eventService.getActiveEvents()
      let totalEvents = 0
      let completedEvents = 0
      let totalPoints = 0
      let bingoCount = 0
      let totalCompletionTime = 0
      let fastestCompletion = Infinity

      for (const event of events) {
        const participants = await eventService.getEventParticipants(event.id)
        const participant = participants.find(p => p.userId === userId)
        
        if (participant) {
          totalEvents++
          totalPoints += participant.points

          const card = await eventService.getBingoCard(participant.cardId)
          if (card) {
            // Bingo kontrolü
            const hasBingo = this.checkBingo(card.completedQuestions, card.questions)
            if (hasBingo) {
              bingoCount++
              completedEvents++
            }

            // Tamamlanma süresi hesaplama
            if (participant.completedAt) {
              const completionTime = new Date(participant.completedAt).getTime() - new Date(card.createdAt).getTime()
              totalCompletionTime += completionTime
              if (completionTime < fastestCompletion) {
                fastestCompletion = completionTime
              }
            }
          }
        }
      }

      return {
        totalEvents,
        completedEvents,
        totalPoints,
        bingoCount,
        averageCompletionTime: totalEvents > 0 ? totalCompletionTime / totalEvents / 60000 : 0, // dakika cinsinden
        fastestCompletion: fastestCompletion === Infinity ? 0 : fastestCompletion / 60000, // dakika cinsinden
      }
    } catch (error) {
      console.error('Kullanıcı istatistikleri hesaplanırken hata:', error)
      return {
        totalEvents: 0,
        completedEvents: 0,
        totalPoints: 0,
        bingoCount: 0,
        averageCompletionTime: 0,
        fastestCompletion: 0,
      }
    }
  },

  async getTopUsers(limit: number = 10): Promise<User[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy('totalPoints', 'desc'),
      orderBy('completedEvents', 'desc'),
      where('role', '==', 'user'),
      firestoreLimit(limit)
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as User)
  },

  // Yardımcı fonksiyonlar
  checkBingo(completed: string[], questions: { id: string }[]): boolean {
    const size = 5
    const matrix = Array(size).fill(null).map(() => Array(size).fill(false))
    
    completed.forEach(id => {
      const index = questions.findIndex(q => q.id === id)
      if (index !== -1) {
        const row = Math.floor(index / size)
        const col = index % size
        matrix[row][col] = true
      }
    })

    // Yatay kontrol
    for (let row = 0; row < size; row++) {
      if (matrix[row].every(cell => cell)) return true
    }

    // Dikey kontrol
    for (let col = 0; col < size; col++) {
      if (matrix.every(row => row[col])) return true
    }

    // Çapraz kontrol
    if (matrix.every((row, i) => row[i])) return true
    if (matrix.every((row, i) => row[size - 1 - i])) return true

    return false
  },
} 