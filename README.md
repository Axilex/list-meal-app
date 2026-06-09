# 🥕 Liste de courses pour les repas

Application web de planification de repas : on crée ses **recettes**, on les place
dans un **plan de repas hebdomadaire**, et l'app génère la **liste de courses
agrégée** de la semaine.

V1 100 % front : aucun backend, les données restent dans le `localStorage` du
navigateur. La spécification complète est dans [`liste-courses-app.md`](./liste-courses-app.md).

## Fonctionnalités

- **Recettes** (`/recipes`) : création/édition avec nom, portions, instructions et
  ingrédients (quantité, unité, note). Les ingrédients sont créés à la volée par
  nom (insensible à la casse) et proposés en autocomplétion pendant la saisie.
- **Liste d'ingrédients préremplie** : ~115 ingrédients courants (légumes, viandes,
  épicerie…) sont fusionnés dans le stockage au premier chargement —
  voir [`src/infrastructure/storage/seedIngredients.ts`](./src/infrastructure/storage/seedIngredients.ts)
  pour enrichir la liste.
- **Plan de repas** (`/`) : grille de la semaine (déjeuner/dîner), navigation
  semaine précédente/suivante, choix de la recette et du nombre de portions par repas.
- **Liste de courses** (`/shopping-list`) : générée pour la semaine affichée,
  quantités agrégées entre recettes et ajustées au ratio de portions. Les cases
  cochées survivent au rechargement ; « Regénérer » les remet à zéro.

## Démarrage

```bash
npm install
npm run dev        # serveur de dev Vite
```

| Commande            | Effet                                      |
| ------------------- | ------------------------------------------ |
| `npm run dev`       | Lancement local (Vite)                     |
| `npm run build`     | Typecheck + build de production            |
| `npm test`          | Tests (Vitest)                             |
| `npm run typecheck` | `vue-tsc -b` (références de projet)        |
| `npm run preview`   | Prévisualisation du build                  |

## Stack

- Vue 3 (Composition API) + TypeScript, Vite, vue-router
- Tailwind CSS v4 (plugin `@tailwindcss/vite`, tokens dans `src/style.css`)
- Vitest (+ jsdom pour les tests UI), tests colocalisés `*.test.ts`

## Architecture

Architecture en couches, dépendances orientées vers le domaine :

```text
src/
  domain/          modèles (Recipe, Ingredient, MealPlan…), services purs,
                   interfaces de repositories (ports)
  application/     use cases orchestrant services + repositories
  infrastructure/  implémentations LocalStorage*Repository (clés mealapp.*)
                   + seedIngredients.ts (liste préremplie)
  ui/              composants Vue, pages, router
  shared/          utilitaires transverses (dates, ids, labels)
```

Règles structurantes :

- UI → use cases → interfaces du domaine ; les implémentations concrètes sont
  injectées au composition root ([`src/compositionRoot.ts`](./src/compositionRoot.ts))
  via `provide`/`inject`.
- `localStorage` n'est accédé que dans `src/infrastructure/storage/`.
- Les services du domaine sont purs (pas de stockage, pas de DOM, pas de Vue) et
  testés unitairement.

Pour une V2 avec backend, seuls les repositories changent dans le composition root.
