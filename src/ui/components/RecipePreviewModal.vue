<script setup lang="ts">
import type { Recipe } from '@/domain/models'
import BaseButton from '@/ui/components/base/BaseButton.vue'
import RecipePreview from '@/ui/components/RecipePreview.vue'

defineProps<{
  recipe: Recipe
  ingredientNameById: Map<string, string>
}>()

const emit = defineEmits<{
  edit: [recipe: Recipe]
  close: []
}>()
</script>

<template>
  <div
    class="modal-backdrop fixed inset-0 z-30 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
    @click.self="emit('close')"
  >
    <div
      class="modal-panel max-h-[85vh] w-full max-w-md overflow-y-auto rounded-[28px] border border-line bg-cream p-6 shadow-modal"
    >
      <RecipePreview :recipe="recipe" :ingredient-name-by-id="ingredientNameById" />
      <div class="mt-6 flex justify-end gap-2">
        <BaseButton variant="secondary" @click="emit('close')">Fermer</BaseButton>
        <BaseButton variant="primary" @click="emit('edit', recipe)">Modifier</BaseButton>
      </div>
    </div>
  </div>
</template>
