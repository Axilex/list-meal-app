import type { MealPlan } from '@/domain/models'
import type { MealPlanRepository } from '@/domain/repositories'
import type { MealPlanService } from '@/domain/services'

export class RemoveMealSlotUseCase {
  constructor(
    private readonly mealPlanRepo: MealPlanRepository,
    private readonly mealPlanService: MealPlanService,
  ) {}

  async execute(slotId: string): Promise<MealPlan | null> {
    const plan = await this.mealPlanRepo.getCurrent()
    if (!plan) return null
    const updated = this.mealPlanService.removeSlot(plan, slotId)
    await this.mealPlanRepo.save(updated)
    return updated
  }
}
