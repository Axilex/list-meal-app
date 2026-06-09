# Application de liste de courses pour les repas

## 1. Objectifs

- Permettre à un utilisateur de :
  - gérer un petit catalogue de recettes (nom, portions, ingrédients),
  - planifier ses repas sur quelques jours,
  - générer automatiquement une liste de courses agrégée à partir des repas choisis.
- Garder une architecture simple mais propre, facilement extensible vers une "grosse" application (multi‑utilisateur, synchronisation, mobile, etc.).
- Respecter les principes SOLID et une séparation claire des responsabilités, même en V1.

---

## 2. Choix d’architecture (V1)

### 2.1. Décision

Pour la V1 : **application web front‑only**, sans backend distant.

- Stockage dans `localStorage` (ou `indexedDB`) via une couche d’abstraction.
- Possible plus tard : extraire la couche d’accès aux données vers un backend NestJS (API REST ou GraphQL) sans changer le reste du code.

### 2.2. Justification

- Tu peux shipper plus vite, sans te battre avec l’infra, l’auth, le déploiement backend.
- Tu peux déjà appliquer SOLID (domain services, ports/adapters, séparation UI / domain / infra) dans le front.
- Quand/si tu veux un backend : tu remplaces simplement les implémentations "local" par des implémentations HTTP.

---

## 3. Stack technique

- **Front** :
  - Framework : Vue 3 + TypeScript (ou React + TypeScript si tu préfères, le design d’architecture reste le même).
  - Build : Vite.
  - Styling : Tailwind CSS ou CSS minimal utilitaire (pour rester rapide et sobre).
- **Pas de backend** en V1.
- **Stockage** : `localStorage` via un `StorageRepository` typé.

Arborescence type :

```text
src/
  domain/
    models/
      Recipe.ts
      Ingredient.ts
      RecipeIngredient.ts
      MealPlan.ts
    services/
      RecipeService.ts
      MealPlanService.ts
      ShoppingListService.ts
  application/
    usecases/
      AddRecipeUseCase.ts
      UpdateRecipeUseCase.ts
      GenerateShoppingListUseCase.ts
  infrastructure/
    storage/
      LocalStorageRecipeRepository.ts
      LocalStorageMealPlanRepository.ts
    mappers/
      RecipeMapper.ts
  ui/
    components/
      RecipeForm.vue
      RecipeList.vue
      MealPlanCalendar.vue
      ShoppingListView.vue
    pages/
      HomePage.vue
      RecipesPage.vue
      ShoppingListPage.vue
    router/
      index.ts
  shared/
    utils/
    types/
```

---

## 4. Modèle de domaine

### 4.1. Entités principales

```ts
// Nombre d’unités : g, ml, pièces, etc.
export type Unit = 'g' | 'ml' | 'piece' | 'tbsp' | 'tsp' | 'custom';

export interface Ingredient {
  id: string;
  name: string;           // "Tomate", "Riz basmati", "Poulet"...
  defaultUnit: Unit;      // unité préférée
}

export interface RecipeIngredient {
  ingredientId: string;   // référence à Ingredient
  quantity: number;       // quantité pour la recette entière
  unit: Unit;             // unité pour cette recette (peut différer de defaultUnit)
  note?: string;          // "en boîte", "en dés", etc.
}

export interface Recipe {
  id: string;
  name: string;
  servings: number;                 // nombre de portions de base
  ingredients: RecipeIngredient[];
  instructions?: string;            // texte libre, optionnel
}

export interface MealSlot {
  id: string;
  date: string;                     // ISO string, ex: '2026-06-06'
  mealType: 'lunch' | 'dinner';
  recipeId: string;                 // référence à Recipe
  servings: number;                 // nb de portions pour ce repas
}

export interface MealPlan {
  id: string;
  name: string;                     // "Semaine 23" ou "Vacances"
  slots: MealSlot[];
}

export interface ShoppingListItem {
  ingredientId: string;
  name: string;                     // désambiguïté si besoin
  totalQuantity: number;
  unit: Unit;
  notes?: string;
}

export interface ShoppingList {
  generatedAt: string;              // ISO date
  items: ShoppingListItem[];
}
```

