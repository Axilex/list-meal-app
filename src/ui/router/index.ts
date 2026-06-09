import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/ui/pages/HomePage.vue'
import RecipesPage from '@/ui/pages/RecipesPage.vue'
import ShoppingListPage from '@/ui/pages/ShoppingListPage.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
      meta: { title: 'Plan de repas' },
    },
    {
      path: '/recipes',
      name: 'recipes',
      component: RecipesPage,
      meta: { title: 'Recettes' },
    },
    {
      path: '/shopping-list',
      name: 'shopping-list',
      component: ShoppingListPage,
      meta: { title: 'Liste de courses' },
    },
  ],
})

// Titre d'onglet par page
router.afterEach((to) => {
  const title = typeof to.meta.title === 'string' ? to.meta.title : null
  document.title = title ? `${title} · Mes repas` : 'Mes repas'
})
