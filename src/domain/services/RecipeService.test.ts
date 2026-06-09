import { describe, expect, it } from 'vitest'
import { RecipeService } from './RecipeService'
import type { RecipeDraft } from '../models'

function draft(overrides: Partial<RecipeDraft> = {}): RecipeDraft {
  return {
    name: 'Riz à la tomate',
    servings: 2,
    ingredients: [{ name: 'Tomate', quantity: 200, unit: 'g' }],
    ...overrides,
  }
}

describe('RecipeService.validate', () => {
  const service = new RecipeService()

  it('accepte une recette valide', () => {
    expect(service.validate(draft())).toEqual([])
  })

  it('refuse un nom vide', () => {
    expect(service.validate(draft({ name: '  ' }))).toContain(
      'Le nom de la recette est obligatoire.',
    )
  })

  it('refuse des portions nulles ou négatives', () => {
    expect(service.validate(draft({ servings: 0 }))).toContain(
      'Le nombre de portions doit être supérieur à 0.',
    )
  })

  it('refuse une recette sans ingrédient', () => {
    expect(service.validate(draft({ ingredients: [] }))).toContain(
      'La recette doit contenir au moins un ingrédient.',
    )
  })

  it('refuse un ingrédient sans nom ou avec quantité invalide', () => {
    const errors = service.validate(
      draft({
        ingredients: [
          { name: '', quantity: 100, unit: 'g' },
          { name: 'Riz', quantity: 0, unit: 'g' },
        ],
      }),
    )
    expect(errors).toContain('Ingrédient 1 : le nom est obligatoire.')
    expect(errors).toContain('Ingrédient 2 : la quantité doit être supérieure à 0.')
  })
})
