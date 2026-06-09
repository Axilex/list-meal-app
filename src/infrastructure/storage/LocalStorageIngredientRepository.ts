import type { Ingredient } from '@/domain/models'
import type { IngredientRepository } from '@/domain/repositories'
import { readJson, writeJson } from './storage'
import { SEED_INGREDIENTS } from './seedIngredients'

export class LocalStorageIngredientRepository implements IngredientRepository {
  private readonly key = 'mealapp.ingredients'

  async getAll(): Promise<Ingredient[]> {
    const stored = readJson<Ingredient[]>(this.key) ?? []
    // Fusionne la liste préremplie : tout ingrédient du seed dont le nom
    // n'existe pas encore (insensible à la casse) est ajouté et persisté.
    const known = new Set(stored.map((i) => i.name.trim().toLowerCase()))
    const missing = SEED_INGREDIENTS.filter(
      (s) => !known.has(s.name.toLowerCase()),
    )
    if (missing.length > 0) {
      stored.push(...missing)
      writeJson(this.key, stored)
    }
    return stored
  }

  async getById(id: string): Promise<Ingredient | null> {
    const ingredients = await this.getAll()
    return ingredients.find((i) => i.id === id) ?? null
  }

  async findByName(name: string): Promise<Ingredient | null> {
    const needle = name.trim().toLowerCase()
    const ingredients = await this.getAll()
    return (
      ingredients.find((i) => i.name.trim().toLowerCase() === needle) ?? null
    )
  }

  async save(ingredient: Ingredient): Promise<void> {
    const ingredients = await this.getAll()
    const index = ingredients.findIndex((i) => i.id === ingredient.id)
    if (index === -1) {
      ingredients.push(ingredient)
    } else {
      ingredients[index] = ingredient
    }
    writeJson(this.key, ingredients)
  }
}
