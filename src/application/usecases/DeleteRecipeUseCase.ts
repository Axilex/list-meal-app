import type {
  MealPlanRepository,
  RecipeRepository,
} from '@/domain/repositories'
import type { MealPlanService } from '@/domain/services'

export class DeleteRecipeUseCase {
  constructor(
    private readonly recipeRepo: RecipeRepository,
    private readonly mealPlanRepo: MealPlanRepository,
    private readonly mealPlanService: MealPlanService,
  ) {}

  /** Supprime la recette et retire en cascade les repas qui la référencent. */
  async execute(recipeId: string): Promise<void> {
    await this.recipeRepo.delete(recipeId)

    const plan = await this.mealPlanRepo.getCurrent()
    if (!plan) return
    const cleaned = this.mealPlanService.removeSlotsByRecipe(plan, recipeId)
    if (cleaned.slots.length !== plan.slots.length) {
      await this.mealPlanRepo.save(cleaned)
    }
  }
}
