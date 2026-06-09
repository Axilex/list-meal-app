# Spécification détaillée Vue 3 — Application « Mes repas »

Cette spécification décrit une application web front-only en Vue 3 + TypeScript permettant de gérer des recettes, planifier des repas sur une semaine et générer automatiquement une liste de courses agrégée à partir des repas planifiés [file:20]. L’architecture cible repose sur une séparation claire entre domaine, cas d’usage, infrastructure de persistance locale et UI, afin de garder une base propre et facilement migrable vers un backend plus tard [file:20].

## Objectif produit

L’application doit permettre à un utilisateur de maintenir un petit catalogue de recettes, d’assigner ces recettes à des créneaux de repas sur plusieurs jours, puis de produire une liste de courses exploitable immédiatement à partir de ce plan [file:20]. Le design attendu est celui d’un produit culinaire premium et rassurant, avec fond crème clair, grandes cartes blanches arrondies, CTA corail, navigation très simple et états vides particulièrement soignés, comme visible sur la maquette fournie [file:19].

## Stack technique

- Vue 3
- TypeScript
- Vite
- Vue Router
- Pinia
- Tailwind CSS ou CSS variables + classes utilitaires maison
- Persistance locale via `localStorage` en V1, conformément à l’architecture proposée [file:20]

## Principes d’architecture

La V1 doit être conçue comme une application front-only, avec stockage local encapsulé derrière des repositories, afin de pouvoir remplacer plus tard l’implémentation locale par une implémentation HTTP sans modifier la logique métier ni les pages Vue [file:20]. Les services de domaine doivent rester purs, les use cases orchestrer les accès, et la UI Vue ne doit connaître que des interfaces applicatives ou des façades d’usage, jamais le stockage directement [file:20].

## Arborescence recommandée

```text
src/
  app/
    main.ts
    App.vue
    providers/
      dependency-container.ts
  domain/
    models/
      Ingredient.ts
      Recipe.ts
      MealPlan.ts
      ShoppingList.ts
    repositories/
      RecipeRepository.ts
      IngredientRepository.ts
      MealPlanRepository.ts
      ShoppingListRepository.ts
    services/
      RecipeService.ts
      MealPlanService.ts
      ShoppingListService.ts
  application/
    dto/
    usecases/
      recipes/
        GetRecipesUseCase.ts
        CreateRecipeUseCase.ts
        UpdateRecipeUseCase.ts
        DeleteRecipeUseCase.ts
      meal-plan/
        GetCurrentMealPlanUseCase.ts
        AddMealSlotUseCase.ts
        UpdateMealSlotUseCase.ts
        RemoveMealSlotUseCase.ts
      shopping-list/
        GenerateShoppingListUseCase.ts
        GetCurrentShoppingListUseCase.ts
        ToggleShoppingListItemUseCase.ts
        ClearCheckedShoppingListItemsUseCase.ts
  infrastructure/
    storage/
      browser-storage.ts
      keys.ts
    repositories/
      LocalStorageRecipeRepository.ts
      LocalStorageIngredientRepository.ts
      LocalStorageMealPlanRepository.ts
      LocalStorageShoppingListRepository.ts
    seed/
      seed-data.ts
  ui/
    router/
      index.ts
    layouts/
      AppShell.vue
    pages/
      MealPlanPage.vue
      RecipesPage.vue
      ShoppingListPage.vue
    components/
      base/
      common/
      navigation/
      meal-plan/
      recipes/
      shopping-list/
    composables/
    stores/
      ui.store.ts
      meal-plan.store.ts
      recipes.store.ts
      shopping-list.store.ts
  shared/
    constants/
    utils/
    types/
```

## Modèle de domaine

Le modèle métier de base doit reprendre les entités décrites dans le document source, avec `Ingredient`, `RecipeIngredient`, `Recipe`, `MealSlot`, `MealPlan`, `ShoppingListItem` et `ShoppingList`, ainsi qu’un type `Unit` pour normaliser les quantités [file:20]. La règle centrale de génération consiste à parcourir les slots du plan de repas, retrouver la recette liée, appliquer le ratio `servings demandées / servings de base`, puis agréger les ingrédients par ingrédient et unité avant tri alphabétique [file:20].

