import type { MealPlan, MealSlot } from '@/domain/models'
import type { MealPlanRepository } from '@/domain/repositories'
import type { MealPlanService } from '@/domain/services'
import { createEmptyMealPlan } from '../defaultMealPlan'

export type SaveMealSlotResult =
  | { ok: true; plan: MealPlan }
  | { ok: false; errors: string[] }

export class SaveMealSlotUseCase {
  constructor(
    private readonly mealPlanRepo: MealPlanRepository,
    private readonly mealPlanService: MealPlanService,
  ) {}

  async execute(slot: MealSlot): Promise<SaveMealSlotResult> {
    const errors = this.mealPlanService.validateSlot(slot)
    if (errors.length > 0) return { ok: false, errors }

    const plan = (await this.mealPlanRepo.getCurrent()) ?? createEmptyMealPlan()
    const updated = this.mealPlanService.addOrUpdateSlot(plan, slot)
    await this.mealPlanRepo.save(updated)
    return { ok: true, plan: updated }
  }
}
