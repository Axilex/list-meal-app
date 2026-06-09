import type { Recipe, RecipeDraft, RecipeIngredient } from '@/domain/models'
import type {
  IngredientRepository,
  RecipeRepository,
} from '@/domain/repositories'
import type { RecipeService } from '@/domain/services'
import { newId } from '@/shared/id'

export type SaveRecipeResult =
  | { ok: true; recipe: Recipe }
  | { ok: false; errors: string[] }

export class SaveRecipeUseCase {
  constructor(
    private readonly recipeRepo: RecipeRepository,
    private readonly ingredientRepo: IngredientRepository,
    private readonly recipeService: RecipeService,
  ) {}

  async execute(draft: RecipeDraft): Promise<SaveRecipeResult> {
    const errors = this.recipeService.validate(draft)
    if (errors.length > 0) return { ok: false, errors }

    // Find-or-create des ingrédients par nom (insensible à la casse)
    const ingredients: RecipeIngredient[] = []
    for (const row of draft.ingredients) {
      const name = row.name.trim()
      let ingredient = await this.ingredientRepo.findByName(name)
      if (!ingredient) {
        ingredient = { id: newId(), name, defaultUnit: row.unit }
        await this.ingredientRepo.save(ingredient)
      }
      ingredients.push({
        ingredientId: ingredient.id,
        quantity: row.quantity,
        unit: row.unit,
        note: row.note?.trim() || undefined,
      })
    }

    const steps = (draft.steps ?? [])
      .map((s) => ({
        action: s.action.trim(),
        detail: s.detail?.trim() || undefined,
        // Le champ nombre du formulaire peut contenir '' ou une valeur ≤ 0
        durationMin: s.durationMin && s.durationMin > 0 ? s.durationMin : undefined,
      }))
      .filter((s) => s.action !== '')

    const recipe: Recipe = {
      id: draft.id ?? newId(),
      name: draft.name.trim(),
      servings: draft.servings,
      ingredients,
      steps: steps.length > 0 ? steps : undefined,
      instructions: draft.instructions?.trim() || undefined,
    }
    await this.recipeRepo.save(recipe)
    return { ok: true, recipe }
  }
}
