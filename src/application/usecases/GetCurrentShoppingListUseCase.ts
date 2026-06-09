import type { ShoppingList } from '@/domain/models'
import type { ShoppingListRepository } from '@/domain/repositories'

export class GetCurrentShoppingListUseCase {
  constructor(private readonly shoppingListRepo: ShoppingListRepository) {}

  async execute(): Promise<ShoppingList | null> {
    return this.shoppingListRepo.getCurrent()
  }
}
