import type {
  Ingredient,
  MealPlan,
  Recipe,
  ShoppingList,
  ShoppingListItem,
  Unit,
} from '../models'
import { addDays } from '@/shared/date'

interface Aggregate {
  ingredientId: string
  unit: Unit
  totalQuantity: number
  notes: Set<string>
}

export class ShoppingListService {
  /**
   * Génère la liste de courses pour la semaine [weekStart, weekStart + 6 jours] :
   * quantités mises à l'échelle par slot.servings / recipe.servings,
   * agrégées par ingredientId + unit (pas de conversion d'unités),
   * triées par nom (ordre français).
   */
  generate(
    plan: MealPlan,
    recipes: Recipe[],
    ingredients: Ingredient[],
    weekStart: string,
  ): ShoppingList {
    const weekEnd = addDays(weekStart, 6)
    const recipeById = new Map(recipes.map((r) => [r.id, r]))
    const ingredientById = new Map(ingredients.map((i) => [i.id, i]))

    const aggregates = new Map<string, Aggregate>()

    for (const slot of plan.slots) {
      if (slot.date < weekStart || slot.date > weekEnd) continue
      const recipe = recipeById.get(slot.recipeId)
      // Slot orphelin (recette supprimée) ou recette invalide : ignoré
      if (!recipe || recipe.servings <= 0) continue

      const ratio = slot.servings / recipe.servings
      for (const ri of recipe.ingredients) {
        const key = `${ri.ingredientId}|${ri.unit}`
        let aggregate = aggregates.get(key)
        if (!aggregate) {
          aggregate = {
            ingredientId: ri.ingredientId,
            unit: ri.unit,
            totalQuantity: 0,
            notes: new Set(),
          }
          aggregates.set(key, aggregate)
        }
        aggregate.totalQuantity += ri.quantity * ratio
        if (ri.note) aggregate.notes.add(ri.note)
      }
    }

    const items: ShoppingListItem[] = [...aggregates.values()].map(
      (aggregate) => ({
        ingredientId: aggregate.ingredientId,
        name:
          ingredientById.get(aggregate.ingredientId)?.name ??
          aggregate.ingredientId,
        totalQuantity: Math.round(aggregate.totalQuantity * 100) / 100,
        unit: aggregate.unit,
        notes:
          aggregate.notes.size > 0 ? [...aggregate.notes].join(', ') : undefined,
        checked: false,
      }),
    )
    items.sort((a, b) => a.name.localeCompare(b.name, 'fr'))

    return {
      generatedAt: new Date().toISOString(),
      weekStart,
      items,
    }
  }
}
