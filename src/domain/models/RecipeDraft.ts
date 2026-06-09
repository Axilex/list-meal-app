import type { RecipeStep } from './RecipeStep'
import type { Unit } from './Unit'

// Saisie du formulaire de recette : les ingrédients sont identifiés par nom,
// résolus en Ingredient (find-or-create) au moment de la sauvegarde.
export interface RecipeIngredientDraft {
  name: string
  quantity: number
  unit: Unit
  note?: string
}

export interface RecipeDraft {
  id?: string // absent = création
  name: string
  servings: number
  ingredients: RecipeIngredientDraft[]
  steps?: RecipeStep[]
  instructions?: string
}
