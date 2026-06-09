import type { MealPlan } from '@/domain/models'
import type { MealPlanRepository } from '@/domain/repositories'
import { createEmptyMealPlan } from '../defaultMealPlan'

export class GetCurrentMealPlanUseCase {
  constructor(private readonly mealPlanRepo: MealPlanRepository) {}

  /** Retourne le plan courant, ou un plan vide (non persisté) s'il n'existe pas encore. */
  async execute(): Promise<MealPlan> {
    return (await this.mealPlanRepo.getCurrent()) ?? createEmptyMealPlan()
  }
}
