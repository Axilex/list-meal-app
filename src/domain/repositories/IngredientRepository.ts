import type { Ingredient } from '../models'

export interface IngredientRepository {
  getAll(): Promise<Ingredient[]>
  getById(id: string): Promise<Ingredient | null>
  /** Recherche par nom, insensible à la casse et aux espaces de bord. */
  findByName(name: string): Promise<Ingredient | null>
  save(ingredient: Ingredient): Promise<void>
}
