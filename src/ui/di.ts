import { inject, type InjectionKey } from 'vue'
import type { AuthGateway } from '@/application/auth/AuthGateway'
import type {
  DeleteRecipeUseCase,
  GenerateShoppingListUseCase,
  GetCurrentMealPlanUseCase,
  GetCurrentShoppingListUseCase,
  GetIngredientsUseCase,
  GetRecipesUseCase,
  RemoveMealSlotUseCase,
  SaveMealSlotUseCase,
  SaveRecipeUseCase,
  ToggleShoppingItemUseCase,
} from '@/application/usecases'

// La UI ne connaît que les use cases ; les implémentations concrètes
// sont assemblées dans main.ts (composition root).
export interface UseCases {
  saveRecipe: SaveRecipeUseCase
  deleteRecipe: DeleteRecipeUseCase
  getRecipes: GetRecipesUseCase
  getIngredients: GetIngredientsUseCase
  getCurrentMealPlan: GetCurrentMealPlanUseCase
  saveMealSlot: SaveMealSlotUseCase
  removeMealSlot: RemoveMealSlotUseCase
  generateShoppingList: GenerateShoppingListUseCase
  getCurrentShoppingList: GetCurrentShoppingListUseCase
  toggleShoppingItem: ToggleShoppingItemUseCase
}

export const USE_CASES: InjectionKey<UseCases> = Symbol('useCases')

export function useUseCases(): UseCases {
  const useCases = inject(USE_CASES)
  if (!useCases) {
    throw new Error('Use cases non fournis : composition root manquant (main.ts).')
  }
  return useCases
}

// Passerelle d'auth : null en mode localStorage (aucune connexion requise).
export const AUTH_GATEWAY: InjectionKey<AuthGateway | null> = Symbol('authGateway')

export function useAuthGateway(): AuthGateway | null {
  return inject(AUTH_GATEWAY, null)
}
