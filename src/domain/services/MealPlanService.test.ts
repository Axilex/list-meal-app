import { describe, expect, it } from 'vitest'
import { MealPlanService } from './MealPlanService'
import type { MealPlan, MealSlot } from '../models'

function slot(overrides: Partial<MealSlot> = {}): MealSlot {
  return {
    id: 's-1',
    date: '2026-06-01',
    mealType: 'lunch',
    recipeId: 'r-1',
    servings: 2,
    ...overrides,
  }
}

function plan(slots: MealSlot[] = []): MealPlan {
  return { id: 'plan-1', name: 'Plan', slots }
}

describe('MealPlanService', () => {
  const service = new MealPlanService()

  it('ajoute un repas dans une case vide', () => {
    const result = service.addOrUpdateSlot(plan(), slot())
    expect(result.slots).toEqual([slot()])
  })

  it('remplace le repas existant sur la même case (date + type)', () => {
    const existing = slot({ id: 's-1', recipeId: 'r-1' })
    const replacement = slot({ id: 's-2', recipeId: 'r-2' })
    const result = service.addOrUpdateSlot(plan([existing]), replacement)
    expect(result.slots).toEqual([replacement])
  })

  it('met à jour un repas par id même si la case change', () => {
    const existing = slot({ id: 's-1', date: '2026-06-01' })
    const moved = slot({ id: 's-1', date: '2026-06-02' })
    const result = service.addOrUpdateSlot(plan([existing]), moved)
    expect(result.slots).toEqual([moved])
  })

  it('ne mute pas le plan d’origine', () => {
    const original = plan([slot()])
    service.removeSlot(original, 's-1')
    expect(original.slots).toHaveLength(1)
  })

  it('retire un repas par id', () => {
    const result = service.removeSlot(plan([slot()]), 's-1')
    expect(result.slots).toEqual([])
  })

  it('retire tous les repas référençant une recette', () => {
    const result = service.removeSlotsByRecipe(
      plan([
        slot({ id: 's-1', recipeId: 'r-1' }),
        slot({ id: 's-2', date: '2026-06-02', recipeId: 'r-2' }),
        slot({ id: 's-3', date: '2026-06-03', recipeId: 'r-1' }),
      ]),
      'r-1',
    )
    expect(result.slots.map((s) => s.id)).toEqual(['s-2'])
  })

  describe('validateSlot', () => {
    it('accepte un repas valide', () => {
      expect(service.validateSlot(slot())).toEqual([])
    })

    it('refuse une date invalide', () => {
      expect(service.validateSlot(slot({ date: '2026-02-30' }))).toContain(
        'La date du repas est invalide.',
      )
    })

    it('refuse un repas sans recette', () => {
      expect(service.validateSlot(slot({ recipeId: '' }))).toContain(
        'Choisissez une recette.',
      )
    })

    it('refuse des portions nulles', () => {
      expect(service.validateSlot(slot({ servings: 0 }))).toContain(
        'Le nombre de portions doit être supérieur à 0.',
      )
    })
  })
})
