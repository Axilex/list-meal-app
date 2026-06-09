<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import type { AuthUser } from '@/application/auth/AuthGateway'
import { todayIso } from '@/shared/date'
import { useAuthGateway, useUseCases } from '@/ui/di'
import { showErrorToast, showToast } from '@/ui/toast'
import LoginPage from '@/ui/pages/LoginPage.vue'
import ConfirmModal from '@/ui/components/base/ConfirmModal.vue'
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

// Confirmation avant déconnexion : un clic accidentel ne doit pas
// renvoyer à l'écran de connexion sans prévenir.
const confirmingSignOut = ref(false)

async function handleSignOut() {
  confirmingSignOut.value = false
  await auth?.signOut()
}

// Sauvegarde et restauration : un fichier JSON téléchargé, réimportable
// (changement de navigateur, migration localStorage → Firebase…).
const { exportData, importData } = useUseCases()
const importFileInput = ref<HTMLInputElement | null>(null)
const pendingImport = ref<unknown | null>(null)

async function downloadExport() {
  try {
    const data = await exportData.execute()
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `mes-repas-${todayIso()}.json`
    link.click()
    URL.revokeObjectURL(url)
    showToast('Données exportées', '📦')
  } catch {
    showErrorToast('L’export a échoué. Réessayez.')
  }
}

async function onImportFileChosen(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = '' // permet de resélectionner le même fichier plus tard
  if (!file) return
  try {
    pendingImport.value = JSON.parse(await file.text())
  } catch {
    showErrorToast('Ce fichier n’est pas un export valide de l’application.')
  }
}

async function confirmImport() {
  const data = pendingImport.value
  pendingImport.value = null
  try {
    const result = await importData.execute(data)
    if (result.ok) {
      // Recharge pour que toutes les pages relisent les données importées
      window.location.reload()
    } else {
      showErrorToast(result.error)
    }
  } catch {
    showErrorToast('L’import a échoué. Réessayez.')
  }
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
          @click="confirmingSignOut = true"
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
      <div
        class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-line pt-3"
      >
        <p class="text-xs text-ink-faint">
          {{
            auth
              ? 'Vos recettes, plans et listes sont synchronisés via Firebase et partagés entre les appareils connectés.'
              : 'Vos recettes, plans et listes sont conservés localement dans ce navigateur.'
          }}
        </p>
        <p class="flex gap-4">
          <button
            type="button"
            class="cursor-pointer text-xs font-medium text-ink-faint underline-offset-2 hover:text-ink hover:underline"
            @click="downloadExport"
          >
            📦 Exporter les données
          </button>
          <button
            type="button"
            class="cursor-pointer text-xs font-medium text-ink-faint underline-offset-2 hover:text-ink hover:underline"
            @click="importFileInput?.click()"
          >
            📥 Importer
          </button>
        </p>
      </div>
      <input
        ref="importFileInput"
        type="file"
        accept="application/json,.json"
        class="hidden"
        @change="onImportFileChosen"
      />
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

    <ConfirmModal
      v-if="confirmingSignOut"
      title="Se déconnecter ?"
      message="Il faudra saisir à nouveau l'email et le mot de passe pour revenir."
      confirm-label="Se déconnecter"
      emoji="👋"
      @confirm="handleSignOut"
      @close="confirmingSignOut = false"
    />

    <ConfirmModal
      v-if="pendingImport !== null"
      title="Importer ces données ?"
      message="Les recettes et ingrédients du fichier seront ajoutés (ceux portant le même identifiant seront remplacés), puis la page se rechargera."
      confirm-label="Importer"
      emoji="📥"
      @confirm="confirmImport"
      @close="pendingImport = null"
    />

    <ToastHost />
  </div>
</template>
