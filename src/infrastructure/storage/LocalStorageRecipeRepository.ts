import type { Recipe } from '@/domain/models'
import type { RecipeRepository } from '@/domain/repositories'
import { readJson, writeJson } from './storage'

export class LocalStorageRecipeRepository implements RecipeRepository {
  private readonly key = 'mealapp.recipes'

  async getAll(): Promise<Recipe[]> {
    return readJson<Recipe[]>(this.key) ?? []
  }

  async getById(id: string): Promise<Recipe | null> {
    const recipes = await this.getAll()
    return recipes.find((r) => r.id === id) ?? null
  }

  async save(recipe: Recipe): Promise<void> {
    const recipes = await this.getAll()
    const index = recipes.findIndex((r) => r.id === recipe.id)
    if (index === -1) {
      recipes.push(recipe)
    } else {
      recipes[index] = recipe
    }
    writeJson(this.key, recipes)
  }

  async delete(id: string): Promise<void> {
    const recipes = await this.getAll()
    writeJson(
      this.key,
      recipes.filter((r) => r.id !== id),
    )
  }
}
