import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { MealPlan } from '@/domain/models'
import type { MealPlanRepository } from '@/domain/repositories'
import { getDb } from './firebaseApp'
import { toFirestoreData } from './firestoreData'

export class FirestoreMealPlanRepository implements MealPlanRepository {
  // Un seul plan actif, comme la clé unique 'mealapp.mealPlan.current'.
  private get ref() {
    return doc(getDb(), 'mealPlans', 'current')
  }

  async getCurrent(): Promise<MealPlan | null> {
    const snapshot = await getDoc(this.ref)
    return snapshot.exists() ? (snapshot.data() as MealPlan) : null
  }

  async save(mealPlan: MealPlan): Promise<void> {
    await setDoc(this.ref, toFirestoreData(mealPlan))
  }
}
