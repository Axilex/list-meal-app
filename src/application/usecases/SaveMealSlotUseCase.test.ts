import { describe, expect, it } from 'vitest'
import { SaveMealSlotUseCase } from './SaveMealSlotUseCase'
import { InMemoryMealPlanRepository } from './fakes'
import { MealPlanService } from '@/domain/services'
import type { MealSlot } from '@/domain/models'

const slot: MealSlot = {
  id: 's-1',
  date: '2026-06-01',
  mealType: 'lunch',
  recipeId: 'r-1',
  servings: 2,
}

describe('SaveMealSlotUseCase', () => {
  it('crée le plan lors du premier repas ajouté', async () => {
    const mealPlanRepo = new InMemoryMealPlanRepository(null)
    const useCase = new SaveMealSlotUseCase(mealPlanRepo, new MealPlanService())

    const result = await useCase.execute(slot)

    expect(result.ok).toBe(true)
    expect(mealPlanRepo.plan?.slots).toEqual([slot])
  })

  it('refuse un repas invalide sans toucher au plan', async () => {
    const mealPlanRepo = new InMemoryMealPlanRepository(null)
    const useCase = new SaveMealSlotUseCase(mealPlanRepo, new MealPlanService())

    const result = await useCase.execute({ ...slot, servings: 0 })

    expect(result.ok).toBe(false)
    expect(mealPlanRepo.plan).toBeNull()
  })
})
