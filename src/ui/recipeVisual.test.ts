import { describe, expect, it } from 'vitest'
import { recipeVisual } from './recipeVisual'

describe('recipeVisual', () => {
  it('choisit un emoji par mot-clé malgré les accents', () => {
    expect(recipeVisual('Pâtes carbonara').emoji).toBe('🍝')
    expect(recipeVisual('Risotto aux champignons').emoji).toBe('🍚')
    expect(recipeVisual('Salade niçoise').emoji).toBe('🥗')
  })

  it('est déterministe : même nom → même visuel', () => {
    expect(recipeVisual('Curry de légumes')).toEqual(recipeVisual('curry de légumes '))
  })

  it('retombe sur un emoji par défaut pour un nom inconnu', () => {
    const visual = recipeVisual('Spécialité du chef')
    expect(visual.emoji.length).toBeGreaterThan(0)
    expect(visual.accent).toMatch(/^#[0-9a-f]{6}$/)
  })
})
