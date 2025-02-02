import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  type User as FirebaseUser,
} from 'firebase/auth'
import { auth } from '@/config/firebase'
import { userService } from './user.service'
import type { User } from '@/types/user'

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

export const authService = {
  async signUp(email: string, password: string, name: string): Promise<User> {
    const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(firebaseUser, { displayName: name })

    const user: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
      email,
      name,
      role: 'user',
      createdEvents: [],
      participatedEvents: [],
      totalPoints: 0,
    }

    const userId = await userService.createUser(user)
    return {
      ...user,
      id: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  },

  async signInWithGoogle(): Promise<User> {
    const { user: firebaseUser } = await signInWithPopup(auth, googleProvider)
    
    const existingUser = await userService.getUser(firebaseUser.uid)
    if (existingUser) return existingUser

    const user: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
      email: firebaseUser.email!,
      name: firebaseUser.displayName || 'İsimsiz Kullanıcı',
      avatarUrl: firebaseUser.photoURL || undefined,
      role: 'user',
      createdEvents: [],
      participatedEvents: [],
      totalPoints: 0,
    }

    const userId = await userService.createUser(user)
    return {
      ...user,
      id: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  },

  async signIn(email: string, password: string): Promise<FirebaseUser> {
    const { user } = await signInWithEmailAndPassword(auth, email, password)
    return user
  },

  async signOut(): Promise<void> {
    await signOut(auth)
  },

  async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email)
  },

  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser
  },

  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    return auth.onAuthStateChanged(callback)
  },
} 