### Types proposés

```ts
export type Unit = 'g' | 'ml' | 'piece' | 'tbsp' | 'tsp' | 'custom'

export interface Ingredient {
  id: string
  name: string
  defaultUnit: Unit
  category?: string
}

export interface RecipeIngredient {
  ingredientId: string
  quantity: number
  unit: Unit
  note?: string
}

export interface Recipe {
  id: string
  name: string
  servings: number
  ingredients: RecipeIngredient[]
  instructions?: string
}

export interface MealSlot {
  id: string
  date: string
  mealType: 'lunch' | 'dinner'
  recipeId: string
  servings: number
}

export interface MealPlan {
  id: string
  name: string
  slots: MealSlot[]
}

export interface ShoppingListItem {
  ingredientId: string
  name: string
  totalQuantity: number
  unit: Unit
  notes?: string
}

export interface ShoppingList {
  generatedAt: string
  items: ShoppingListItem[]
}
```

## Repositories

Des interfaces de repository doivent être définies dans le domaine, puis implémentées dans l’infrastructure locale, comme recommandé dans l’architecture de référence [file:20]. Toute page Vue doit passer par des use cases utilisant ces interfaces, jamais par `localStorage` directement [file:20].

### Interfaces

```ts
export interface RecipeRepository {
  getAll(): Promise<Recipe[]>
  getById(id: string): Promise<Recipe | null>
  save(recipe: Recipe): Promise<void>
  delete(id: string): Promise<void>
}

export interface IngredientRepository {
  getAll(): Promise<Ingredient[]>
  saveAll(items: Ingredient[]): Promise<void>
}

export interface MealPlanRepository {
  getCurrent(): Promise<MealPlan | null>
  save(mealPlan: MealPlan): Promise<void>
}

export interface ShoppingListRepository {
  getCurrent(): Promise<ShoppingList | null>
  save(list: ShoppingList): Promise<void>
}
```

### Implémentations V1

- `LocalStorageRecipeRepository`
- `LocalStorageIngredientRepository`
- `LocalStorageMealPlanRepository`
- `LocalStorageShoppingListRepository`

Les clés de stockage doivent être explicites et versionnées, par exemple `mes-repas.recipes`, `mes-repas.ingredients`, `mes-repas.meal-plan.current` et `mes-repas.shopping-list.current`. Le parsing JSON doit être protégé avec fallback sur valeur vide en cas de corruption locale.

## Services de domaine

### `RecipeService`

Ce service valide les règles minimales de cohérence d’une recette, notamment l’obligation d’avoir un nom non vide et au moins un ingrédient, conformément à la base fonctionnelle décrite dans le document [file:20]. Il peut aussi normaliser les chaînes, nettoyer les quantités invalides et empêcher les lignes ingrédient complètement vides.

### `MealPlanService`

Ce service gère la cohérence du plan de repas, notamment la validité des dates, la présence d’IDs stables et l’absence de structure corrompue dans les slots, dans l’esprit des responsabilités décrites dans l’architecture fournie [file:20]. Il doit également permettre d’ajouter, mettre à jour et supprimer proprement un slot de repas.

### `ShoppingListService`

Ce service est le cœur métier. Il prend en entrée le plan de repas courant, la liste des recettes et la liste des ingrédients, puis produit une liste de courses agrégée, triée et prête à afficher, exactement comme décrit dans la proposition d’architecture [file:20]. Il ne connaît ni Vue, ni Pinia, ni `localStorage`.

## Use cases

Les use cases font le lien entre UI et domaine. Ils chargent les données depuis les repositories, invoquent les services et renvoient des résultats exploitables par les stores ou directement par les pages [file:20].

### Liste minimale des use cases

