import type { ShoppingListItem } from './ShoppingListItem'

export interface ShoppingList {
  generatedAt: string // ISO date
  weekStart: string // lundi de la semaine couverte (YYYY-MM-DD)
  items: ShoppingListItem[]
}
