// Fakes in-memory pour les tests des use cases (non utilisés en production).
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

export class InMemoryRecipeRepository implements RecipeRepository {
  constructor(public recipes: Recipe[] = []) {}

  async getAll(): Promise<Recipe[]> {
    return [...this.recipes]
  }

  async getById(id: string): Promise<Recipe | null> {
    return this.recipes.find((r) => r.id === id) ?? null
  }

  async save(recipe: Recipe): Promise<void> {
    const index = this.recipes.findIndex((r) => r.id === recipe.id)
    if (index === -1) {
      this.recipes.push(recipe)
    } else {
      this.recipes[index] = recipe
    }
  }

  async delete(id: string): Promise<void> {
    this.recipes = this.recipes.filter((r) => r.id !== id)
  }
}

export class InMemoryMealPlanRepository implements MealPlanRepository {
  constructor(public plan: MealPlan | null = null) {}

  async getCurrent(): Promise<MealPlan | null> {
    return this.plan
  }

  async save(mealPlan: MealPlan): Promise<void> {
    this.plan = mealPlan
  }
}

export class InMemoryIngredientRepository implements IngredientRepository {
  constructor(public ingredients: Ingredient[] = []) {}

  async getAll(): Promise<Ingredient[]> {
    return [...this.ingredients]
  }

  async getById(id: string): Promise<Ingredient | null> {
    return this.ingredients.find((i) => i.id === id) ?? null
  }

  async findByName(name: string): Promise<Ingredient | null> {
    const needle = name.trim().toLowerCase()
    return (
      this.ingredients.find((i) => i.name.trim().toLowerCase() === needle) ??
      null
    )
  }

  async save(ingredient: Ingredient): Promise<void> {
    const index = this.ingredients.findIndex((i) => i.id === ingredient.id)
    if (index === -1) {
      this.ingredients.push(ingredient)
    } else {
      this.ingredients[index] = ingredient
    }
  }
}

export class InMemoryShoppingListRepository implements ShoppingListRepository {
  constructor(public list: ShoppingList | null = null) {}

  async getCurrent(): Promise<ShoppingList | null> {
    return this.list
  }

  async save(list: ShoppingList): Promise<void> {
    this.list = list
  }
}
