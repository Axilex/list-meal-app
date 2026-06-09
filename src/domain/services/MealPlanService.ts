import type { MealPlan, MealSlot } from '../models'
import { isValidIsoDate } from '@/shared/date'

export class MealPlanService {
  /**
   * Ajoute ou remplace un repas. Une seule recette par case (date + type de repas) :
   * tout slot existant sur la même case (ou avec le même id) est remplacé.
   */
  addOrUpdateSlot(plan: MealPlan, slot: MealSlot): MealPlan {
    const slots = plan.slots.filter(
      (s) =>
        s.id !== slot.id &&
        !(s.date === slot.date && s.mealType === slot.mealType),
    )
    return { ...plan, slots: [...slots, slot] }
  }

  removeSlot(plan: MealPlan, slotId: string): MealPlan {
    return { ...plan, slots: plan.slots.filter((s) => s.id !== slotId) }
  }

  removeSlotsByRecipe(plan: MealPlan, recipeId: string): MealPlan {
    return { ...plan, slots: plan.slots.filter((s) => s.recipeId !== recipeId) }
  }

  /** Valide un repas ; retourne la liste des erreurs (vide = valide). */
  validateSlot(slot: MealSlot): string[] {
    const errors: string[] = []
    if (!isValidIsoDate(slot.date)) {
      errors.push('La date du repas est invalide.')
    }
    if (slot.recipeId.trim() === '') {
      errors.push('Choisissez une recette.')
    }
    if (!(slot.servings > 0)) {
      errors.push('Le nombre de portions doit être supérieur à 0.')
    }
    return errors
  }
}
