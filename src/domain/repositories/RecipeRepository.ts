import type { Recipe } from '../models'

export interface RecipeRepository {
  getAll(): Promise<Recipe[]>
  getById(id: string): Promise<Recipe | null>
  save(recipe: Recipe): Promise<void>
  delete(id: string): Promise<void>
}
