import type { MealPlan } from '../models'

export interface MealPlanRepository {
  getCurrent(): Promise<MealPlan | null>
  save(mealPlan: MealPlan): Promise<void>
}
