import { collection, doc, getDoc, getDocs, setDoc, writeBatch } from 'firebase/firestore'
import type { Ingredient } from '@/domain/models'
import type { IngredientRepository } from '@/domain/repositories'
import { SEED_INGREDIENTS } from '../storage/seedIngredients'
import { getDb } from './firebaseApp'

export class FirestoreIngredientRepository implements IngredientRepository {
  private get col() {
    return collection(getDb(), 'ingredients')
  }

  async getAll(): Promise<Ingredient[]> {
    const snapshot = await getDocs(this.col)
    const stored = snapshot.docs.map((d) => d.data() as Ingredient)
    // Même fusion du seed que la version localStorage : tout ingrédient de
    // la liste préremplie absent (par nom, insensible à la casse) est ajouté.
    const known = new Set(stored.map((i) => i.name.trim().toLowerCase()))
    const missing = SEED_INGREDIENTS.filter(
      (s) => !known.has(s.name.toLowerCase()),
    )
    if (missing.length > 0) {
      const batch = writeBatch(getDb())
      for (const ingredient of missing) {
        batch.set(doc(this.col, ingredient.id), ingredient)
      }
      await batch.commit()
      stored.push(...missing)
    }
    return stored
  }

  async getById(id: string): Promise<Ingredient | null> {
    const snapshot = await getDoc(doc(this.col, id))
    return snapshot.exists() ? (snapshot.data() as Ingredient) : null
  }

  async findByName(name: string): Promise<Ingredient | null> {
    const needle = name.trim().toLowerCase()
    const ingredients = await this.getAll()
    return (
      ingredients.find((i) => i.name.trim().toLowerCase() === needle) ?? null
    )
  }

  async save(ingredient: Ingredient): Promise<void> {
    await setDoc(doc(this.col, ingredient.id), ingredient)
  }
}
