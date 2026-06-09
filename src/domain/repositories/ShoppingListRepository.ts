import type { ShoppingList } from '../models'

export interface ShoppingListRepository {
  getCurrent(): Promise<ShoppingList | null>
  save(list: ShoppingList): Promise<void>
}
