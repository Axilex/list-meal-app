import type { Recipe } from '@/domain/models'
import type { RecipeRepository } from '@/domain/repositories'

export class GetRecipesUseCase {
  constructor(private readonly recipeRepo: RecipeRepository) {}

  async execute(): Promise<Recipe[]> {
    const recipes = await this.recipeRepo.getAll()
    return [...recipes].sort((a, b) => a.name.localeCompare(b.name, 'fr'))
  }
}
