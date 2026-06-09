// Dates manipulées en chaînes ISO 'YYYY-MM-DD', en temps local
// (new Date('YYYY-MM-DD') parserait en UTC et décalerait le jour selon le fuseau).
function parseIsoDate(iso: string): Date {
  const [year = 0, month = 1, day = 1] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function toIsoDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayIso(): string {
  return toIsoDate(new Date())
}

export function isValidIsoDate(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false
  const [year = 0, month = 1, day = 1] = iso.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}

export function addDays(iso: string, days: number): string {
  const date = parseIsoDate(iso)
  date.setDate(date.getDate() + days)
  return toIsoDate(date)
}

/** Lundi de la semaine contenant la date donnée. */
export function mondayOf(iso: string): string {
  const date = parseIsoDate(iso)
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7))
  return toIsoDate(date)
}

/** Les 7 dates (lundi → dimanche) de la semaine commençant à weekStart. */
export function weekDates(weekStart: string): string[] {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
}

/** Ex. : 'lundi' */
export function formatWeekday(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(
    parseIsoDate(iso),
  )
}

/** Ex. : 'lundi 8 juin' */
export function formatDayLabel(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(parseIsoDate(iso))
}

/** Ex. : '8 juin' */
export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
  }).format(parseIsoDate(iso))
}
