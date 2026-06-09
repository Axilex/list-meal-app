import type { MealPlan } from '@/domain/models'
import type { MealPlanRepository } from '@/domain/repositories'
import { readJson, writeJson } from './storage'

export class LocalStorageMealPlanRepository implements MealPlanRepository {
  private readonly key = 'mealapp.mealPlan.current'

  async getCurrent(): Promise<MealPlan | null> {
    return readJson<MealPlan>(this.key)
  }

  async save(mealPlan: MealPlan): Promise<void> {
    writeJson(this.key, mealPlan)
  }
}
