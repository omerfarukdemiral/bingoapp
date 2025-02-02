import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { userService } from './user.service'
import type { User } from '@/types/user'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export const authService = {
  async signUp(email: string, password: string, name: string): Promise<User> {
    const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(firebaseUser, { displayName: name })

    const newUser = {
      email,
      name,
      role: 'user' as const,
      isActive: true,
      totalPoints: 0,
      completedEvents: 0,
    }

    // Firestore'a kullanıcı verilerini kaydet
    await setDoc(doc(db, 'users', firebaseUser.uid), {
      ...newUser,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return {
      id: firebaseUser.uid,
      ...newUser,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  },

  async signInWithGoogle(): Promise<User> {
    const provider = new GoogleAuthProvider()
    const { user: firebaseUser } = await signInWithPopup(auth, provider)
    
    try {
      let userData = await userService.getUser(firebaseUser.uid)
      
      if (!userData) {
        const newUser = {
          name: firebaseUser.displayName || 'İsimsiz Kullanıcı',
          email: firebaseUser.email!,
          avatarUrl: firebaseUser.photoURL || undefined,
          role: 'user' as const,
          isActive: true,
          totalPoints: 0,
          completedEvents: 0,
        }

        await setDoc(doc(db, 'users', firebaseUser.uid), {
          ...newUser,
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        userData = {
          id: firebaseUser.uid,
          ...newUser,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        console.log('🆕 Yeni kullanıcı oluşturuldu:', userData)
      }

      console.log('🎉 Google ile giriş başarılı:', userData)
      return userData
    } catch (error) {
      console.error('Google giriş hatası:', error)
      throw error
    }
  },

  async signIn(email: string, password: string): Promise<User> {
    const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password)
    const userData = await userService.getUser(firebaseUser.uid)
    if (!userData) {
      throw new Error('Kullanıcı verileri bulunamadı')
    }
    console.log('🎉 Email ile giriş başarılı:', userData.name)
    return userData
  },

  async signOut(): Promise<void> {
    await firebaseSignOut(auth)
    console.log('👋 Çıkış yapıldı')
  },

  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email)
  },

  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser
  },

  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await userService.getUser(firebaseUser.uid)
          if (userData) {
            callback(userData)
          } else {
            console.error('Kullanıcı verileri bulunamadı:', firebaseUser.uid)
            callback(null)
          }
        } catch (error) {
          console.error('Kullanıcı verileri getirme hatası:', error)
          callback(null)
        }
      } else {
        callback(null)
      }
    })
  },
} 