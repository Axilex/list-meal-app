import { describe, expect, it } from 'vitest'
import { toFirestoreData } from './firestoreData'

describe('toFirestoreData', () => {
  it('retire les champs undefined, y compris imbriqués', () => {
    const recipe = {
      id: 'r1',
      name: 'Curry',
      servings: 4,
      instructions: undefined,
      ingredients: [{ ingredientId: 'i1', quantity: 200, unit: 'g', note: undefined }],
      steps: [{ action: 'Préparer', detail: undefined, durationMin: undefined }],
    }

    const data = toFirestoreData(recipe)

    expect(data).toEqual({
      id: 'r1',
      name: 'Curry',
      servings: 4,
      ingredients: [{ ingredientId: 'i1', quantity: 200, unit: 'g' }],
      steps: [{ action: 'Préparer' }],
    })
    expect('instructions' in data).toBe(false)
  })

  it('laisse intactes les valeurs définies (0, chaînes vides, false)', () => {
    const item = { checked: false, totalQuantity: 0, notes: '' }
    expect(toFirestoreData(item)).toEqual(item)
  })
})
