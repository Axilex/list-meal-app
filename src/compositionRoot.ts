import {
  MealPlanService,
  RecipeService,
  ShoppingListService,
} from './domain/services'
import {
  LocalStorageIngredientRepository,
  LocalStorageMealPlanRepository,
  LocalStorageRecipeRepository,
  LocalStorageShoppingListRepository,
} from './infrastructure/storage'
import {
  FirebaseAuthGateway,
  FirestoreIngredientRepository,
  FirestoreMealPlanRepository,
  FirestoreRecipeRepository,
  FirestoreShoppingListRepository,
  isFirebaseConfigured,
} from './infrastructure/firebase'
import type { AuthGateway } from './application/auth/AuthGateway'
import {
  DeleteRecipeUseCase,
  ExportDataUseCase,
  GenerateShoppingListUseCase,
  GetCurrentMealPlanUseCase,
  GetCurrentShoppingListUseCase,
  GetIngredientsUseCase,
  GetRecipesUseCase,
  ImportDataUseCase,
  RemoveMealSlotUseCase,
  SaveMealSlotUseCase,
  SaveRecipeUseCase,
  ToggleShoppingItemUseCase,
  UncheckAllShoppingItemsUseCase,
} from './application/usecases'
import type { UseCases } from './ui/di'

// Composition root : assemblage des implémentations concrètes.
// Firestore quand la config Firebase est présente (.env.local),
// sinon localStorage (dev sans config, tests).
function createRepositories() {
  if (isFirebaseConfigured()) {
    return {
      recipeRepo: new FirestoreRecipeRepository(),
      mealPlanRepo: new FirestoreMealPlanRepository(),
      ingredientRepo: new FirestoreIngredientRepository(),
      shoppingListRepo: new FirestoreShoppingListRepository(),
    }
  }
  return {
    recipeRepo: new LocalStorageRecipeRepository(),
    mealPlanRepo: new LocalStorageMealPlanRepository(),
    ingredientRepo: new LocalStorageIngredientRepository(),
    shoppingListRepo: new LocalStorageShoppingListRepository(),
  }
}

// En mode Firebase, l'app est protégée par le compte commun ; en mode
// localStorage il n'y a pas de connexion (null = pas de garde).
export function createAuthGateway(): AuthGateway | null {
  return isFirebaseConfigured() ? new FirebaseAuthGateway() : null
}

export function createUseCases(): UseCases {
  const { recipeRepo, mealPlanRepo, ingredientRepo, shoppingListRepo } =
    createRepositories()

  const recipeService = new RecipeService()
  const mealPlanService = new MealPlanService()
  const shoppingListService = new ShoppingListService()

  return {
    saveRecipe: new SaveRecipeUseCase(recipeRepo, ingredientRepo, recipeService),
    deleteRecipe: new DeleteRecipeUseCase(recipeRepo, mealPlanRepo, mealPlanService),
    getRecipes: new GetRecipesUseCase(recipeRepo),
    getIngredients: new GetIngredientsUseCase(ingredientRepo),
    getCurrentMealPlan: new GetCurrentMealPlanUseCase(mealPlanRepo),
    saveMealSlot: new SaveMealSlotUseCase(mealPlanRepo, mealPlanService),
    removeMealSlot: new RemoveMealSlotUseCase(mealPlanRepo, mealPlanService),
    generateShoppingList: new GenerateShoppingListUseCase(
      mealPlanRepo,
      recipeRepo,
      ingredientRepo,
      shoppingListService,
      shoppingListRepo,
    ),
    getCurrentShoppingList: new GetCurrentShoppingListUseCase(shoppingListRepo),
    toggleShoppingItem: new ToggleShoppingItemUseCase(shoppingListRepo),
    uncheckAllShoppingItems: new UncheckAllShoppingItemsUseCase(shoppingListRepo),
    exportData: new ExportDataUseCase(
      recipeRepo,
      ingredientRepo,
      mealPlanRepo,
      shoppingListRepo,
    ),
    importData: new ImportDataUseCase(
      recipeRepo,
      ingredientRepo,
      mealPlanRepo,
      shoppingListRepo,
    ),
  }
}
