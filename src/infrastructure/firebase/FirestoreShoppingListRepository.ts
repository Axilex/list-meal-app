import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { ShoppingList } from '@/domain/models'
import type { ShoppingListRepository } from '@/domain/repositories'
import { getDb } from './firebaseApp'
import { toFirestoreData } from './firestoreData'

export class FirestoreShoppingListRepository implements ShoppingListRepository {
  private get ref() {
    return doc(getDb(), 'shoppingLists', 'current')
  }

  async getCurrent(): Promise<ShoppingList | null> {
    const snapshot = await getDoc(this.ref)
    return snapshot.exists() ? (snapshot.data() as ShoppingList) : null
  }

  async save(list: ShoppingList): Promise<void> {
    await setDoc(this.ref, toFirestoreData(list))
  }
}
