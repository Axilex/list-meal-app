<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/ui/components/base/BaseButton.vue'
import BaseCard from '@/ui/components/base/BaseCard.vue'
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
    <BaseCard class="w-full max-w-sm">
      <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
        <div class="text-center">
          <span class="text-4xl" aria-hidden="true">🥗</span>
          <h1 class="mt-2 font-display text-2xl font-extrabold tracking-tight text-ink">
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
        <p v-if="error" class="text-sm font-semibold text-brick-600">
          {{ error }}
        </p>
        <BaseButton type="submit" variant="primary" :disabled="pending">
          {{ pending ? 'Connexion…' : 'Se connecter 🔓' }}
        </BaseButton>
      </form>
    </BaseCard>
  </main>
</template>
