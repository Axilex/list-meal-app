import type {
  IngredientRepository,
  MealPlanRepository,
  RecipeRepository,
  ShoppingListRepository,
} from '@/domain/repositories'
import type { AppDataExport } from './ExportDataUseCase'

export type ImportDataResult = { ok: true } | { ok: false; error: string }

function hasIdAndName(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { id?: unknown }).id === 'string' &&
    typeof (value as { name?: unknown }).name === 'string'
  )
}

// Validation de surface : on vérifie la structure du fichier, pas chaque
// champ — un export produit par l'app est toujours plus précis que ça.
function parseExport(raw: unknown): AppDataExport | null {
  if (typeof raw !== 'object' || raw === null) return null
  const data = raw as Record<string, unknown>
  if (data.version !== 1) return null
  if (!Array.isArray(data.recipes) || !data.recipes.every(hasIdAndName)) {
    return null
  }
  if (!Array.isArray(data.ingredients) || !data.ingredients.every(hasIdAndName)) {
    return null
  }
  if (data.mealPlan != null && !hasIdAndName(data.mealPlan)) return null
  if (
    data.shoppingList != null &&
    !Array.isArray((data.shoppingList as { items?: unknown }).items)
  ) {
    return null
  }
  return data as unknown as AppDataExport
}

export class ImportDataUseCase {
  constructor(
    private readonly recipeRepo: RecipeRepository,
    private readonly ingredientRepo: IngredientRepository,
    private readonly mealPlanRepo: MealPlanRepository,
    private readonly shoppingListRepo: ShoppingListRepository,
  ) {}

  /**
   * Réimporte un export JSON : ajoute les recettes et ingrédients du fichier
   * (ceux portant le même id sont remplacés), et remplace le plan et la
   * liste de courses s'ils sont présents dans le fichier.
   */
  async execute(raw: unknown): Promise<ImportDataResult> {
    const data = parseExport(raw)
    if (!data) {
      return {
        ok: false,
        error: 'Ce fichier n’est pas un export valide de l’application.',
      }
    }
    for (const ingredient of data.ingredients) {
      await this.ingredientRepo.save(ingredient)
    }
    for (const recipe of data.recipes) {
      await this.recipeRepo.save(recipe)
    }
    if (data.mealPlan) await this.mealPlanRepo.save(data.mealPlan)
    if (data.shoppingList) await this.shoppingListRepo.save(data.shoppingList)
    return { ok: true }
  }
}
