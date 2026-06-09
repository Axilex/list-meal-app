<script setup lang="ts">
import { computed } from 'vue'
import type { MealPlan, MealSlot, MealType, Recipe } from '@/domain/models'
import { formatShortDate, formatWeekday, todayIso, weekDates } from '@/shared/date'
import MealBadge from '@/ui/components/MealBadge.vue'
import { recipeVisual } from '@/ui/recipeVisual'

const props = defineProps<{
  weekStart: string
  plan: MealPlan | null
  recipes: Recipe[]
}>()

const emit = defineEmits<{
  editSlot: [date: string, mealType: MealType]
}>()

const MEAL_TYPES: MealType[] = ['lunch', 'dinner']
const today = todayIso()

const slotByCell = computed(() => {
  const map = new Map<string, MealSlot>()
  for (const slot of props.plan?.slots ?? []) {
    map.set(`${slot.date}|${slot.mealType}`, slot)
  }
  return map
})

const days = computed(() =>
  weekDates(props.weekStart).map((date) => ({
    date,
    cells: MEAL_TYPES.map((mealType) => ({
      mealType,
      slot: slotByCell.value.get(`${date}|${mealType}`) ?? null,
    })),
  })),
)

function recipeName(recipeId: string): string {
  return props.recipes.find((r) => r.id === recipeId)?.name ?? 'Recette supprimée'
}

function visualFor(recipeId: string) {
  return recipeVisual(recipeName(recipeId))
}
</script>

<template>
  <!-- Semaine : jours empilés verticalement sur petit écran, 7 colonnes (lundi → dimanche) dès 840px -->
  <div class="rounded-[28px] border border-line bg-cream py-2 shadow-soft">
    <div class="min-[840px]:grid min-[840px]:grid-cols-7">
      <div
        v-for="(day, index) in days"
        :key="day.date"
        class="flex flex-col gap-2 p-2.5"
        :class="[
          index > 0
            ? 'border-t border-line min-[840px]:border-t-0 min-[840px]:border-l'
            : '',
          day.date === today
            ? 'bg-gradient-to-b from-olive-50 via-olive-50/40 to-transparent'
            : '',
        ]"
      >
        <div
          class="flex flex-wrap items-baseline gap-x-2 px-1 pt-1 min-[840px]:block min-[840px]:text-center"
        >
          <div class="eyebrow" :class="day.date === today ? 'text-olive-600' : ''">
            {{ formatWeekday(day.date) }}
          </div>
          <div
            class="text-[15px] font-semibold leading-snug"
            :class="day.date === today ? 'text-olive-800' : 'text-ink'"
          >
            {{ formatShortDate(day.date) }}
          </div>
          <div
            v-if="day.date === today"
            class="meal-badge bg-olive-500 text-white min-[840px]:mt-1"
          >
            aujourd’hui
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2 min-[840px]:flex min-[840px]:flex-col">
          <button
            v-for="cell in day.cells"
            :key="cell.mealType"
            type="button"
            class="flex min-h-[104px] cursor-pointer flex-col items-start gap-1.5 rounded-2xl border-2 px-2.5 py-2.5 text-left transition-all duration-150 ease-pop"
            :class="
              cell.slot
                ? 'shadow-soft hover:-translate-y-1 hover:-rotate-1 hover:shadow-lift'
                : 'border-dashed border-line-strong hover:border-olive-300 hover:bg-olive-50'
            "
            :style="
              cell.slot
                ? {
                    backgroundColor: visualFor(cell.slot.recipeId).soft,
                    borderColor: visualFor(cell.slot.recipeId).border,
                  }
                : undefined
            "
            @click="emit('editSlot', day.date, cell.mealType)"
          >
            <MealBadge :meal-type="cell.mealType" :muted="!cell.slot" />
            <template v-if="cell.slot">
              <span
                class="flex min-w-0 items-start gap-1 text-[13px] font-bold leading-tight"
                :style="{ color: visualFor(cell.slot.recipeId).text }"
              >
                <span aria-hidden="true">{{ visualFor(cell.slot.recipeId).emoji }}</span>
                <span class="line-clamp-2">{{ recipeName(cell.slot.recipeId) }}</span>
              </span>
              <span
                class="mt-auto rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-semibold text-ink-soft tabular-nums"
              >
                {{ cell.slot.servings }} portion(s)
              </span>
            </template>
            <span v-else class="text-[13px] text-ink-faint">+ Ajouter</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
