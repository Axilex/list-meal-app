import type { ShoppingList, Unit } from '@/domain/models'
import type { ShoppingListRepository } from '@/domain/repositories'

export class ToggleShoppingItemUseCase {
  constructor(private readonly shoppingListRepo: ShoppingListRepository) {}

  /** Coche/décoche la ligne identifiée par ingredientId + unit et persiste la liste. */
  async execute(
    ingredientId: string,
    unit: Unit,
    checked: boolean,
  ): Promise<ShoppingList | null> {
    const list = await this.shoppingListRepo.getCurrent()
    if (!list) return null

    const updated: ShoppingList = {
      ...list,
      items: list.items.map((item) =>
        item.ingredientId === ingredientId && item.unit === unit
          ? { ...item, checked }
          : item,
      ),
    }
    await this.shoppingListRepo.save(updated)
    return updated
  }
}
