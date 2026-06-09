<script setup lang="ts">
import type { Recipe } from '@/domain/models'
import { countLabel } from '@/shared/labels'
import BaseButton from '@/ui/components/base/BaseButton.vue'
import { recipeVisual } from '@/ui/recipeVisual'

defineProps<{ recipes: Recipe[] }>()

const emit = defineEmits<{
  preview: [recipe: Recipe]
  edit: [recipe: Recipe]
  delete: [recipe: Recipe]
}>()

/** Durée totale des étapes (0 si aucune durée renseignée). */
function totalMinutes(recipe: Recipe): number {
  return (recipe.steps ?? []).reduce((sum, step) => sum + (step.durationMin ?? 0), 0)
}
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <article
      v-for="recipe in recipes"
      :key="recipe.id"
      class="group flex flex-col overflow-hidden rounded-[28px] border border-line bg-cream shadow-soft transition-all duration-150 ease-pop hover:-translate-y-1 hover:shadow-lift"
    >
      <button
        type="button"
        title="Voir la recette"
        class="cursor-pointer text-left"
        @click="emit('preview', recipe)"
      >
        <!-- Bandeau couleur bonbon de la recette, emoji en vedette -->
        <div
          class="grid h-24 place-items-center"
          :style="{ backgroundColor: recipeVisual(recipe.name).soft }"
        >
          <span
            class="text-5xl drop-shadow-sm transition-transform duration-200 ease-pop group-hover:-rotate-6 group-hover:scale-110"
            aria-hidden="true"
          >
            {{ recipeVisual(recipe.name).emoji }}
          </span>
        </div>
        <div class="px-5 pt-4">
          <h3
            class="font-display text-[17px] leading-tight font-extrabold"
            :style="{ color: recipeVisual(recipe.name).text }"
          >
            {{ recipe.name }}
          </h3>
          <div class="mt-2.5 flex flex-wrap gap-1.5">
            <span
              class="inline-flex items-center gap-1 rounded-full bg-paper px-2 py-0.5 text-[12px] font-semibold text-ink-soft tabular-nums"
            >
              👥 {{ recipe.servings }} pers.
            </span>
            <span
              class="inline-flex items-center gap-1 rounded-full bg-paper px-2 py-0.5 text-[12px] font-semibold text-ink-soft tabular-nums"
            >
              🧺 {{ countLabel(recipe.ingredients.length, 'ingrédient') }}
            </span>
            <span
              v-if="totalMinutes(recipe) > 0"
              class="inline-flex items-center gap-1 rounded-full bg-paper px-2 py-0.5 text-[12px] font-semibold text-ink-soft tabular-nums"
            >
              ⏱ {{ totalMinutes(recipe) }} min
            </span>
          </div>
        </div>
      </button>
      <div class="mt-auto flex items-center justify-end gap-1.5 px-4 pt-3 pb-4">
        <BaseButton size="sm" variant="secondary" @click="emit('edit', recipe)">
          Modifier
        </BaseButton>
        <BaseButton
          size="sm"
          variant="danger"
          :title="`Supprimer ${recipe.name}`"
          @click="emit('delete', recipe)"
        >
          Supprimer
        </BaseButton>
      </div>
    </article>
  </div>
</template>
