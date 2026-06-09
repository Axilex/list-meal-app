import { describe, expect, it } from 'vitest'
import { ExportDataUseCase } from './ExportDataUseCase'
import {
  InMemoryIngredientRepository,
  InMemoryMealPlanRepository,
  InMemoryRecipeRepository,
  InMemoryShoppingListRepository,
} from './fakes'
import type { Ingredient, MealPlan, Recipe, ShoppingList } from '@/domain/models'

const recipe: Recipe = {
  id: 'rec-1',
  name: 'Riz à la tomate',
  servings: 2,
  ingredients: [{ ingredientId: 'ing-1', quantity: 200, unit: 'g' }],
}

const ingredient: Ingredient = { id: 'ing-1', name: 'Riz', defaultUnit: 'g' }

const plan: MealPlan = {
  id: 'plan-1',
  name: 'Plan',
  slots: [
    { id: 'slot-1', date: '2026-06-08', mealType: 'dinner', recipeId: 'rec-1', servings: 2 },
  ],
}

const list: ShoppingList = {
  generatedAt: '2026-06-08T10:00:00.000Z',
  weekStart: '2026-06-08',
  items: [
    { ingredientId: 'ing-1', name: 'Riz', totalQuantity: 200, unit: 'g', checked: false },
  ],
}

describe('ExportDataUseCase', () => {
  it('rassemble toutes les données avec la version du format', async () => {
    const useCase = new ExportDataUseCase(
      new InMemoryRecipeRepository([recipe]),
      new InMemoryIngredientRepository([ingredient]),
      new InMemoryMealPlanRepository(plan),
      new InMemoryShoppingListRepository(list),
    )

    const data = await useCase.execute()

    expect(data.version).toBe(1)
    expect(data.exportedAt).toBeTruthy()
    expect(data.recipes).toEqual([recipe])
    expect(data.ingredients).toEqual([ingredient])
    expect(data.mealPlan).toEqual(plan)
    expect(data.shoppingList).toEqual(list)
  })

  it('exporte null pour le plan et la liste quand rien n’est persisté', async () => {
    const useCase = new ExportDataUseCase(
      new InMemoryRecipeRepository(),
      new InMemoryIngredientRepository(),
      new InMemoryMealPlanRepository(),
      new InMemoryShoppingListRepository(),
    )

    const data = await useCase.execute()

    expect(data.recipes).toEqual([])
    expect(data.ingredients).toEqual([])
    expect(data.mealPlan).toBeNull()
    expect(data.shoppingList).toBeNull()
  })
})
