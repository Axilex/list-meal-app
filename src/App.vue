<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import type { AuthUser } from '@/application/auth/AuthGateway'
import { useAuthGateway } from '@/ui/di'
import LoginPage from '@/ui/pages/LoginPage.vue'
import ToastHost from '@/ui/components/base/ToastHost.vue'

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

// Liens partagés entre la nav desktop et la barre d'onglets mobile
const NAV_ITEMS = [
  { to: '/', emoji: '📅', label: 'Plan de repas', short: 'Plan' },
  { to: '/recipes', emoji: '📖', label: 'Recettes', short: 'Recettes' },
  { to: '/shopping-list', emoji: '🛒', label: 'Liste de courses', short: 'Courses' },
]

async function handleSignOut() {
  await auth?.signOut()
}
</script>

<template>
  <div v-if="!ready" class="flex min-h-screen items-center justify-center">
    <span class="animate-bounce text-5xl" aria-hidden="true">🥗</span>
  </div>

  <LoginPage v-else-if="!signedIn" />

  <div v-else class="flex min-h-screen flex-col">
    <header class="no-print sticky top-0 z-10 border-b border-line bg-cream/95 backdrop-blur-md">
      <nav
        class="mx-auto flex w-full max-w-[1060px] items-center gap-1 px-5 py-3"
        aria-label="Navigation principale"
      >
        <RouterLink
          to="/"
          class="mr-auto flex items-center gap-2 font-display text-[18px] font-extrabold tracking-tight text-ink"
        >
          <span
            class="grid size-9 place-items-center rounded-xl bg-olive-100 text-lg shadow-soft"
            aria-hidden="true"
          >
            🥗
          </span>
          Mes repas
        </RouterLink>
        <RouterLink
          v-for="item in NAV_ITEMS"
          :key="item.to"
          :to="item.to"
          class="nav-link hidden sm:inline-flex sm:items-center sm:gap-1.5"
        >
          <span aria-hidden="true">{{ item.emoji }}</span>
          {{ item.label }}
        </RouterLink>
        <button
          v-if="auth"
          type="button"
          title="Déconnexion"
          aria-label="Déconnexion"
          class="icon-btn ml-1 size-9 text-sm"
          @click="handleSignOut"
        >
          ⏻
        </button>
      </nav>
    </header>

    <main class="mx-auto w-full max-w-[1060px] flex-1 px-5 py-8 pb-28 sm:pb-10">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <footer class="no-print mx-auto w-full max-w-[1060px] px-5 pb-24 sm:pb-8">
      <p class="border-t border-line pt-3 text-xs text-ink-faint">
        {{
          auth
            ? 'Vos recettes, plans et listes sont synchronisés via Firebase et partagés entre les appareils connectés.'
            : 'Vos recettes, plans et listes sont conservés localement dans ce navigateur.'
        }}
      </p>
    </footer>

    <!-- Barre d'onglets mobile : gros points de contact, pouce-friendly -->
    <nav
      class="no-print fixed inset-x-0 bottom-0 z-20 border-t border-line bg-cream/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:hidden"
      aria-label="Navigation mobile"
    >
      <div class="mx-auto grid max-w-md grid-cols-3 gap-1 px-3 py-2">
        <RouterLink
          v-for="item in NAV_ITEMS"
          :key="item.to"
          :to="item.to"
          class="tab-link"
        >
          <span class="text-xl leading-none" aria-hidden="true">{{ item.emoji }}</span>
          {{ item.short }}
        </RouterLink>
      </div>
    </nav>

    <ToastHost />
  </div>
</template>
