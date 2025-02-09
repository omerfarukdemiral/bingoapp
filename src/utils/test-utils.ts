import { auth, db } from '@/config/firebase'
import { collection, addDoc, Timestamp, doc, setDoc } from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import type { User } from '@/types/user'
import type { Event, EventParticipant, BingoCard } from '@/types/event'

export const createTestUsers = async (count: number = 25) => {
  const users: User[] = []
  
  for (let i = 0; i < count; i++) {
    try {
      // Test kullanıcısı oluştur
      const email = `test${i + 1}@test.com`
      const password = 'test123'
      const name = `Test User ${i + 1}`
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const uid = userCredential.user.uid

      const userData: User = {
        id: uid,
        email,
        name,
        role: 'user',
        isActive: true,
        totalPoints: 0,
        completedEvents: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Firestore'a kullanıcı verilerini kaydet
      await setDoc(doc(db, 'users', uid), userData)
      users.push(userData)
      
      console.log(`✅ Test kullanıcısı oluşturuldu: ${email}`)
    } catch (error) {
      console.error(`❌ Test kullanıcısı oluşturulurken hata: ${error}`)
    }
  }

  return users
}

export const joinTestUsersToEvent = async (eventId: string, users: User[]) => {
  for (const user of users) {
    try {
      // Bingo kartı oluştur
      const questions = generateRandomQuestions()
      const cardRef = await addDoc(collection(db, 'bingo_cards'), {
        eventId,
        questions,
        completedQuestions: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })

      // Etkinliğe katılım kaydı oluştur
      const participantRef = await addDoc(collection(db, 'event_participants'), {
        eventId,
        userId: user.id,
        cardId: cardRef.id,
        points: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })

      console.log(`✅ ${user.email} etkinliğe katıldı`)
    } catch (error) {
      console.error(`❌ Etkinliğe katılım hatası (${user.email}): ${error}`)
    }
  }
}

const generateRandomQuestions = () => {
  const questions = [
    'Farklı bir ülkede yaşamış biriyle tanış',
    'Kendi şirketini kurmuş biriyle tanış',
    'Üç dil bilen biriyle tanış',
    'Bir müzik aleti çalan biriyle tanış',
    'Bir startup kurucusuyla tanış',
    'Yazılım geliştirici olan biriyle tanış',
    'Bir kitap yazmış biriyle tanış',
    'Bir patent sahibi olan biriyle tanış',
    'Bir sosyal sorumluluk projesinde yer almış biriyle tanış',
    'Bir TEDx konuşması yapmış biriyle tanış',
    'Bir ürün yöneticisiyle tanış',
    'Bir tasarımcıyla tanış',
    'Bir pazarlama uzmanıyla tanış',
    'Bir veri bilimciyle tanış',
    'Bir yapay zeka uzmanıyla tanış',
    'Bir blockchain geliştiricisiyle tanış',
    'Bir UX araştırmacısıyla tanış',
    'Bir growth hackerla tanış',
    'Bir yatırımcıyla tanış',
    'Bir mentörle tanış',
    'Bir freelancerla tanış',
    'Bir içerik üreticisiyle tanış',
    'Bir topluluk yöneticisiyle tanış',
    'Bir influencerla tanış',
    'Bir podcast yapımcısıyla tanış'
  ]

  // Soruları karıştır ve 25 tanesini seç
  return questions
    .sort(() => Math.random() - 0.5)
    .slice(0, 25)
    .map((text, index) => ({
      id: `q${index + 1}`,
      text,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }))
}

export const simulateQuestionCompletions = async (eventId: string, users: User[], completionRate: number = 0.6) => {
  try {
    // Etkinliğe katılan kullanıcıların kartlarını al
    const participantsSnapshot = await db
      .collection('event_participants')
      .where('eventId', '==', eventId)
      .get()

    for (const participantDoc of participantsSnapshot.docs) {
      const participant = participantDoc.data() as EventParticipant
      const cardDoc = await db.doc(`bingo_cards/${participant.cardId}`).get()
      const card = cardDoc.data() as BingoCard

      // Rastgele soruları tamamla
      const questionsToComplete = Math.floor(card.questions.length * completionRate)
      const randomQuestions = card.questions
        .sort(() => Math.random() - 0.5)
        .slice(0, questionsToComplete)
        .map(q => q.id)

      // Kartı güncelle
      await cardDoc.ref.update({
        completedQuestions: randomQuestions,
        updatedAt: Timestamp.now()
      })

      console.log(`✅ ${participant.userId} için ${questionsToComplete} soru tamamlandı`)
    }
  } catch (error) {
    console.error('❌ Soru tamamlama simülasyonu hatası:', error)
  }
} 