- `GetRecipesUseCase`
- `CreateRecipeUseCase`
- `UpdateRecipeUseCase`
- `DeleteRecipeUseCase`
- `GetCurrentMealPlanUseCase`
- `AddMealSlotUseCase`
- `UpdateMealSlotUseCase`
- `RemoveMealSlotUseCase`
- `GenerateShoppingListUseCase` [file:20]
- `GetCurrentShoppingListUseCase`
- `ToggleShoppingListItemUseCase`
- `ClearCheckedShoppingListItemsUseCase`

### Exemple de use case

```ts
export class GenerateShoppingListUseCase {
  constructor(
    private readonly mealPlanRepo: MealPlanRepository,
    private readonly recipeRepo: RecipeRepository,
    private readonly ingredientRepo: IngredientRepository,
    private readonly shoppingListRepo: ShoppingListRepository,
    private readonly shoppingListService: ShoppingListService,
  ) {}

  async execute(): Promise<ShoppingList> {
    const mealPlan = await this.mealPlanRepo.getCurrent()
    if (!mealPlan) throw new Error('No current meal plan')

    const recipes = await this.recipeRepo.getAll()
    const ingredients = await this.ingredientRepo.getAll()

    const list = this.shoppingListService.generate(mealPlan, recipes, ingredients)
    await this.shoppingListRepo.save(list)

    return list
  }
}
```

## Composition root

Le bootstrap de l’application doit instancier les repositories locaux, les services de domaine, puis les use cases, avant de les exposer à l’application Vue via `provide/inject` ou un petit container dédié, conformément au schéma proposé dans le document [file:20].

```ts
const recipeRepo = new LocalStorageRecipeRepository()
const ingredientRepo = new LocalStorageIngredientRepository()
const mealPlanRepo = new LocalStorageMealPlanRepository()
const shoppingListRepo = new LocalStorageShoppingListRepository()

const recipeService = new RecipeService()
const mealPlanService = new MealPlanService()
const shoppingListService = new ShoppingListService()

const generateShoppingListUseCase = new GenerateShoppingListUseCase(
  mealPlanRepo,
  recipeRepo,
  ingredientRepo,
  shoppingListRepo,
  shoppingListService,
)
```

## Layout global

Le layout global doit reprendre le langage visuel observé sur la maquette : header blanc horizontal, navigation simple, fond beige très clair, gros espacements et grande carte centrale arrondie [file:19]. La page ne doit jamais donner une impression d’outil dense ou administratif ; l’objectif est un rendu culinaire, chaleureux et premium [file:19].

### `AppShell.vue`

Responsabilités :
- afficher le header global
- contenir la navigation principale
- centrer le contenu
- gérer les paddings responsive

Structure type :

```vue
<template>
  <div class="app-shell">
    <AppHeader />
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>
```

## Design system UI

La maquette impose plusieurs codes forts : fond crème rosé très pâle, titres très foncés et ronds, surfaces blanches larges, ombres diffuses, boutons corail très arrondis et icônes illustratives à gauche des titres de page [file:19]. Tous les composants doivent reprendre ce système pour garder une cohérence forte sur les trois écrans principaux [file:19].

### Tokens suggérés

```css
:root {
  --bg: #fbf4ec;
  --surface: #fffdfb;
  --surface-soft: #fff8f2;
  --text: #241f31;
  --text-muted: #7b7484;
  --primary: #ff6247;
  --primary-hover: #f0553c;
  --border-soft: rgba(36, 31, 49, 0.08);
  --shadow-soft: 0 10px 30px rgba(120, 92, 64, 0.10);
  --shadow-button: 0 6px 0 rgba(208, 58, 38, 0.85);
  --radius-card: 28px;
  --radius-pill: 999px;
}
```

### Composants de base à créer

- `BaseButton`
- `BaseIconButton`
- `BaseCard`
- `BaseInput`
- `BaseTextarea`
- `BaseSelect`
- `BaseCheckbox`
- `BaseModal`
- `BaseEmptyState`
- `BasePageHeader`

## Routing

Le routeur doit exposer trois vues principales, cohérentes avec les maquettes et le document fonctionnel : plan de repas, recettes et liste de courses [file:19][file:20]. La route racine doit rediriger vers le plan de repas.

