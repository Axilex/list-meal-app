import type { ShoppingList } from '@/domain/models'
import type { ShoppingListRepository } from '@/domain/repositories'
import { readJson, writeJson } from './storage'

export class LocalStorageShoppingListRepository
  implements ShoppingListRepository
{
  private readonly key = 'mealapp.shoppingList.current'

  async getCurrent(): Promise<ShoppingList | null> {
    return readJson<ShoppingList>(this.key)
  }

  async save(list: ShoppingList): Promise<void> {
    writeJson(this.key, list)
  }
}
