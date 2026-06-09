import { describe, expect, it } from 'vitest'
import type { AppDataExport } from './ExportDataUseCase'
import { ImportDataUseCase } from './ImportDataUseCase'
import {
  InMemoryIngredientRepository,
  InMemoryMealPlanRepository,
  InMemoryRecipeRepository,
  InMemoryShoppingListRepository,
} from './fakes'
import type { Recipe } from '@/domain/models'

const validExport: AppDataExport = {
  version: 1,
  exportedAt: '2026-06-08T10:00:00.000Z',
  recipes: [
    {
      id: 'rec-1',
      name: 'Riz à la tomate',
      servings: 2,
      ingredients: [{ ingredientId: 'ing-1', quantity: 200, unit: 'g' }],
    },
  ],
  ingredients: [{ id: 'ing-1', name: 'Riz', defaultUnit: 'g' }],
  mealPlan: {
    id: 'plan-1',
    name: 'Plan',
    slots: [
      { id: 'slot-1', date: '2026-06-08', mealType: 'dinner', recipeId: 'rec-1', servings: 2 },
    ],
  },
  shoppingList: {
    generatedAt: '2026-06-08T10:00:00.000Z',
    weekStart: '2026-06-08',
    items: [
      { ingredientId: 'ing-1', name: 'Riz', totalQuantity: 200, unit: 'g', checked: true },
    ],
  },
}

function makeRepos() {
  return {
    recipeRepo: new InMemoryRecipeRepository(),
    ingredientRepo: new InMemoryIngredientRepository(),
    mealPlanRepo: new InMemoryMealPlanRepository(),
    shoppingListRepo: new InMemoryShoppingListRepository(),
  }
}

describe('ImportDataUseCase', () => {
  it('réécrit toutes les données d’un export valide', async () => {
    const { recipeRepo, ingredientRepo, mealPlanRepo, shoppingListRepo } = makeRepos()
    const useCase = new ImportDataUseCase(
      recipeRepo,
      ingredientRepo,
      mealPlanRepo,
      shoppingListRepo,
    )

    const result = await useCase.execute(validExport)

    expect(result.ok).toBe(true)
    expect(recipeRepo.recipes).toEqual(validExport.recipes)
    expect(ingredientRepo.ingredients).toEqual(validExport.ingredients)
    expect(mealPlanRepo.plan).toEqual(validExport.mealPlan)
    expect(shoppingListRepo.list).toEqual(validExport.shoppingList)
  })

  it('remplace les éléments existants portant le même id, conserve les autres', async () => {
    const existing: Recipe = {
      id: 'rec-1',
      name: 'Ancienne version',
      servings: 4,
      ingredients: [],
    }
    const kept: Recipe = { id: 'rec-2', name: 'Salade', servings: 2, ingredients: [] }
    const { recipeRepo, ingredientRepo, mealPlanRepo, shoppingListRepo } = makeRepos()
    recipeRepo.recipes = [existing, kept]
    const useCase = new ImportDataUseCase(
      recipeRepo,
      ingredientRepo,
      mealPlanRepo,
      shoppingListRepo,
    )

    const result = await useCase.execute(validExport)

    expect(result.ok).toBe(true)
    expect(recipeRepo.recipes).toEqual([validExport.recipes[0], kept])
  })

  it('accepte un export sans plan ni liste de courses', async () => {
    const { recipeRepo, ingredientRepo, mealPlanRepo, shoppingListRepo } = makeRepos()
    const useCase = new ImportDataUseCase(
      recipeRepo,
      ingredientRepo,
      mealPlanRepo,
      shoppingListRepo,
    )

    const result = await useCase.execute({
      ...validExport,
      mealPlan: null,
      shoppingList: null,
    })

    expect(result.ok).toBe(true)
    expect(recipeRepo.recipes).toEqual(validExport.recipes)
    expect(mealPlanRepo.plan).toBeNull()
    expect(shoppingListRepo.list).toBeNull()
  })

  it.each([
    ['pas un objet', 'texte'],
    ['version inconnue', { ...validExport, version: 2 }],
    ['recettes absentes', { ...validExport, recipes: undefined }],
    ['recette sans id', { ...validExport, recipes: [{ name: 'Sans id' }] }],
    ['ingrédients invalides', { ...validExport, ingredients: [42] }],
    ['plan invalide', { ...validExport, mealPlan: { slots: 'non' } }],
    ['liste invalide', { ...validExport, shoppingList: { items: 'non' } }],
  ])('rejette un fichier invalide (%s) sans rien écrire', async (_label, raw) => {
    const { recipeRepo, ingredientRepo, mealPlanRepo, shoppingListRepo } = makeRepos()
    const useCase = new ImportDataUseCase(
      recipeRepo,
      ingredientRepo,
      mealPlanRepo,
      shoppingListRepo,
    )

    const result = await useCase.execute(raw)

    expect(result.ok).toBe(false)
    expect(recipeRepo.recipes).toEqual([])
    expect(ingredientRepo.ingredients).toEqual([])
    expect(mealPlanRepo.plan).toBeNull()
    expect(shoppingListRepo.list).toBeNull()
  })
})
