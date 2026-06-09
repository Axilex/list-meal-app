export type MealType = 'lunch' | 'dinner'

export interface MealSlot {
  id: string
  date: string // ISO string, ex: '2026-06-06'
  mealType: MealType
  recipeId: string // référence à Recipe
  servings: number // nb de portions pour ce repas
}
