import { ref } from 'vue'

// File de toasts éphémères (confirmation d'enregistrement, suppression…).
// Module simple plutôt qu'un store : une seule liste réactive partagée.

export interface Toast {
  id: number
  message: string
  emoji?: string
  tone?: 'error'
}

export const toasts = ref<Toast[]>([])

let nextId = 1

export function showToast(message: string, emoji?: string): void {
  const id = nextId++
  toasts.value.push({ id, message, emoji })
  setTimeout(() => dismissToast(id), 2600)
}

// Échec d'écriture/lecture (Firestore injoignable, quota localStorage…) :
// reste affiché plus longtemps qu'une confirmation.
export function showErrorToast(message: string): void {
  const id = nextId++
  toasts.value.push({ id, message, emoji: '⚠️', tone: 'error' })
  setTimeout(() => dismissToast(id), 5000)
}

export function dismissToast(id: number): void {
  toasts.value = toasts.value.filter((toast) => toast.id !== id)
}
