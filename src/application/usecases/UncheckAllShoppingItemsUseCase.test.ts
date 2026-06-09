import { describe, expect, it } from 'vitest'
import { UncheckAllShoppingItemsUseCase } from './UncheckAllShoppingItemsUseCase'
import { InMemoryShoppingListRepository } from './fakes'
import type { ShoppingList } from '@/domain/models'

const list: ShoppingList = {
  generatedAt: '2026-06-06T10:00:00.000Z',
  weekStart: '2026-06-01',
  items: [
    { ingredientId: 'ing-1', name: 'Tomate', totalQuantity: 400, unit: 'g', checked: true },
    { ingredientId: 'ing-2', name: 'Riz basmati', totalQuantity: 200, unit: 'g', checked: false },
  ],
}

describe('UncheckAllShoppingItemsUseCase', () => {
  it('décoche tous les articles et persiste', async () => {
    const repo = new InMemoryShoppingListRepository(list)
    const useCase = new UncheckAllShoppingItemsUseCase(repo)

    const updated = await useCase.execute()

    expect(updated?.items.map((i) => i.checked)).toEqual([false, false])
    expect(repo.list?.items.map((i) => i.checked)).toEqual([false, false])
  })

  it('retourne null sans liste persistée', async () => {
    const useCase = new UncheckAllShoppingItemsUseCase(
      new InMemoryShoppingListRepository(null),
    )
    expect(await useCase.execute()).toBeNull()
  })
})
