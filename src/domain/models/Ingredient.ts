import type { Unit } from './Unit'

export interface Ingredient {
  id: string
  name: string // "Tomate", "Riz basmati", "Poulet"...
  defaultUnit: Unit // unité préférée
}
