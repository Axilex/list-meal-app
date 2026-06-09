<script setup lang="ts">
import { computed } from 'vue'
import type { Recipe } from '@/domain/models'
import { stepActionEmoji, UNIT_LABELS } from '@/shared/labels'
import { recipeVisual } from '@/ui/recipeVisual'

const props = defineProps<{
  recipe: Recipe
  /** Noms des ingrédients par id (la recette ne stocke que des références). */
  ingredientNameById: Map<string, string>
  /** Portions affichées ; les quantités sont mises à l'échelle (défaut : portions de base). */
  servings?: number
}>()

const visual = computed(() => recipeVisual(props.recipe.name))
const shownServings = computed(() => props.servings ?? props.recipe.servings)

function scaled(quantity: number): number {
  return Math.round((quantity * shownServings.value * 100) / props.recipe.servings) / 100
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <div
        class="grid size-12 shrink-0 place-items-center rounded-2xl text-2xl"
        :style="{ backgroundColor: visual.soft }"
        aria-hidden="true"
      >
        {{ visual.emoji }}
      </div>
      <div class="min-w-0">
        <div
          class="truncate font-display text-[18px] font-extrabold"
          :style="{ color: visual.text }"
        >
          {{ recipe.name }}
        </div>
        <div class="text-[13px] text-ink-soft tabular-nums">
          {{ shownServings }} portion(s)
        </div>
      </div>
    </div>

    <div>
      <p class="eyebrow mb-1.5">Ingrédients</p>
      <ul class="space-y-1">
        <li
          v-for="ri in recipe.ingredients"
          :key="ri.ingredientId"
          class="flex items-baseline gap-2 text-sm"
        >
          <span class="text-ink">
            {{ ingredientNameById.get(ri.ingredientId) ?? 'Ingrédient supprimé' }}
            <span v-if="ri.note" class="text-[12px] text-ink-soft">({{ ri.note }})</span>
          </span>
          <span
            aria-hidden="true"
            class="mx-1 mb-[3px] min-w-4 flex-1 self-end border-b border-dotted border-line-strong"
          ></span>
          <span
            class="rounded-full bg-paper px-2 py-0.5 text-[12px] font-semibold whitespace-nowrap tabular-nums"
          >
            {{ scaled(ri.quantity) }} {{ UNIT_LABELS[ri.unit] }}
          </span>
        </li>
      </ul>
    </div>

    <div v-if="recipe.steps?.length">
      <p class="eyebrow mb-1.5">Étapes</p>
      <ol class="space-y-2">
        <li
          v-for="(step, index) in recipe.steps"
          :key="index"
          class="rounded-2xl border border-line bg-paper/60 p-3.5 text-sm"
        >
          <div class="flex items-center gap-2">
            <span
              class="grid size-5 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white tabular-nums"
              :style="{ backgroundColor: visual.accent }"
            >
              {{ index + 1 }}
            </span>
            <span class="min-w-0 truncate font-bold text-ink">
              <span v-if="stepActionEmoji(step.action)" aria-hidden="true"
                >{{ stepActionEmoji(step.action) }}
              </span>
              {{ step.action }}
            </span>
            <span
              v-if="step.durationMin"
              class="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full border border-line bg-cream px-2 py-0.5 text-[12px] font-semibold text-ink-soft tabular-nums"
            >
              <span aria-hidden="true">⏱</span>
              {{ step.durationMin }} min
            </span>
          </div>
          <p v-if="step.detail" class="mt-1 pl-7 text-ink-soft">{{ step.detail }}</p>
        </li>
      </ol>
    </div>
    <!-- Texte libre hérité des recettes d'avant les étapes -->
    <p v-else-if="recipe.instructions" class="text-sm whitespace-pre-line text-ink-soft">
      {{ recipe.instructions }}
    </p>
  </div>
</template>
