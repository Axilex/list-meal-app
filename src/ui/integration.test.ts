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
      // Vraies <Transition> (VTU les stubbe par défaut), plus proche du
      // navigateur. Le blocage de mode="out-in" (voir HomePage.vue) ne se
      // reproduit toutefois pas en jsdom : la sortie s'y résout en synchrone.
      stubs: { transition: false },
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

  it('le calendrier reste affiché après un changement de semaine', async () => {
    const useCases = createUseCases()
    // Une recette pour que la grille s'affiche (sinon état vide)
    const saved = await useCases.saveRecipe.execute({
      name: 'Riz à la tomate',
      servings: 2,
      ingredients: [{ name: 'Tomate', quantity: 200, unit: 'g' }],
    })
    if (!saved.ok) throw new Error('création de recette attendue')

    const home = await mountApp('/', useCases)
    expect(home.text()).toContain('+ Ajouter')

    // La grille doit rester rendue après chaque changement de semaine
    // (un mode="out-in" sur la transition l'a déjà fait disparaître en
    // navigateur réel — non reproductible en jsdom, vérifié visuellement).
    await home.find('button[title="Semaine suivante"]').trigger('click')
    await flushPromises()
    expect(home.text()).toContain('+ Ajouter')

    await home.find('button[title="Semaine précédente"]').trigger('click')
    await flushPromises()
    expect(home.text()).toContain('+ Ajouter')
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

    // Le plan change : au retour sur la liste, elle suit automatiquement
    // (nouvel ingrédient présent) et la coche existante est conservée
    const saved2 = await useCases.saveRecipe.execute({
      name: 'Salade verte',
      servings: 2,
      ingredients: [{ name: 'Laitue', quantity: 1, unit: 'piece' }],
    })
    if (!saved2.ok) throw new Error('création de recette attendue')
    await useCases.saveMealSlot.execute({
      id: 's-3',
      date: addDays(monday, 2),
      mealType: 'lunch',
      recipeId: saved2.recipe.id,
      servings: 2,
    })

    const synced = await mountApp('/shopping-list', useCases)
    expect(synced.text()).toContain('Laitue')
    // La Tomate cochée reste dans « Dans le panier »
    expect(synced.text()).toContain('Dans le panier')
    expect(
      synced
        .findAll('input[type="checkbox"]')
        .filter((c) => (c.element as HTMLInputElement).checked),
    ).toHaveLength(1)

    // « Tout décocher » demande confirmation puis remet tout dans « À acheter »
    await synced.findAll('button').find((b) => b.text() === 'Tout décocher')!.trigger('click')
    await flushPromises()
    await synced
      .findAll('button')
      .find((b) => b.text() === 'Oui, tout décocher')!
      .trigger('click')
    await flushPromises()
    expect(
      synced
        .findAll('input[type="checkbox"]')
        .every((c) => !(c.element as HTMLInputElement).checked),
    ).toBe(true)
  })
})
