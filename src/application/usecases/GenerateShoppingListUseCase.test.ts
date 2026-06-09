import { describe, expect, it } from 'vitest'
import { GenerateShoppingListUseCase } from './GenerateShoppingListUseCase'
import {
  InMemoryIngredientRepository,
  InMemoryMealPlanRepository,
  InMemoryRecipeRepository,
  InMemoryShoppingListRepository,
} from './fakes'
import { ShoppingListService } from '@/domain/services'

describe('GenerateShoppingListUseCase', () => {
  it('génère la liste depuis le plan courant et la persiste', async () => {
    const mealPlanRepo = new InMemoryMealPlanRepository({
      id: 'plan-1',
      name: 'Plan',
      slots: [
        { id: 's-1', date: '2026-06-01', mealType: 'lunch', recipeId: 'r-1', servings: 4 },
      ],
    })
    const recipeRepo = new InMemoryRecipeRepository([
      {
        id: 'r-1',
        name: 'Riz à la tomate',
        servings: 2,
        ingredients: [{ ingredientId: 'ing-1', quantity: 200, unit: 'g' }],
      },
    ])
    const ingredientRepo = new InMemoryIngredientRepository([
      { id: 'ing-1', name: 'Tomate', defaultUnit: 'g' },
    ])
    const shoppingListRepo = new InMemoryShoppingListRepository()
    const useCase = new GenerateShoppingListUseCase(
      mealPlanRepo,
      recipeRepo,
      ingredientRepo,
      new ShoppingListService(),
      shoppingListRepo,
    )

    const list = await useCase.execute('2026-06-01')

    expect(list.items).toEqual([
      expect.objectContaining({ name: 'Tomate', totalQuantity: 400, unit: 'g', checked: false }),
    ])
    expect(shoppingListRepo.list).toEqual(list)
  })

  it('retourne une liste vide quand aucun plan n’existe', async () => {
    const useCase = new GenerateShoppingListUseCase(
      new InMemoryMealPlanRepository(null),
      new InMemoryRecipeRepository(),
      new InMemoryIngredientRepository(),
      new ShoppingListService(),
      new InMemoryShoppingListRepository(),
    )

    const list = await useCase.execute('2026-06-01')

    expect(list.items).toEqual([])
    expect(list.weekStart).toBe('2026-06-01')
  })
})
