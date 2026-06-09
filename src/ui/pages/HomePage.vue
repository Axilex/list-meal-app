<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { MealPlan, MealSlot, MealType, Recipe } from '@/domain/models'
import { addDays, formatShortDate, mondayOf, todayIso, weekDates } from '@/shared/date'
import { countLabel } from '@/shared/labels'
import { useUseCases } from '@/ui/di'
import { showErrorToast } from '@/ui/toast'
import BaseButton from '@/ui/components/base/BaseButton.vue'
import BaseCard from '@/ui/components/base/BaseCard.vue'
import LoadErrorCard from '@/ui/components/base/LoadErrorCard.vue'
import MealPlanCalendar from '@/ui/components/MealPlanCalendar.vue'
import MealSlotModal from '@/ui/components/MealSlotModal.vue'

const {
  getCurrentMealPlan,
  getRecipes,
  getIngredients,
  saveMealSlot,
  removeMealSlot,
} = useUseCases()
const router = useRouter()

const currentMonday = mondayOf(todayIso())
const weekStart = ref(currentMonday)
const plan = ref<MealPlan | null>(null)
const recipes = ref<Recipe[]>([])
const ingredientNameById = ref(new Map<string, string>())
const loaded = ref(false)
const loadFailed = ref(false)
const saving = ref(false)
const editing = ref<{ date: string; mealType: MealType } | null>(null)
// Sens du glissement quand on change de semaine ('next' | 'prev')
const weekDirection = ref<'next' | 'prev'>('next')

const weekLabel = computed(
  () =>
    `du ${formatShortDate(weekStart.value)} au ${formatShortDate(addDays(weekStart.value, 6))}`,
)

// Repas planifiés sur la semaine affichée (sur 14 créneaux possibles)
const plannedCount = computed(() => {
  const dates = new Set(weekDates(weekStart.value))
  return (plan.value?.slots ?? []).filter((s) => dates.has(s.date)).length
})

const editingSlot = computed<MealSlot | null>(() => {
  if (!editing.value || !plan.value) return null
  return (
    plan.value.slots.find(
      (s) =>
        s.date === editing.value!.date &&
        s.mealType === editing.value!.mealType,
    ) ?? null
  )
})

async function load() {
  loaded.value = false
  loadFailed.value = false
  try {
    plan.value = await getCurrentMealPlan.execute()
    recipes.value = await getRecipes.execute()
    const ingredients = await getIngredients.execute()
    ingredientNameById.value = new Map(ingredients.map((i) => [i.id, i.name]))
  } catch {
    loadFailed.value = true
  }
  loaded.value = true
}

onMounted(load)

function shiftWeek(direction: 1 | -1) {
  weekDirection.value = direction === 1 ? 'next' : 'prev'
  weekStart.value = addDays(weekStart.value, direction * 7)
}

function goToCurrentWeek() {
  weekDirection.value = weekStart.value > currentMonday ? 'prev' : 'next'
  weekStart.value = currentMonday
}

async function handleSave(slot: MealSlot) {
  if (saving.value) return
  saving.value = true
  try {
    const result = await saveMealSlot.execute(slot)
    if (result.ok) {
      plan.value = result.plan
      editing.value = null
    }
  } catch {
    showErrorToast('Le repas n’a pas pu être enregistré. Réessayez.')
  } finally {
    saving.value = false
  }
}

async function handleRemove(slotId: string) {
  if (saving.value) return
  saving.value = true
  try {
    const updated = await removeMealSlot.execute(slotId)
    if (updated) plan.value = updated
    editing.value = null
  } catch {
    showErrorToast('Le repas n’a pas pu être retiré. Réessayez.')
  } finally {
    saving.value = false
  }
}

