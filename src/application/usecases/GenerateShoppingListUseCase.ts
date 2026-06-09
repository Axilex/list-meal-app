import type { ShoppingList } from '@/domain/models'
import type {
  IngredientRepository,
  MealPlanRepository,
  RecipeRepository,
  ShoppingListRepository,
} from '@/domain/repositories'
import type { ShoppingListService } from '@/domain/services'
import { createEmptyMealPlan } from '../defaultMealPlan'

export class GenerateShoppingListUseCase {
  constructor(
    private readonly mealPlanRepo: MealPlanRepository,
    private readonly recipeRepo: RecipeRepository,
    private readonly ingredientRepo: IngredientRepository,
    private readonly shoppingListService: ShoppingListService,
    private readonly shoppingListRepo: ShoppingListRepository,
  ) {}

  /**
   * Génère la liste pour la semaine donnée, la persiste et la retourne.
   * Les coches de la liste persistée de la même semaine sont conservées
   * (par ingredientId + unit) : la liste peut donc être recalculée à tout
   * moment pour suivre le plan sans perdre l'avancement des courses.
   */
  async execute(weekStart: string): Promise<ShoppingList> {
    const plan = (await this.mealPlanRepo.getCurrent()) ?? createEmptyMealPlan()
    const recipes = await this.recipeRepo.getAll()
    const ingredients = await this.ingredientRepo.getAll()

    const list = this.shoppingListService.generate(
      plan,
      recipes,
      ingredients,
      weekStart,
    )

    const previous = await this.shoppingListRepo.getCurrent()
    if (previous && previous.weekStart === weekStart) {
      const checkedKeys = new Set(
        previous.items
          .filter((item) => item.checked)
          .map((item) => `${item.ingredientId}|${item.unit}`),
      )
      list.items = list.items.map((item) =>
        checkedKeys.has(`${item.ingredientId}|${item.unit}`)
          ? { ...item, checked: true }
          : item,
      )
    }

    await this.shoppingListRepo.save(list)
    return list
  }
}
