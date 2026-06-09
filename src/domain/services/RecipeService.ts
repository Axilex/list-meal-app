import type { RecipeDraft } from '../models'

export class RecipeService {
  /** Valide une saisie de recette ; retourne la liste des erreurs (vide = valide). */
  validate(draft: RecipeDraft): string[] {
    const errors: string[] = []
    if (draft.name.trim() === '') {
      errors.push('Le nom de la recette est obligatoire.')
    }
    if (!(draft.servings > 0)) {
      errors.push('Le nombre de portions doit être supérieur à 0.')
    }
    if (draft.ingredients.length === 0) {
      errors.push('La recette doit contenir au moins un ingrédient.')
    }
    draft.ingredients.forEach((row, index) => {
      if (row.name.trim() === '') {
        errors.push(`Ingrédient ${index + 1} : le nom est obligatoire.`)
      }
      if (!(row.quantity > 0)) {
        errors.push(`Ingrédient ${index + 1} : la quantité doit être supérieure à 0.`)
      }
    })
    return errors
  }
}
