import { describe, expect, it } from 'vitest'
import { AISLES, aisleOf, groupByAisle } from './aisle'

describe('aisleOf', () => {
  it('classe le frais au primeur, accents et pluriels compris', () => {
    expect(aisleOf('Tomate')).toBe('produce')
    expect(aisleOf('Tomates cerises')).toBe('produce')
    expect(aisleOf('Échalote')).toBe('produce')
    expect(aisleOf('Petits pois')).toBe('produce')
    expect(aisleOf('Basilic')).toBe('produce')
  })

  it('gère les ligatures œ (Bœuf, Œuf)', () => {
    expect(aisleOf('Bœuf haché')).toBe('butcher')
    expect(aisleOf('Œuf')).toBe('dairy')
  })

  it('ne confond pas des mots imbriqués (chorizo ≠ riz)', () => {
    expect(aisleOf('Chorizo')).toBe('butcher')
    expect(aisleOf('Riz basmati')).toBe('pantry')
  })

  it('fait passer les cas particuliers avant les règles générales', () => {
    // conserves de tomate ≠ tomate fraîche
    expect(aisleOf('Coulis de tomates')).toBe('pantry')
    expect(aisleOf('Tomates pelées')).toBe('pantry')
    expect(aisleOf('Lait de coco')).toBe('pantry')
    // pâte fraîche du commerce ≠ pâtes féculent
    expect(aisleOf('Pâte feuilletée')).toBe('dairy')
    expect(aisleOf('Pâtes')).toBe('pantry')
    // légumineuses sèches ≠ légumes frais
    expect(aisleOf('Pois chiches')).toBe('pantry')
    expect(aisleOf('Lentilles corail')).toBe('pantry')
    // huile d'olive : condiment, pas olives
    expect(aisleOf("Huile d'olive")).toBe('spices')
    expect(aisleOf('Olives')).toBe('pantry')
  })

  it('classe l’inconnu dans « Autres »', () => {
    expect(aisleOf('Granité bleu mystère')).toBe('other')
  })
})

describe('groupByAisle', () => {
  it('groupe dans l’ordre des rayons et omet les rayons vides', () => {
    const groups = groupByAisle([
      { name: 'Sel' },
      { name: 'Tomate' },
      { name: 'Pavé de saumon' },
    ])
    expect(groups.map((g) => g.aisle.id)).toEqual(['produce', 'butcher', 'spices'])
    expect(groups[0]?.items).toEqual([{ name: 'Tomate' }])
  })

  it('conserve chaque article exactement une fois', () => {
    const items = [{ name: 'Tomate' }, { name: 'Sel' }, { name: 'Mystère' }]
    const groups = groupByAisle(items)
    expect(groups.flatMap((g) => g.items)).toHaveLength(items.length)
  })

  it('expose un libellé et un emoji par rayon', () => {
    for (const aisle of AISLES) {
      expect(aisle.label.length).toBeGreaterThan(0)
      expect(aisle.emoji.length).toBeGreaterThan(0)
    }
  })
})
