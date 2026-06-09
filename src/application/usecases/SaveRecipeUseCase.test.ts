import { describe, expect, it } from 'vitest'
import { SaveRecipeUseCase } from './SaveRecipeUseCase'
import {
  InMemoryIngredientRepository,
  InMemoryRecipeRepository,
} from './fakes'
import { RecipeService } from '@/domain/services'
import type { RecipeDraft } from '@/domain/models'

function setup(ingredientRepo = new InMemoryIngredientRepository()) {
  const recipeRepo = new InMemoryRecipeRepository()
  const useCase = new SaveRecipeUseCase(
    recipeRepo,
    ingredientRepo,
    new RecipeService(),
  )
  return { useCase, recipeRepo, ingredientRepo }
}

const draft: RecipeDraft = {
  name: 'Riz à la tomate',
  servings: 2,
  ingredients: [
    { name: 'Tomate', quantity: 200, unit: 'g' },
    { name: 'Riz', quantity: 150, unit: 'g' },
  ],
}

describe('SaveRecipeUseCase', () => {
  it('crée les ingrédients inconnus et sauvegarde la recette', async () => {
    const { useCase, recipeRepo, ingredientRepo } = setup()

    const result = await useCase.execute(draft)

    expect(result.ok).toBe(true)
    expect(recipeRepo.recipes).toHaveLength(1)
    expect(ingredientRepo.ingredients.map((i) => i.name)).toEqual([
      'Tomate',
      'Riz',
    ])
  })

  it('réutilise un ingrédient existant par nom, insensible à la casse', async () => {
    const ingredientRepo = new InMemoryIngredientRepository([
      { id: 'ing-1', name: 'tomate', defaultUnit: 'g' },
    ])
    const { useCase, recipeRepo } = setup(ingredientRepo)

    const result = await useCase.execute(draft)

    expect(result.ok).toBe(true)
    expect(ingredientRepo.ingredients).toHaveLength(2) // tomate réutilisée, Riz créé
    expect(recipeRepo.recipes[0]?.ingredients[0]?.ingredientId).toBe('ing-1')
  })

  it('nettoie et sauvegarde les étapes de préparation', async () => {
    const { useCase, recipeRepo } = setup()

    const result = await useCase.execute({
      ...draft,
      steps: [
        { action: 'Couper', detail: '  la tomate en dés  ' },
        { action: 'Servir', detail: '' },
        { action: '   ' },
      ],
    })

    expect(result.ok).toBe(true)
    expect(recipeRepo.recipes[0]?.steps).toEqual([
      { action: 'Couper', detail: 'la tomate en dés' },
      { action: 'Servir' },
    ])
  })

  it('conserve la durée des étapes et écarte les durées invalides', async () => {
    const { useCase, recipeRepo } = setup()

    const result = await useCase.execute({
      ...draft,
      steps: [
        { action: 'Cuire', durationMin: 10 },
        { action: 'Réserver', durationMin: 0 },
        { action: 'Servir', durationMin: '' as unknown as number }, // champ vidé dans le formulaire
      ],
    })

    expect(result.ok).toBe(true)
    expect(recipeRepo.recipes[0]?.steps).toEqual([
      { action: 'Cuire', durationMin: 10 },
      { action: 'Réserver' },
      { action: 'Servir' },
    ])
  })

  it('refuse une saisie invalide sans rien sauvegarder', async () => {
    const { useCase, recipeRepo, ingredientRepo } = setup()

    const result = await useCase.execute({ ...draft, name: '' })

    expect(result).toEqual({
      ok: false,
      errors: ['Le nom de la recette est obligatoire.'],
    })
    expect(recipeRepo.recipes).toEqual([])
    expect(ingredientRepo.ingredients).toEqual([])
  })

  it('met à jour une recette existante en conservant son id', async () => {
    const { useCase, recipeRepo } = setup()
    const created = await useCase.execute(draft)
    if (!created.ok) throw new Error('création attendue')

    const updated = await useCase.execute({
      ...draft,
      id: created.recipe.id,
      name: 'Riz à la tomate épicé',
    })

    expect(updated.ok).toBe(true)
    expect(recipeRepo.recipes).toHaveLength(1)
    expect(recipeRepo.recipes[0]?.name).toBe('Riz à la tomate épicé')
  })
})
