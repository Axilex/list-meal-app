// Lecture/écriture JSON dans localStorage. Une valeur corrompue est traitée
// comme absente plutôt que de faire planter l'application.
export function readJson<T>(key: string): T | null {
  const raw = localStorage.getItem(key)
  if (raw === null) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}
