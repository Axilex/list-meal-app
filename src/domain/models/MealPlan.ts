import type { MealSlot } from './MealSlot'

export interface MealPlan {
  id: string
  name: string // "Semaine 23" ou "Vacances"
  slots: MealSlot[]
}
