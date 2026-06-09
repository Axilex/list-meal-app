import type { MealPlan } from '@/domain/models'
import { newId } from '@/shared/id'

export function createEmptyMealPlan(): MealPlan {
  return { id: newId(), name: 'Plan de repas', slots: [] }
}