### 4.2. Services de domaine

- `ShoppingListService`
  - Entrée : `MealPlan` + `Recipe[]` + `Ingredient[]`.
  - Sortie : `ShoppingList`.
  - Logique :
    - pour chaque `MealSlot`, trouver la recette,
    - calculer un ratio `slot.servings / recipe.servings`,
    - multiplier les quantités d’ingrédients,
    - agréger par `ingredientId` + `unit`,
    - retourner la liste triée par `name`.

- `RecipeService`
  - CRUD basiques (création, mise à jour, suppression).
  - Validation (pas de recette sans nom, ni sans ingrédients).

- `MealPlanService`
  - Ajout / suppression de repas dans un plan.
  - Vérification de cohérence (pas de doublons d’`id`, dates valides, etc.).

Ces services sont **purs** (pas d’accès direct à `localStorage`, ni à l’UI), pour rester testables et respecter SRP.

---

## 5. Interfaces et repositories (SOLID)

On définit des interfaces (ports) dans `domain/` et on les implémente dans `infrastructure/`.

```ts
export interface RecipeRepository {
  getAll(): Promise<Recipe[]>;
  getById(id: string): Promise<Recipe | null>;
  save(recipe: Recipe): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface MealPlanRepository {
  getCurrent(): Promise<MealPlan | null>;
  save(mealPlan: MealPlan): Promise<void>;
}
```

Implémentation V1 : `LocalStorageRecipeRepository`, `LocalStorageMealPlanRepository`.

```ts
export class LocalStorageRecipeRepository implements RecipeRepository {
  private readonly key = 'recipes';

  async getAll(): Promise<Recipe[]> {
    const raw = localStorage.getItem(this.key);
    if (!raw) return [];
    return JSON.parse(raw) as Recipe[];
  }

  async getById(id: string): Promise<Recipe | null> {
    const recipes = await this.getAll();
    return recipes.find(r => r.id === id) ?? null;
  }

  async save(recipe: Recipe): Promise<void> {
    const recipes = await this.getAll();
    const index = recipes.findIndex(r => r.id === recipe.id);
    if (index === -1) {
      recipes.push(recipe);
    } else {
      recipes[index] = recipe;
    }
    localStorage.setItem(this.key, JSON.stringify(recipes));
  }

  async delete(id: string): Promise<void> {
    const recipes = await this.getAll();
    const filtered = recipes.filter(r => r.id !== id);
    localStorage.setItem(this.key, JSON.stringify(filtered));
  }
}
```

Plus tard, tu pourras ajouter `ApiRecipeRepository` (HTTP), sans changer la UI ni les services de domaine (respect de DIP et OCP).

---

## 6. Couches applicatives (use cases)

Les **use cases** orchestrent les services de domaine et les repositories. Ils sont utilisés par la UI.

Exemple : `GenerateShoppingListUseCase`.

```ts
interface GenerateShoppingListInput {
  mealPlanId: string;   // ou "current"
}

export class GenerateShoppingListUseCase {
  constructor(
    private readonly mealPlanRepo: MealPlanRepository,
    private readonly recipeRepo: RecipeRepository,
    private readonly ingredientRepo: IngredientRepository,
    private readonly shoppingListService: ShoppingListService,
  ) {}

  async execute(input: GenerateShoppingListInput): Promise<ShoppingList> {
    const mealPlan = await this.mealPlanRepo.getCurrent();
    if (!mealPlan) {
      throw new Error('No meal plan');
    }

    const recipes = await this.recipeRepo.getAll();
    const ingredients = await this.ingredientRepo.getAll();

    return this.shoppingListService.generate(mealPlan, recipes, ingredients);
  }
}
```

La UI (Vue components) ne connaît que les use cases, pas les détails de stockage.

---

## 7. UI et navigation

