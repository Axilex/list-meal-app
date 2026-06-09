// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { LocalStorageRecipeRepository } from './LocalStorageRecipeRepository'
import type { Recipe } from '@/domain/models'

const recipe: Recipe = {
  id: 'r-1',
  name: 'Riz à la tomate',
  servings: 2,
  ingredients: [{ ingredientId: 'ing-1', quantity: 200, unit: 'g' }],
}

describe('LocalStorageRecipeRepository', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('fait un aller-retour save → getAll/getById', async () => {
    const repo = new LocalStorageRecipeRepository()

    await repo.save(recipe)

    expect(await repo.getAll()).toEqual([recipe])
    expect(await repo.getById('r-1')).toEqual(recipe)
    expect(await repo.getById('inconnu')).toBeNull()
  })

  it('met à jour sans dupliquer, supprime par id', async () => {
    const repo = new LocalStorageRecipeRepository()
    await repo.save(recipe)

    await repo.save({ ...recipe, name: 'Riz épicé' })
    expect(await repo.getAll()).toHaveLength(1)

    await repo.delete('r-1')
    expect(await repo.getAll()).toEqual([])
  })

  it('retourne une liste vide si le stockage est corrompu', async () => {
    localStorage.setItem('mealapp.recipes', '{pas du json')
    expect(await new LocalStorageRecipeRepository().getAll()).toEqual([])
  })
})
