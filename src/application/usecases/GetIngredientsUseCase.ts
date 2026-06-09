import type { Ingredient } from '@/domain/models'
import type { IngredientRepository } from '@/domain/repositories'

export class GetIngredientsUseCase {
  constructor(private readonly ingredientRepo: IngredientRepository) {}

  async execute(): Promise<Ingredient[]> {
    return this.ingredientRepo.getAll()
  }
}
