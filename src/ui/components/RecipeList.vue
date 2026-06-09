<script setup lang="ts">
import type { Recipe } from '@/domain/models'
import BaseButton from '@/ui/components/base/BaseButton.vue'
import { recipeVisual } from '@/ui/recipeVisual'

defineProps<{ recipes: Recipe[] }>()

const emit = defineEmits<{
  preview: [recipe: Recipe]
  edit: [recipe: Recipe]
  delete: [recipe: Recipe]
}>()
</script>

<template>
  <div class="overflow-hidden rounded-[28px] border border-line bg-cream shadow-soft">
    <div
      v-for="(recipe, index) in recipes"
      :key="recipe.id"
      class="flex flex-wrap items-center gap-x-4 gap-y-2 p-4 transition-colors duration-150 hover:bg-olive-50"
      :class="index > 0 ? 'border-t border-line' : ''"
    >
      <button
        type="button"
        title="Voir la recette"
        class="mr-auto flex min-w-0 cursor-pointer items-center gap-4 text-left"
        @click="emit('preview', recipe)"
      >
        <span
          class="grid size-11 shrink-0 place-items-center rounded-2xl text-xl"
          :style="{ backgroundColor: recipeVisual(recipe.name).soft }"
          aria-hidden="true"
        >
          {{ recipeVisual(recipe.name).emoji }}
        </span>
        <span class="min-w-0">
          <span
            class="block truncate text-[16px] font-extrabold"
            :style="{ color: recipeVisual(recipe.name).text }"
          >
            {{ recipe.name }}
          </span>
          <span class="block pt-0.5 text-[13px] text-ink-soft tabular-nums">
            {{ recipe.servings }} portion(s) · {{ recipe.ingredients.length }} ingrédient(s)
          </span>
        </span>
      </button>
      <BaseButton variant="secondary" @click="emit('edit', recipe)">Modifier</BaseButton>
      <BaseButton variant="danger" @click="emit('delete', recipe)">Supprimer</BaseButton>
    </div>
  </div>
</template>
