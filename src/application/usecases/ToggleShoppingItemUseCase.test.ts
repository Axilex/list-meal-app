import { describe, expect, it } from 'vitest'
import { ToggleShoppingItemUseCase } from './ToggleShoppingItemUseCase'
import { InMemoryShoppingListRepository } from './fakes'
import type { ShoppingList } from '@/domain/models'

const list: ShoppingList = {
  generatedAt: '2026-06-06T10:00:00.000Z',
  weekStart: '2026-06-01',
  items: [
    { ingredientId: 'ing-1', name: 'Tomate', totalQuantity: 400, unit: 'g', checked: false },
    { ingredientId: 'ing-1', name: 'Tomate', totalQuantity: 4, unit: 'piece', checked: false },
  ],
}

describe('ToggleShoppingItemUseCase', () => {
  it('coche uniquement la ligne ingredientId + unit visée et persiste', async () => {
    const repo = new InMemoryShoppingListRepository(list)
    const useCase = new ToggleShoppingItemUseCase(repo)

    const updated = await useCase.execute('ing-1', 'g', true)

    expect(updated?.items.map((i) => i.checked)).toEqual([true, false])
    expect(repo.list?.items.map((i) => i.checked)).toEqual([true, false])
  })

  it('retourne null sans liste persistée', async () => {
    const useCase = new ToggleShoppingItemUseCase(
      new InMemoryShoppingListRepository(null),
    )
    expect(await useCase.execute('ing-1', 'g', true)).toBeNull()
  })
})
