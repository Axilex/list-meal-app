import { describe, expect, it } from 'vitest'
import { addDays, isValidIsoDate, mondayOf, weekDates } from './date'

describe('date', () => {
  it('mondayOf retourne le lundi de la semaine', () => {
    expect(mondayOf('2026-06-01')).toBe('2026-06-01') // lundi
    expect(mondayOf('2026-06-06')).toBe('2026-06-01') // samedi
    expect(mondayOf('2026-06-07')).toBe('2026-06-01') // dimanche
    expect(mondayOf('2026-06-08')).toBe('2026-06-08') // lundi suivant
  })

  it('addDays franchit les limites de mois', () => {
    expect(addDays('2026-05-31', 1)).toBe('2026-06-01')
    expect(addDays('2026-06-01', -1)).toBe('2026-05-31')
    expect(addDays('2026-06-01', 7)).toBe('2026-06-08')
  })

  it('weekDates retourne les 7 jours lundi → dimanche', () => {
    const dates = weekDates('2026-06-01')
    expect(dates).toHaveLength(7)
    expect(dates[0]).toBe('2026-06-01')
    expect(dates[6]).toBe('2026-06-07')
  })

  it('isValidIsoDate valide le format et le calendrier', () => {
    expect(isValidIsoDate('2026-06-08')).toBe(true)
    expect(isValidIsoDate('2026-02-30')).toBe(false)
    expect(isValidIsoDate('abc')).toBe(false)
    expect(isValidIsoDate('2026-6-8')).toBe(false)
  })
})