function goToShoppingList() {
  router.push({ name: 'shopping-list', query: { week: weekStart.value } })
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
          📅
        </span>
        <div>
          <h1 class="font-display text-[28px] font-extrabold tracking-tight">
            Plan de repas
          </h1>
          <p class="text-[13px] text-ink-soft">
            Choisissez les recettes de la semaine, la liste de courses suit.
          </p>
        </div>
      </div>
      <BaseButton variant="primary" @click="goToShoppingList">
        Liste de courses →
      </BaseButton>
    </div>

    <!-- Barre de semaine : navigation + retour à aujourd'hui + progression -->
    <div class="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
      <button
        type="button"
        title="Semaine précédente"
        aria-label="Semaine précédente"
        class="icon-btn"
        @click="shiftWeek(-1)"
      >
        ‹
      </button>
      <span class="text-center font-display leading-tight font-bold text-ink">
        <span class="block text-[11px] tracking-[0.1em] text-ink-faint uppercase">Semaine</span>
        <span class="block text-[16px]">{{ weekLabel }}</span>
      </span>
      <button
        type="button"
        title="Semaine suivante"
        aria-label="Semaine suivante"
        class="icon-btn"
        @click="shiftWeek(1)"
      >
        ›
      </button>
      <button
        v-if="weekStart !== currentMonday"
        type="button"
        class="meal-badge cursor-pointer border border-olive-200 bg-olive-50 !text-[11px] text-olive-700 transition-colors hover:bg-olive-100"
        @click="goToCurrentWeek"
      >
        ↩ Aujourd’hui
      </button>
      <span
        v-else-if="plannedCount > 0"
        class="meal-badge border border-line bg-cream !text-[11px] text-ink-soft tabular-nums"
      >
        🍽️ {{ countLabel(plannedCount, 'repas planifié') }}
      </span>
    </div>

    <LoadErrorCard v-if="loadFailed" @retry="load" />

    <BaseCard v-else-if="loaded && recipes.length === 0" class="py-14 text-center">
      <div
        class="mx-auto mb-5 grid size-20 place-items-center rounded-full bg-olive-100 text-4xl"
        aria-hidden="true"
      >
        🍳
      </div>
      <p class="eyebrow">Pour commencer</p>
      <p class="mx-auto mt-2 mb-6 max-w-sm text-ink-soft">
        Créez d’abord une recette pour planifier vos repas.
      </p>
      <RouterLink
        to="/recipes"
        class="inline-flex items-center justify-center rounded-full border-2 border-transparent bg-olive-500 px-5 py-2.5 font-display text-sm font-bold text-white shadow-[var(--shadow-button)] transition-all duration-150 ease-pop hover:-translate-y-0.5 hover:bg-olive-600 hover:shadow-[0_7px_0_rgba(208,58,38,0.85)] active:translate-y-1 active:shadow-[0_2px_0_rgba(208,58,38,0.85)]"
      >
        Ajouter une recette
      </RouterLink>
    </BaseCard>

    <!-- Squelette pendant le chargement (latence Firestore) -->
    <div v-else-if="!loaded" class="rounded-[28px] border border-line bg-cream p-4 shadow-soft">
      <div class="grid gap-3 min-[840px]:grid-cols-7">
        <div v-for="i in 7" :key="i" class="space-y-2">
          <div class="skeleton h-9"></div>
          <div class="skeleton h-24"></div>
          <div class="skeleton hidden h-24 min-[840px]:block"></div>
        </div>
      </div>
    </div>

    <!-- Pas de mode="out-in" : il se bloque (calendrier jamais réinséré) quand le
         parent re-rend pendant la sortie, ce qui arrive à chaque changement de
         semaine (barre de semaine recalculée). La sortie étant instantanée
         (pas de classe leave), l'effet visuel reste un simple glissement d'entrée. -->
    <Transition v-else :name="`week-${weekDirection}`">
      <MealPlanCalendar
        :key="weekStart"
        :week-start="weekStart"
        :plan="plan"
        :recipes="recipes"
        @edit-slot="(date, mealType) => (editing = { date, mealType })"
      />
    </Transition>

    <MealSlotModal
      v-if="editing"
      :date="editing.date"
      :meal-type="editing.mealType"
      :slot="editingSlot"
      :recipes="recipes"
      :ingredient-name-by-id="ingredientNameById"
      :saving="saving"
      @save="handleSave"
      @remove="handleRemove"
      @close="editing = null"
    />
  </div>
</template>
