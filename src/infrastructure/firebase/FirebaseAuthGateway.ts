import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import type {
  AuthGateway,
  AuthUser,
  SignInResult,
} from '@/application/auth/AuthGateway'
import { getFirebaseAuth } from './firebaseApp'

export class FirebaseAuthGateway implements AuthGateway {
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(getFirebaseAuth(), (user) => {
      callback(user ? { email: user.email } : null)
    })
  }

  async signIn(email: string, password: string): Promise<SignInResult> {
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password)
      return { ok: true }
    } catch (error) {
      return { ok: false, error: toFrenchMessage(error) }
    }
  }

  async signOut(): Promise<void> {
    await signOut(getFirebaseAuth())
  }
}

function toFrenchMessage(error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code: unknown }).code)
      : ''
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email ou mot de passe incorrect.'
    case 'auth/invalid-email':
      return 'Adresse email invalide.'
    case 'auth/too-many-requests':
      return 'Trop de tentatives, réessayez dans quelques minutes.'
    case 'auth/network-request-failed':
      return 'Connexion impossible, vérifiez votre réseau.'
    default:
      return 'Échec de la connexion, réessayez.'
  }
}
