// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { LocalStorageIngredientRepository } from './LocalStorageIngredientRepository'
import { SEED_INGREDIENTS } from './seedIngredients'
import type { Ingredient } from '@/domain/models'

describe('SEED_INGREDIENTS', () => {
  it('a des ids et des noms uniques', () => {
    const ids = new Set(SEED_INGREDIENTS.map((i) => i.id))
    const names = new Set(SEED_INGREDIENTS.map((i) => i.name.toLowerCase()))
    expect(ids.size).toBe(SEED_INGREDIENTS.length)
    expect(names.size).toBe(SEED_INGREDIENTS.length)
  })
})

describe('LocalStorageIngredientRepository', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('préremplit le stockage avec le seed au premier accès', async () => {
    const repo = new LocalStorageIngredientRepository()

    const all = await repo.getAll()

    expect(all).toEqual(SEED_INGREDIENTS)
    expect(
      JSON.parse(localStorage.getItem('mealapp.ingredients')!),
    ).toEqual(SEED_INGREDIENTS)
  })

  it('fusionne par nom sans dupliquer, insensible à la casse', async () => {
    const tomate: Ingredient = { id: 'u-1', name: 'tomate', defaultUnit: 'g' }
    localStorage.setItem('mealapp.ingredients', JSON.stringify([tomate]))
    const repo = new LocalStorageIngredientRepository()

    const all = await repo.getAll()

    // L'ingrédient existant garde son id et son unité ; le seed "Tomate"
    // n'est pas ajouté en doublon, le reste du seed l'est.
    expect(all).toHaveLength(1 + SEED_INGREDIENTS.length - 1)
    expect(await repo.findByName('Tomate')).toEqual(tomate)
    expect(await repo.findByName('Riz basmati')).not.toBeNull()
  })

  it('save conserve le seed et les ingrédients utilisateur', async () => {
    const repo = new LocalStorageIngredientRepository()
    const safran: Ingredient = { id: 'u-2', name: 'Safran', defaultUnit: 'tsp' }

    await repo.save(safran)

    expect(await repo.getById('u-2')).toEqual(safran)
    expect(await repo.getAll()).toHaveLength(SEED_INGREDIENTS.length + 1)
  })
})
