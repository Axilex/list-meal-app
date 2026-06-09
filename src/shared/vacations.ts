// Périodes de vacances marquées dans le calendrier (badge 🏖️ + fond lagon).
// Les bornes incluent la marge de préparation/retour autour du séjour.
export interface VacationPeriod {
  /** Premier jour marqué (inclus), ISO 'YYYY-MM-DD'. */
  start: string
  /** Dernier jour marqué (inclus), ISO 'YYYY-MM-DD'. */
  end: string
}

export const VACATION_PERIODS: VacationPeriod[] = [
  // Été 2026 : séjour du 11 au 25 juillet, +2 jours avant et après
  { start: '2026-07-11', end: '2026-07-25' },
]

export function isVacationDay(date: string): boolean {
  return VACATION_PERIODS.some((p) => date >= p.start && date <= p.end)
}
