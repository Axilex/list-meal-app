<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { MealPlan, MealSlot, MealType, Recipe } from '@/domain/models'
import { addDays, formatShortDate, mondayOf, todayIso } from '@/shared/date'
import { useUseCases } from '@/ui/di'
import BaseButton from '@/ui/components/base/BaseButton.vue'
import BaseCard from '@/ui/components/base/BaseCard.vue'
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

const weekStart = ref(mondayOf(todayIso()))
const plan = ref<MealPlan | null>(null)
const recipes = ref<Recipe[]>([])
const ingredientNameById = ref(new Map<string, string>())
const loaded = ref(false)
const editing = ref<{ date: string; mealType: MealType } | null>(null)

const weekLabel = computed(
  () =>
    `Semaine du ${formatShortDate(weekStart.value)} au ${formatShortDate(addDays(weekStart.value, 6))}`,
)

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

onMounted(async () => {
  plan.value = await getCurrentMealPlan.execute()
  recipes.value = await getRecipes.execute()
  const ingredients = await getIngredients.execute()
  ingredientNameById.value = new Map(ingredients.map((i) => [i.id, i.name]))
  loaded.value = true
})

async function handleSave(slot: MealSlot) {
  const result = await saveMealSlot.execute(slot)
  if (result.ok) {
    plan.value = result.plan
    editing.value = null
  }
}

async function handleRemove(slotId: string) {
  const updated = await removeMealSlot.execute(slotId)
  if (updated) plan.value = updated
  editing.value = null
}

function goToShoppingList() {
  router.push({ name: 'shopping-list', query: { week: weekStart.value } })
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-wrap items-center gap-3">
      <h1
        class="mr-auto flex items-center gap-3 font-display text-[28px] font-extrabold tracking-tight"
      >
        <span
          class="grid size-12 place-items-center rounded-2xl bg-olive-100 text-[22px] shadow-soft"
          aria-hidden="true"
        >
          📅
        </span>
        Plan de repas
      </h1>
      <BaseButton variant="primary" @click="goToShoppingList">
        Liste de courses →
      </BaseButton>
    </div>

    <div class="flex items-center justify-center gap-4">
      <button
        type="button"
        title="Semaine précédente"
        aria-label="Semaine précédente"
        class="grid size-10 cursor-pointer place-items-center rounded-full border border-line bg-cream text-ink-soft shadow-soft transition-all duration-150 ease-pop hover:-translate-y-0.5 hover:border-olive-300 hover:bg-olive-50 hover:text-olive-700"
        @click="weekStart = addDays(weekStart, -7)"
      >
        ‹
      </button>
      <span class="min-w-56 text-center font-display text-[16px] font-bold text-ink">
        {{ weekLabel }}
      </span>
      <button
        type="button"
        title="Semaine suivante"
        aria-label="Semaine suivante"
        class="grid size-10 cursor-pointer place-items-center rounded-full border border-line bg-cream text-ink-soft shadow-soft transition-all duration-150 ease-pop hover:-translate-y-0.5 hover:border-olive-300 hover:bg-olive-50 hover:text-olive-700"
        @click="weekStart = addDays(weekStart, 7)"
      >
        ›
      </button>
    </div>

    <BaseCard v-if="loaded && recipes.length === 0" class="py-14 text-center">
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

    <MealPlanCalendar
      v-else
      :week-start="weekStart"
      :plan="plan"
      :recipes="recipes"
      @edit-slot="(date, mealType) => (editing = { date, mealType })"
    />

    <MealSlotModal
      v-if="editing"
      :date="editing.date"
      :meal-type="editing.mealType"
      :slot="editingSlot"
      :recipes="recipes"
      :ingredient-name-by-id="ingredientNameById"
      @save="handleSave"
      @remove="handleRemove"
      @close="editing = null"
    />
  </div>
</template>
