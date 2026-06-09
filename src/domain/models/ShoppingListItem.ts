import type { Unit } from './Unit'

export interface ShoppingListItem {
  ingredientId: string
  name: string // désambiguïté si besoin
  totalQuantity: number
  unit: Unit
  notes?: string
  checked: boolean // état de la case, persisté avec la liste
}
