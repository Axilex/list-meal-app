import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from 'firebase/firestore'
import type { Recipe } from '@/domain/models'
import type { RecipeRepository } from '@/domain/repositories'
import { getDb } from './firebaseApp'
import { toFirestoreData } from './firestoreData'

export class FirestoreRecipeRepository implements RecipeRepository {
  private get col() {
    return collection(getDb(), 'recipes')
  }

  async getAll(): Promise<Recipe[]> {
    const snapshot = await getDocs(this.col)
    return snapshot.docs.map((d) => d.data() as Recipe)
  }

  async getById(id: string): Promise<Recipe | null> {
    const snapshot = await getDoc(doc(this.col, id))
    return snapshot.exists() ? (snapshot.data() as Recipe) : null
  }

  async save(recipe: Recipe): Promise<void> {
    await setDoc(doc(this.col, recipe.id), toFirestoreData(recipe))
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(this.col, id))
  }
}
