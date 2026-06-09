import { describe, expect, it } from 'vitest'
import { DeleteRecipeUseCase } from './DeleteRecipeUseCase'
import {
  InMemoryMealPlanRepository,
  InMemoryRecipeRepository,
} from './fakes'
import { MealPlanService } from '@/domain/services'
import type { Recipe } from '@/domain/models'

const recipe: Recipe = {
  id: 'r-1',
  name: 'Riz à la tomate',
  servings: 2,
  ingredients: [{ ingredientId: 'ing-1', quantity: 200, unit: 'g' }],
}

describe('DeleteRecipeUseCase', () => {
  it('supprime la recette et les repas qui la référencent', async () => {
    const recipeRepo = new InMemoryRecipeRepository([recipe])
    const mealPlanRepo = new InMemoryMealPlanRepository({
      id: 'plan-1',
      name: 'Plan',
      slots: [
        { id: 's-1', date: '2026-06-01', mealType: 'lunch', recipeId: 'r-1', servings: 2 },
        { id: 's-2', date: '2026-06-02', mealType: 'dinner', recipeId: 'r-2', servings: 2 },
      ],
    })
    const useCase = new DeleteRecipeUseCase(
      recipeRepo,
      mealPlanRepo,
      new MealPlanService(),
    )

    await useCase.execute('r-1')

    expect(recipeRepo.recipes).toEqual([])
    expect(mealPlanRepo.plan?.slots.map((s) => s.id)).toEqual(['s-2'])
  })

  it('fonctionne sans plan de repas existant', async () => {
    const recipeRepo = new InMemoryRecipeRepository([recipe])
    const mealPlanRepo = new InMemoryMealPlanRepository(null)
    const useCase = new DeleteRecipeUseCase(
      recipeRepo,
      mealPlanRepo,
      new MealPlanService(),
    )

    await useCase.execute('r-1')

    expect(recipeRepo.recipes).toEqual([])
    expect(mealPlanRepo.plan).toBeNull()
  })
})
