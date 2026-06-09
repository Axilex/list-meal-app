<script setup lang="ts">
import type { MealType } from '@/domain/models'
import { MEAL_TYPE_LABELS } from '@/shared/labels'

// muted : variante grisée pour les créneaux vides
const props = defineProps<{ mealType: MealType; muted?: boolean }>()

const colorClasses = () => {
  if (props.muted) return 'bg-paper text-ink-faint'
  return props.mealType === 'lunch'
    ? 'bg-noon-50 text-noon-700'
    : 'bg-night-50 text-night-700'
}
</script>

<template>
  <span class="meal-badge" :class="colorClasses()">
    <span class="text-xs" :class="muted ? 'opacity-60 grayscale' : ''" aria-hidden="true">
      {{ mealType === 'lunch' ? '🌞' : '🌙' }}
    </span>
    {{ MEAL_TYPE_LABELS[mealType] }}
  </span>
</template>
