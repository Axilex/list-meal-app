import type { ShoppingList } from '@/domain/models'
import type { ShoppingListRepository } from '@/domain/repositories'

export class UncheckAllShoppingItemsUseCase {
  constructor(private readonly shoppingListRepo: ShoppingListRepository) {}

  /** Décoche tous les articles de la liste courante et la persiste. */
  async execute(): Promise<ShoppingList | null> {
    const list = await this.shoppingListRepo.getCurrent()
    if (!list) return null

    const updated: ShoppingList = {
      ...list,
      items: list.items.map((item) =>
        item.checked ? { ...item, checked: false } : item,
      ),
    }
    await this.shoppingListRepo.save(updated)
    return updated
  }
}
