<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/ui/components/base/BaseButton.vue'
import BaseInput from '@/ui/components/base/BaseInput.vue'
import { useAuthGateway } from '@/ui/di'

const auth = useAuthGateway()

const email = ref('')
const password = ref('')
const error = ref('')
const pending = ref(false)

async function handleSubmit() {
  if (!auth || pending.value) return
  if (!email.value.trim() || !password.value) {
    error.value = 'Renseignez l’email et le mot de passe.'
    return
  }
  error.value = ''
  pending.value = true
  const result = await auth.signIn(email.value.trim(), password.value)
  pending.value = false
  if (!result.ok) {
    error.value = result.error
  }
  // En cas de succès, App.vue bascule via onAuthStateChanged.
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center px-5 py-10">
    <div class="w-full max-w-sm">
      <!-- Trio d'assiettes en frise au-dessus de la carte -->
      <div
        class="mb-5 flex items-end justify-center gap-3 text-4xl"
        aria-hidden="true"
      >
        <span class="-rotate-12 rounded-2xl bg-noon-50 p-2.5 shadow-soft">🍳</span>
        <span class="-translate-y-2 rounded-2xl bg-olive-100 p-3 text-5xl shadow-soft">🥗</span>
        <span class="rotate-12 rounded-2xl bg-night-50 p-2.5 shadow-soft">🍝</span>
      </div>

      <div class="rounded-[28px] border border-line bg-cream p-6 shadow-soft sm:p-8">
        <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
          <div class="text-center">
            <h1 class="font-display text-2xl font-extrabold tracking-tight text-ink">
              Mes repas
            </h1>
            <p class="mt-1 text-sm text-ink-soft">
              Connectez-vous avec le compte commun pour retrouver les recettes et
              les menus partagés.
            </p>
          </div>
          <BaseInput
            v-model="email"
            label="Email"
            type="email"
            placeholder="famille@exemple.fr"
          />
          <BaseInput
            v-model="password"
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
          />
          <p
            v-if="error"
            class="rounded-2xl border-2 border-brick-200 bg-brick-50 px-3.5 py-2.5 text-sm font-semibold text-brick-700"
          >
            {{ error }}
          </p>
          <BaseButton type="submit" variant="primary" :disabled="pending">
            <span
              v-if="pending"
              class="inline-block size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              aria-hidden="true"
            ></span>
            {{ pending ? 'Connexion…' : 'Se connecter 🔓' }}
          </BaseButton>
        </form>
      </div>

      <p class="mt-4 text-center text-xs text-ink-faint">
        Recettes → plan de la semaine → liste de courses, le tout synchronisé.
      </p>
    </div>
  </main>
</template>
