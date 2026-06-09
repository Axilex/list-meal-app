<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import type { ShoppingList, ShoppingListItem } from '@/domain/models'
import {
  addDays,
  formatShortDate,
  isValidIsoDate,
  mondayOf,
  todayIso,
} from '@/shared/date'
import { useUseCases } from '@/ui/di'
import { showToast } from '@/ui/toast'
import BaseButton from '@/ui/components/base/BaseButton.vue'
import BaseCard from '@/ui/components/base/BaseCard.vue'
import ConfirmModal from '@/ui/components/base/ConfirmModal.vue'
import ShoppingListView from '@/ui/components/ShoppingListView.vue'

const { getCurrentShoppingList, generateShoppingList, toggleShoppingItem } =
  useUseCases()
const route = useRoute()

const list = ref<ShoppingList | null>(null)
const loaded = ref(false)
const confirmingRegenerate = ref(false)

const checkedCount = computed(
  () => list.value?.items.filter((item) => item.checked).length ?? 0,
)

const progress = computed(() =>
  list.value && list.value.items.length > 0
    ? checkedCount.value / list.value.items.length
    : 0,
)

const remaining = computed(
  () => (list.value?.items.length ?? 0) - checkedCount.value,
)

const remainingLabel = computed(() =>
  remaining.value > 1
    ? 'articles restants à acheter'
    : 'article restant à acheter',
)

const regenerateMessage = computed(() => {
  const n = checkedCount.value
  const checked =
    n > 1
      ? `vos ${n} articles cochés seront décochés`
      : 'votre article coché sera décoché'
  return `La liste sera recalculée depuis le plan de repas et ${checked}.`
})

const weekLabel = computed(() =>
  list.value
    ? `Semaine du ${formatShortDate(list.value.weekStart)} au ${formatShortDate(addDays(list.value.weekStart, 6))}`
    : '',
)

const generatedAtLabel = computed(() =>
  list.value
    ? new Intl.DateTimeFormat('fr-FR', {
        dateStyle: 'long',
        timeStyle: 'short',
      }).format(new Date(list.value.generatedAt))
    : '',
)

onMounted(async () => {
  const requestedWeek =
    typeof route.query.week === 'string' && isValidIsoDate(route.query.week)
      ? mondayOf(route.query.week)
      : null
  const persisted = await getCurrentShoppingList.execute()

  // Liste persistée réutilisée (coches conservées) sauf si une autre semaine est demandée
  if (persisted && (requestedWeek === null || persisted.weekStart === requestedWeek)) {
    list.value = persisted
  } else {
    list.value = await generateShoppingList.execute(
      requestedWeek ?? mondayOf(todayIso()),
    )
  }
  loaded.value = true
})

// Regénérer décoche tout : on prévient si des articles sont déjà cochés
function requestRegenerate() {
  if (checkedCount.value > 0) confirmingRegenerate.value = true
  else void regenerate()
}

async function regenerate() {
  confirmingRegenerate.value = false
  list.value = await generateShoppingList.execute(
    list.value?.weekStart ?? mondayOf(todayIso()),
  )
  showToast('Liste regénérée depuis le plan', '🔄')
}

async function handleToggle(item: ShoppingListItem, checked: boolean) {
  const updated = await toggleShoppingItem.execute(
    item.ingredientId,
    item.unit,
    checked,
  )
  if (updated) list.value = updated
}

function printList() {
  window.print()
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-center gap-3">
      <div class="mr-auto flex items-center gap-3">
        <span
          class="grid size-12 place-items-center rounded-2xl bg-olive-100 text-[22px] shadow-soft"
          aria-hidden="true"
        >
          🛒
        </span>
        <div>
          <p v-if="list" class="eyebrow">{{ weekLabel }}</p>
          <h1 class="font-display text-[28px] font-extrabold tracking-tight">
            Liste de courses
          </h1>
          <p v-if="list" class="text-[13px] text-ink-soft">
            Générée le {{ generatedAtLabel }}
          </p>
        </div>
      </div>
      <div class="no-print flex gap-2">
        <BaseButton variant="secondary" @click="requestRegenerate">Regénérer</BaseButton>
        <BaseButton
          variant="primary"
          :disabled="!list || list.items.length === 0"
          @click="printList"
        >
          Imprimer
        </BaseButton>
      </div>
    </div>

    <!-- Squelette pendant le chargement (latence Firestore) -->
    <div
      v-if="!loaded"
      class="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_290px]"
    >
      <div class="space-y-3 rounded-[28px] border border-line bg-cream p-5 shadow-soft">
        <div v-for="i in 8" :key="i" class="skeleton h-9"></div>
      </div>
      <div class="skeleton order-first h-44 !rounded-[28px] lg:order-none"></div>
    </div>

    <BaseCard
      v-else-if="!list || list.items.length === 0"
      class="py-14 text-center"
    >
      <div
        class="mx-auto mb-5 grid size-20 place-items-center rounded-full bg-olive-100 text-4xl"
        aria-hidden="true"
      >
        🛒
      </div>
      <p class="eyebrow">Semaine vide</p>
      <p class="mx-auto mt-2 mb-6 max-w-sm text-ink-soft">
        Aucun repas planifié sur cette semaine.
      </p>
      <RouterLink
        to="/"
        class="inline-flex items-center justify-center rounded-full border-2 border-transparent bg-olive-500 px-5 py-2.5 font-display text-sm font-bold text-white shadow-[var(--shadow-button)] transition-all duration-150 ease-pop hover:-translate-y-0.5 hover:bg-olive-600 hover:shadow-[0_7px_0_rgba(208,58,38,0.85)] active:translate-y-1 active:shadow-[0_2px_0_rgba(208,58,38,0.85)]"
      >
        Planifier des repas
      </RouterLink>
    </BaseCard>

    <!-- Desktop : liste à gauche, résumé en aside ; mobile : résumé au-dessus -->
    <div
      v-else
      class="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_290px]"
    >
      <ShoppingListView :list="list" @toggle="handleToggle" />

      <aside
        class="no-print order-first rounded-[28px] border border-line bg-cream p-6 shadow-soft lg:sticky lg:top-24 lg:order-none"
      >
        <p class="eyebrow">Résumé</p>
        <p
          class="mt-3 font-display text-[36px] font-extrabold leading-none tracking-tight"
        >
          {{ remaining }}
        </p>
        <p class="mt-1 text-[13px] text-ink-soft">{{ remainingLabel }}</p>
        <div class="mt-4 h-2.5 overflow-hidden rounded-full bg-paper">
          <div
            class="h-full rounded-full bg-gradient-to-r from-tangerine-400 to-olive-500 transition-all duration-300"
            :style="{ width: `${progress * 100}%` }"
          ></div>
        </div>
        <p class="mt-2 text-[12px] font-medium text-ink-soft tabular-nums">
          {{ checkedCount }}/{{ list.items.length }} dans le panier
        </p>
        <p
          v-if="checkedCount === list.items.length"
          class="mt-3 rounded-2xl bg-olive-50 px-3 py-2 text-[13px] font-bold text-olive-700"
        >
          🎉 Tout est dans le panier !
        </p>
      </aside>
    </div>

    <ConfirmModal
      v-if="confirmingRegenerate"
      title="Regénérer la liste ?"
      :message="regenerateMessage"
      confirm-label="Oui, regénérer"
      emoji="🔄"
      @confirm="regenerate"
      @close="confirmingRegenerate = false"
    />
  </div>
</template>
