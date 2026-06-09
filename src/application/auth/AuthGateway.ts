// Port d'authentification : la UI ne connaît que cette interface, comme pour
// les repositories. L'implémentation Firebase est branchée au composition root.
export interface AuthUser {
  email: string | null
}

export type SignInResult = { ok: true } | { ok: false; error: string }

export interface AuthGateway {
  /** Abonne aux changements de session ; retourne la fonction de désabonnement. */
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void
  signIn(email: string, password: string): Promise<SignInResult>
  signOut(): Promise<void>
}
