import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore'
import { getAuth, type Auth } from 'firebase/auth'

// Config web Firebase lue depuis .env.local (voir .env.example).
const env = import.meta.env

export function isFirebaseConfigured(): boolean {
  return Boolean(env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID)
}

let app: FirebaseApp | undefined
let db: Firestore | undefined
let auth: Auth | undefined

function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = initializeApp({
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      appId: env.VITE_FIREBASE_APP_ID,
    })
  }
  return app
}

export function getDb(): Firestore {
  if (!db) {
    // Cache local persistant (IndexedDB) : l'app reste consultable hors
    // ligne et les écritures sont resynchronisées au retour du réseau.
    db = initializeFirestore(getFirebaseApp(), {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    })
  }
  return db
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp())
  }
  return auth
}
