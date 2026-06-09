import type { MealType, Unit } from '@/domain/models'

export const UNIT_LABELS: Record<Unit, string> = {
  g: 'g',
  ml: 'ml',
  piece: 'pièce(s)',
  tbsp: 'c. à s.',
  tsp: 'c. à c.',
  custom: 'autre',
}

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  lunch: 'Midi',
  dinner: 'Soir',
}

/** Actions préremplies pour les étapes de recette (l'action stockée est le texte seul). */
export const STEP_ACTIONS: { action: string; emoji: string }[] = [
  { action: 'Préparer', emoji: '🥣' },
  { action: 'Couper', emoji: '🔪' },
  { action: 'Éplucher', emoji: '🥕' },
  { action: 'Mélanger', emoji: '🥄' },
  { action: 'Faire revenir', emoji: '🍳' },
  { action: 'Cuire', emoji: '🍲' },
  { action: 'Enfourner', emoji: '⏲️' },
  { action: 'Assaisonner', emoji: '🧂' },
  { action: 'Réserver', emoji: '🧊' },
  { action: 'Servir', emoji: '🍽️' },
]

export function stepActionEmoji(action: string): string | undefined {
  return STEP_ACTIONS.find((a) => a.action === action)?.emoji
}

/** « 1 portion », « 2 portions » — pluriel simple en s. */
export function countLabel(count: number, singular: string): string {
  return `${count} ${singular}${count > 1 ? 's' : ''}`
}
