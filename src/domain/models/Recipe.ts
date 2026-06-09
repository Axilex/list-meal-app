import type { RecipeIngredient } from './RecipeIngredient'
import type { RecipeStep } from './RecipeStep'

export interface Recipe {
  id: string
  name: string
  servings: number // nombre de portions de base
  ingredients: RecipeIngredient[]
  steps?: RecipeStep[] // étapes de préparation
  instructions?: string // texte libre hérité (avant les étapes), converti à l'édition
}
