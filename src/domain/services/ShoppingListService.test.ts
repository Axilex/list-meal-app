import { describe, expect, it } from 'vitest'
import { ShoppingListService } from './ShoppingListService'
import type { Ingredient, MealPlan, MealSlot, Recipe } from '../models'

const WEEK = '2026-06-01' // lundi

const tomate: Ingredient = { id: 'ing-tomate', name: 'Tomate', defaultUnit: 'g' }
const riz: Ingredient = { id: 'ing-riz', name: 'Riz', defaultUnit: 'g' }
const epice: Ingredient = { id: 'ing-epice', name: 'Épice', defaultUnit: 'tsp' }
const ingredients = [tomate, riz, epice]

const rizTomate: Recipe = {
  id: 'r-riz-tomate',
  name: 'Riz à la tomate',
  servings: 2,
  ingredients: [
    { ingredientId: 'ing-tomate', quantity: 200, unit: 'g' },
    { ingredientId: 'ing-riz', quantity: 150, unit: 'g' },
  ],
}

const saladeTomate: Recipe = {
  id: 'r-salade',
  name: 'Salade de tomates',
  servings: 2,
  ingredients: [
    { ingredientId: 'ing-tomate', quantity: 100, unit: 'g', note: 'en dés' },
    { ingredientId: 'ing-epice', quantity: 1, unit: 'tsp' },
  ],
}

function plan(slots: MealSlot[]): MealPlan {
  return { id: 'plan-1', name: 'Plan', slots }
}

function slot(overrides: Partial<MealSlot>): MealSlot {
  return {
    id: 's-1',
    date: '2026-06-01',
    mealType: 'lunch',
    recipeId: 'r-riz-tomate',
    servings: 2,
    ...overrides,
  }
}

describe('ShoppingListService', () => {
  const service = new ShoppingListService()

  it('met à l’échelle les quantités par le ratio portions du repas / portions de la recette', () => {
    // 4 portions pour une recette de 2 → ratio ×2
    const list = service.generate(
      plan([slot({ servings: 4 })]),
      [rizTomate],
      ingredients,
      WEEK,
    )
    expect(list.items).toEqual([
      expect.objectContaining({ name: 'Riz', totalQuantity: 300, unit: 'g' }),
      expect.objectContaining({ name: 'Tomate', totalQuantity: 400, unit: 'g' }),
    ])
  })

  it('agrège les quantités d’un même ingrédient + unité entre plusieurs repas', () => {
    const list = service.generate(
      plan([
        slot({ id: 's-1', date: '2026-06-01', recipeId: 'r-riz-tomate', servings: 2 }),
        slot({ id: 's-2', date: '2026-06-02', recipeId: 'r-salade', servings: 2 }),
      ]),
      [rizTomate, saladeTomate],
      ingredients,
      WEEK,
    )
    const tomateItem = list.items.find((i) => i.name === 'Tomate')
    expect(tomateItem).toMatchObject({ totalQuantity: 300, unit: 'g' })
  })

  it('sépare les lignes quand le même ingrédient utilise des unités différentes', () => {
    const enPieces: Recipe = {
      id: 'r-pieces',
      name: 'Tomates farcies',
      servings: 2,
      ingredients: [{ ingredientId: 'ing-tomate', quantity: 4, unit: 'piece' }],
    }
    const list = service.generate(
      plan([
        slot({ id: 's-1', recipeId: 'r-riz-tomate' }),
        slot({ id: 's-2', date: '2026-06-02', recipeId: 'r-pieces' }),
      ]),
      [rizTomate, enPieces],
      ingredients,
      WEEK,
    )
    const tomateItems = list.items.filter((i) => i.ingredientId === 'ing-tomate')
    expect(tomateItems).toHaveLength(2)
    expect(tomateItems.map((i) => i.unit).sort()).toEqual(['g', 'piece'])
  })

  it('ignore les repas hors de la semaine demandée', () => {
    const list = service.generate(
      plan([
        slot({ id: 's-in', date: '2026-06-07' }), // dimanche : inclus
        slot({ id: 's-before', date: '2026-05-31' }),
        slot({ id: 's-after', date: '2026-06-08' }),
      ]),
      [rizTomate],
      ingredients,
      WEEK,
    )
    const rizItem = list.items.find((i) => i.name === 'Riz')
    expect(rizItem?.totalQuantity).toBe(150) // un seul slot compté
  })

  it('trie les items par nom selon l’ordre français (accents compris)', () => {
    const list = service.generate(
      plan([
        slot({ id: 's-1', recipeId: 'r-riz-tomate' }),
        slot({ id: 's-2', date: '2026-06-02', recipeId: 'r-salade' }),
      ]),
      [rizTomate, saladeTomate],
      ingredients,
      WEEK,
    )
    expect(list.items.map((i) => i.name)).toEqual(['Épice', 'Riz', 'Tomate'])
  })

  it('retourne une liste vide pour un plan sans repas', () => {
    const list = service.generate(plan([]), [rizTomate], ingredients, WEEK)
    expect(list.items).toEqual([])
  })

  it('ignore les slots orphelins dont la recette a disparu', () => {
    const list = service.generate(
      plan([slot({ recipeId: 'r-supprimee' })]),
      [rizTomate],
      ingredients,
      WEEK,
    )
    expect(list.items).toEqual([])
  })

  it('joint les notes distinctes et initialise les cases décochées', () => {
    const list = service.generate(
      plan([slot({ recipeId: 'r-salade' })]),
      [saladeTomate],
      ingredients,
      WEEK,
    )
    const tomateItem = list.items.find((i) => i.name === 'Tomate')
    expect(tomateItem?.notes).toBe('en dés')
    expect(list.items.every((i) => i.checked === false)).toBe(true)
    expect(list.weekStart).toBe(WEEK)
  })

  it('arrondit les quantités à 2 décimales', () => {
    const list = service.generate(
      plan([slot({ servings: 1 })]), // ratio 1/2 sur recette de 2
      [
        {
          ...rizTomate,
          servings: 3, // ratio 1/3 → 200/3 = 66.666…
        },
      ],
      ingredients,
      WEEK,
    )
    const tomateItem = list.items.find((i) => i.name === 'Tomate')
    expect(tomateItem?.totalQuantity).toBe(66.67)
  })
})
