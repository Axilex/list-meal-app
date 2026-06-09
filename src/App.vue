<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import type { AuthUser } from '@/application/auth/AuthGateway'
import { useAuthGateway } from '@/ui/di'
import LoginPage from '@/ui/pages/LoginPage.vue'

const auth = useAuthGateway()

const user = ref<AuthUser | null>(null)
// Sans passerelle d'auth (mode localStorage), l'app s'affiche directement ;
// sinon on attend la restauration de session Firebase avant de trancher.
const ready = ref(auth === null)

let unsubscribe: (() => void) | undefined
onMounted(() => {
  if (auth) {
    unsubscribe = auth.onAuthStateChanged((current) => {
      user.value = current
      ready.value = true
    })
  }
})
onUnmounted(() => unsubscribe?.())

const signedIn = computed(() => auth === null || user.value !== null)

async function handleSignOut() {
  await auth?.signOut()
}
</script>

<template>
  <div v-if="!ready" class="flex min-h-screen items-center justify-center">
    <span class="animate-pulse text-4xl" aria-hidden="true">🥗</span>
  </div>

  <LoginPage v-else-if="!signedIn" />

  <div v-else class="flex min-h-screen flex-col">
    <header class="no-print sticky top-0 z-10 border-b border-line bg-cream/95 backdrop-blur-md">
      <nav
        class="mx-auto flex w-full max-w-[1060px] flex-wrap items-center gap-x-1 gap-y-1 px-5 py-3.5"
      >
        <RouterLink
          to="/"
          class="mr-auto flex items-center gap-2 font-display text-[18px] font-extrabold tracking-tight text-ink"
        >
          <span class="text-lg" aria-hidden="true">🥗</span>
          Mes repas
        </RouterLink>
        <RouterLink to="/" class="nav-link">Plan de repas</RouterLink>
        <RouterLink to="/recipes" class="nav-link">Recettes</RouterLink>
        <RouterLink to="/shopping-list" class="nav-link">Liste de courses</RouterLink>
        <button
          v-if="auth"
          type="button"
          class="nav-link cursor-pointer"
          @click="handleSignOut"
        >
          Déconnexion
        </button>
      </nav>
    </header>

    <main class="mx-auto w-full max-w-[1060px] flex-1 px-5 py-10">
      <RouterView />
    </main>

    <footer class="no-print mx-auto w-full max-w-[1060px] px-5 pb-8">
      <p class="border-t border-line pt-3 text-xs text-ink-faint">
        {{
          auth
            ? 'Vos recettes, plans et listes sont synchronisés via Firebase et partagés entre les appareils connectés.'
            : 'Vos recettes, plans et listes sont conservés localement dans ce navigateur.'
        }}
      </p>
    </footer>
  </div>
</template>
