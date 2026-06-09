import { describe, expect, it } from 'vitest'
import { isVacationDay } from './vacations'

describe('isVacationDay', () => {
  it('inclut les bornes de la période', () => {
    expect(isVacationDay('2026-07-11')).toBe(true)
    expect(isVacationDay('2026-07-18')).toBe(true)
    expect(isVacationDay('2026-07-25')).toBe(true)
  })

  it('exclut les jours hors période', () => {
    expect(isVacationDay('2026-07-10')).toBe(false)
    expect(isVacationDay('2026-07-26')).toBe(false)
    expect(isVacationDay('2025-07-15')).toBe(false)
  })
})
