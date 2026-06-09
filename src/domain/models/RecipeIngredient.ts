import type { Unit } from './Unit'

export interface RecipeIngredient {
  ingredientId: string // référence à Ingredient
  quantity: number // quantité pour la recette entière
  unit: Unit // unité pour cette recette (peut différer de defaultUnit)
  note?: string // "en boîte", "en dés", etc.
}