```ts
const routes = [
  { path: '/', redirect: '/meal-plan' },
  { path: '/meal-plan', name: 'meal-plan', component: MealPlanPage },
  { path: '/recipes', name: 'recipes', component: RecipesPage },
  { path: '/shopping-list', name: 'shopping-list', component: ShoppingListPage },
]
```

## Page `MealPlanPage.vue`

La page du plan de repas doit être la page d’entrée principale. La maquette de référence montre un grand titre “Plan de repas” à gauche avec icône calendrier, un bouton “Liste de courses →” à droite, un indicateur de semaine centré, deux boutons fléchés pour naviguer entre les semaines, puis une immense carte blanche principale contenant soit un état vide, soit la grille des repas [file:19].

### Structure attendue

1. `MealPlanPageHeader`
2. `WeekSwitcher`
3. `MealPlanBoardCard`

### Composants métier

- `MealPlanPageHeader.vue`
- `WeekSwitcher.vue`
- `MealPlanGrid.vue`
- `MealPlanDayColumn.vue`
- `MealSlotCard.vue`
- `MealSlotModal.vue`
- `EmptyMealPlanState.vue`

### État vide

L’état vide doit être proche de la maquette : pastille rose clair avec icône, petit label uppercase, phrase explicative et bouton principal “Ajouter une recette” [file:19]. Il apparaît lorsqu’aucune recette n’existe encore ou lorsqu’aucun slot n’est disponible à planifier faute de base de recettes [file:19][file:20].

### État rempli

Une fois des recettes créées, la carte principale affiche une grille semaine. Le document de référence propose une vue type calendrier avec jours en colonnes et repas midi/soir, ainsi qu’un bouton d’ajout/modification ouvrant un modal [file:20]. Chaque cellule doit permettre d’ajouter une recette, de changer les portions, d’éditer ou de supprimer un slot.

## Page `RecipesPage.vue`

La page des recettes doit reprendre le même shell visuel que la page plan de repas, avec un titre à gauche, un bouton “Ajouter une recette” à droite et une grande carte de contenu [file:20]. Une maquette précédente de la vue recettes montrait déjà cette structure avec une grande carte vide et une action principale en haut à droite, ce qui doit être conservé pour la cohérence d’ensemble [file:2].

### Composants métier

- `RecipeList.vue`
- `RecipeCard.vue`
- `RecipeFormModal.vue`
- `RecipeIngredientRows.vue`
- `RecipeIngredientRow.vue`
- `EmptyRecipesState.vue`

### Formulaire recette

Le formulaire recette doit permettre de saisir :
- nom
- portions
- ingrédients
- instructions facultatives [file:20]

Chaque ligne ingrédient doit gérer :
- ingrédient existant ou saisie libre
- quantité
- unité
- note facultative [file:20]

La validation minimale doit empêcher une recette sans nom ou sans ingrédient, conformément aux règles métier évoquées dans le document source [file:20].

## Page `ShoppingListPage.vue`

La vue liste de courses doit transformer le résultat de génération en véritable écran opérationnel. Le document précise que cette page doit afficher les éléments générés, avec nom, quantité, unité, case à cocher, note éventuelle, ainsi que des actions “Régénérer” et “Imprimer” [file:20]. Une maquette précédente montre déjà un titre à gauche, une date de génération, deux actions en haut à droite et une grande carte principale [file:1].

### Layout conseillé

Desktop :
- colonne principale avec liste groupée
- aside résumé avec statistiques et actions

Mobile :
- une seule colonne
- résumé repositionné au-dessus ou en bas

### Composants métier

- `ShoppingListPageHeader.vue`
- `ShoppingListSummaryCard.vue`
- `ShoppingCategorySection.vue`
- `ShoppingListItemRow.vue`
- `ShoppingListEmptyState.vue`
- `PrintShoppingListButton.vue`

### Comportement attendu

