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

  /** Génère la liste pour la semaine donnée, la persiste (coches remises à zéro) et la retourne. */
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
    await this.shoppingListRepo.save(list)
    return list
  }
}
