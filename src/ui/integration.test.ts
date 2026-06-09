// @vitest-environment jsdom
// Test d'intégration : UI montée → use cases réels → localStorage (jsdom).
import { beforeEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from '@/App.vue'
import HomePage from '@/ui/pages/HomePage.vue'
import RecipesPage from '@/ui/pages/RecipesPage.vue'
import ShoppingListPage from '@/ui/pages/ShoppingListPage.vue'
import { USE_CASES, type UseCases } from '@/ui/di'
import { createUseCases } from '@/compositionRoot'
import { addDays, mondayOf, todayIso } from '@/shared/date'

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: HomePage },
      { path: '/recipes', name: 'recipes', component: RecipesPage },
      { path: '/shopping-list', name: 'shopping-list', component: ShoppingListPage },
    ],
  })
}

async function mountApp(path: string, useCases: UseCases) {
  const router = makeRouter()
  await router.push(path)
  await router.isReady()
  const wrapper = mount(App, {
    global: {
      plugins: [router],
      provide: { [USE_CASES as symbol]: useCases },
    },
  })
  await flushPromises()
  return wrapper
}

describe('intégration UI ↔ use cases ↔ localStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('affiche les états vides quand rien n’existe', async () => {
    const useCases = createUseCases()

    const recipes = await mountApp('/recipes', useCases)
    expect(recipes.text()).toContain('Aucune recette pour l’instant.')

    const home = await mountApp('/', useCases)
    expect(home.text()).toContain('Créez d’abord une recette')

    const shopping = await mountApp('/shopping-list', useCases)
    expect(shopping.text()).toContain('Aucun repas planifié sur cette semaine.')
  })

  it('propose les ingrédients existants en autocomplétion dans le formulaire', async () => {
    const useCases = createUseCases()

    const recipes = await mountApp('/recipes', useCases)
    await recipes
      .findAll('button')
      .find((b) => b.text() === 'Ajouter une recette')!
      .trigger('click')
    await flushPromises()

    // L'input du nom d'ingrédient est relié à la datalist du seed
    const nameInput = recipes.find('input[placeholder="Tomate"]')
    expect(nameInput.attributes('list')).toBe('ingredient-names')

    const values = recipes
      .findAll('datalist#ingredient-names option')
      .map((o) => o.attributes('value'))
    expect(values).toContain('Tomate')
    expect(values).toContain('Riz basmati')
  })

  it('parcours complet : recette → plan → liste agrégée → coche persistée', async () => {
    const useCases = createUseCases()
    const monday = mondayOf(todayIso())

    // Recette de 2 portions
    const saved = await useCases.saveRecipe.execute({
      name: 'Riz à la tomate',
      servings: 2,
      ingredients: [{ name: 'Tomate', quantity: 200, unit: 'g' }],
    })
    if (!saved.ok) throw new Error('création de recette attendue')

    // Deux repas cette semaine : 4 portions (ratio ×2) et 2 portions (ratio ×1)
    await useCases.saveMealSlot.execute({
      id: 's-1',
      date: monday,
      mealType: 'lunch',
      recipeId: saved.recipe.id,
      servings: 4,
    })
    await useCases.saveMealSlot.execute({
      id: 's-2',
      date: addDays(monday, 1),
      mealType: 'dinner',
      recipeId: saved.recipe.id,
      servings: 2,
    })

    // La grille de la semaine affiche les repas planifiés
    const home = await mountApp('/', useCases)
    expect(home.text()).toContain('Riz à la tomate')

    // La liste agrège 200×2 + 200×1 = 600 g
    const shopping = await mountApp('/shopping-list', useCases)
    expect(shopping.text()).toContain('Tomate')
    expect(shopping.text()).toMatch(/600\s*g/)

    // Cocher un item persiste après « rechargement » (nouveau montage)
    await shopping.find('input[type="checkbox"]').setValue(true)
    await flushPromises()

    const reloaded = await mountApp('/shopping-list', useCases)
    const checkbox = reloaded.find('input[type="checkbox"]')
    expect((checkbox.element as HTMLInputElement).checked).toBe(true)

    // « Regénérer » avec des coches demande confirmation, puis remet à zéro
    await reloaded.findAll('button').find((b) => b.text() === 'Regénérer')!.trigger('click')
    await flushPromises()
    await reloaded
      .findAll('button')
      .find((b) => b.text() === 'Oui, regénérer')!
      .trigger('click')
    await flushPromises()
    expect(
      (reloaded.find('input[type="checkbox"]').element as HTMLInputElement).checked,
    ).toBe(false)
  })
})