La liste de courses doit être générée depuis le plan de repas courant via le service métier prévu à cet effet, puis sauvegardée localement comme état de liste courante [file:20]. Les lignes doivent être cochables, imprimables et idéalement groupées par catégorie ou rayon si l’ingrédient possède cette information.

## Stores Pinia

Des stores Pinia sont utiles pour l’état d’écran, l’ouverture des modals, le suivi du chargement et la coordination entre composants. Ils ne doivent pas embarquer la logique métier centrale, déjà prise en charge par les use cases et services [file:20].

### Stores recommandés

- `useRecipesStore`
- `useMealPlanStore`
- `useShoppingListStore`
- `useUiStore`

### Responsabilités

`recipesStore` :
- charger les recettes
- ouvrir/fermer la modal recette
- sélectionner la recette en édition

`mealPlanStore` :
- maintenir la semaine active
- charger le plan courant
- ouvrir la modal d’édition d’un slot

`shoppingListStore` :
- charger la liste courante
- déclencher la génération
- calculer le nombre d’éléments cochés côté UI

`uiStore` :
- toasts
- dialogues de confirmation
- états globaux de chargement

## Composables utiles

- `useDependencies()` pour récupérer les use cases injectés
- `useWeekNavigation()` pour calculer les bornes de semaine
- `useRecipeForm()` pour gérer le formulaire recette
- `usePrintShoppingList()` pour encapsuler l’impression
- `useResponsiveLayout()` pour certains comportements mobiles

## Contrats de composants

### `MealSlotCard.vue`

```ts
interface MealSlotCardProps {
  date: string
  mealType: 'lunch' | 'dinner'
  slot?: MealSlotViewModel | null
  disabled?: boolean
}
```

Événements :
- `add`
- `edit`
- `remove`

### `RecipeFormModal.vue`

```ts
interface RecipeFormValues {
  id?: string
  name: string
  servings: number
  ingredients: Array<{
    ingredientId?: string
    ingredientName: string
    quantity: number
    unit: Unit
    note?: string
  }>
  instructions?: string
}
```

### `ShoppingListItemRow.vue`

```ts
interface ShoppingListItemViewModel {
  id: string
  ingredientId: string
  name: string
  quantityLabel: string
  totalQuantity: number
  unit: Unit
  note?: string
  checked: boolean
  category?: string
}
```

## UX détaillée

Les interactions doivent rester très douces, cohérentes avec le rendu premium de la maquette. Les boutons doivent avoir un léger feedback, les modals une apparition discrète, les états vides être illustrés et les actions de suppression confirmées [file:19].

### À prévoir

- hover léger sur CTA
- focus visible clavier
- flèches semaine accessibles avec `aria-label`
- confirmation avant suppression de recette
- toast après sauvegarde ou régénération
- empty states sur toutes les pages
- fallback si aucune donnée locale n’existe

## Responsive

Le document de base demande explicitement un comportement mobile friendly dès le début, avec empilement vertical, listes scrollables et boutons larges [file:20]. Sur mobile, la navigation peut devenir une bottom bar ou une rangée d’onglets scrollables, la grille de repas peut passer en cartes par jour et la liste de courses doit rester exploitable au pouce [file:20].

## Évolution future

La structure actuelle doit préparer une V2 avec backend NestJS, synchronisation multi-device et authentification, sans remise en cause du domaine ni de la UI, exactement comme prévu dans la roadmap initiale [file:20]. Le remplacement des repositories locaux par des repositories API doit être l’unique évolution majeure d’infrastructure lors de cette migration [file:20].

## Résumé opérationnel pour un agent IA

Développer une application Vue 3 + TypeScript + Vite appelée `Mes repas`, structurée en couches `domain / application / infrastructure / ui`, avec persistance locale en V1, gestion de recettes, planification de repas hebdomadaire et génération de liste de courses à partir du plan courant [file:20]. Reproduire une UI chaude, minimaliste et premium inspirée de la maquette fournie : header blanc, fond crème, cartes blanches arrondies, CTA corail, grands espaces et états vides centrés très soignés [file:19].
