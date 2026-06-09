import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/ui/pages/HomePage.vue'
import RecipesPage from '@/ui/pages/RecipesPage.vue'
import ShoppingListPage from '@/ui/pages/ShoppingListPage.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage },
    { path: '/recipes', name: 'recipes', component: RecipesPage },
    { path: '/shopping-list', name: 'shopping-list', component: ShoppingListPage },
  ],
})
