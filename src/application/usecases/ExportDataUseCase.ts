import type {
  Ingredient,
  MealPlan,
  Recipe,
  ShoppingList,
} from '@/domain/models'
import type {
  IngredientRepository,
  MealPlanRepository,
  RecipeRepository,
  ShoppingListRepository,
} from '@/domain/repositories'

// Sauvegarde complète des données, téléchargeable en JSON puis réimportable
// (changement de navigateur, migration localStorage → Firebase…).
export interface AppDataExport {
  version: 1
  exportedAt: string // ISO date
  recipes: Recipe[]
  ingredients: Ingredient[]
  mealPlan: MealPlan | null
  shoppingList: ShoppingList | null
}

export class ExportDataUseCase {
  constructor(
    private readonly recipeRepo: RecipeRepository,
    private readonly ingredientRepo: IngredientRepository,
    private readonly mealPlanRepo: MealPlanRepository,
    private readonly shoppingListRepo: ShoppingListRepository,
  ) {}

  async execute(): Promise<AppDataExport> {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      recipes: await this.recipeRepo.getAll(),
      ingredients: await this.ingredientRepo.getAll(),
      mealPlan: await this.mealPlanRepo.getCurrent(),
      shoppingList: await this.shoppingListRepo.getCurrent(),
    }
  }
}