### 7.1. Pages

1. `HomePage`
   - aperçu du plan de repas actuel (semaine en cours) :
     - tableau ou calendrier avec jours (lun → dim) × repas (midi/soir),
     - bouton "Ajouter/modifier" un repas qui ouvre un modal.
   - CTA pour aller à la liste de courses.

2. `RecipesPage`
   - liste de toutes les recettes (nom, portions),
   - boutons : "Ajouter une recette" / "Modifier" / "Supprimer",
   - formulaire simple pour :
     - nom,
     - nb de portions,
     - liste d’ingrédients (table éditable : name, quantity, unit, note).

3. `ShoppingListPage`
   - affiche la liste de courses générée :
     - sections par lettre ou par type (plus tard),
     - chaque ligne : case à cocher, nom, quantité + unité, note.
   - bouton "Regénérer" (si tu changes le plan de repas).
   - bouton "Imprimer".

### 7.2. Design simple

- Layout en 3 zones :
  - header minimal (titre, navigation),
  - contenu centré, largeur max (ex : 960px),
  - fond clair, peu de couleurs.
- Composants réutilisables :
  - `BaseButton`, `BaseInput`, `BaseSelect`, `BaseCard`, pour garder un design cohérent.
- Mobile friendly dès le début (stack vertical, listes scrollables, boutons gros).

---

## 8. Application des principes SOLID

- **S (Single Responsibility)** :
  - chaque service a une seule raison de changer (ex : `ShoppingListService` = calcul de la liste, pas de persistance),
  - `LocalStorageRecipeRepository` gère uniquement la façon de stocker les recettes.

- **O (Open/Closed)** :
  - tu peux ajouter de nouveaux types de repositories (API, IndexedDB) sans modifier les services de domaine.

- **L (Liskov Substitution)** :
  - toute implémentation de `RecipeRepository` doit pouvoir être utilisée sans casser le code qui dépend de l’interface.

- **I (Interface Segregation)** :
  - plusieurs interfaces petites (`RecipeRepository`, `MealPlanRepository`, etc.) plutôt qu’une grosse interface générique.

- **D (Dependency Inversion)** :
  - la UI dépend des abstractions (use cases, interfaces de repository),
  - les implémentations concrètes (LocalStorage, API) sont injectées au démarrage (composition root).

---

## 9. Composition root (bootstrap)

Dans `main.ts` (ou un fichier dédié), tu fais l’assemblage :

```ts
const recipeRepo = new LocalStorageRecipeRepository();
const mealPlanRepo = new LocalStorageMealPlanRepository();
const ingredientRepo = new LocalStorageIngredientRepository();

const shoppingListService = new ShoppingListService();

const generateShoppingListUseCase = new GenerateShoppingListUseCase(
  mealPlanRepo,
  recipeRepo,
  ingredientRepo,
  shoppingListService,
);

const app = createApp(App);

app.provide('generateShoppingListUseCase', generateShoppingListUseCase);
// ... autres use cases / deps

app.use(router);
app.mount('#app');
```

Les composants Vue récupèrent les use cases via `inject` ou via un petit conteneur de dépendances.

---

## 10. Roadmap d’évolution vers une "grosse" app

1. **V1** (front‑only) :
   - CRUD recettes,
   - plan de repas simple (semaine),
   - génération de liste de courses + impression,
   - persistance locale via `localStorage`.

2. **V2** :
   - ajout d’un backend NestJS :
     - endpoints CRUD pour recettes, plans,
     - authentification simple (email + mot de passe ou magic link),
     - synchro multi‑devices.
   - création de `ApiRecipeRepository`, `ApiMealPlanRepository`.

3. **V3** :
   - partage de plans de repas entre utilisateurs,
   - suggestions automatiques (recettes fréquentes, recettes de saison),
   - export PDF plus avancé.

Toute la structure V1 est pensée pour que le passage à V2/V3 soit surtout un changement d’implémentation, pas une réécriture du domaine ni de la UI.