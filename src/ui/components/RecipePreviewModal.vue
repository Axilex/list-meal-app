<script setup lang="ts">
import type { Recipe } from '@/domain/models'
import BaseButton from '@/ui/components/base/BaseButton.vue'
import ModalShell from '@/ui/components/base/ModalShell.vue'
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
  <ModalShell @close="emit('close')">
    <RecipePreview :recipe="recipe" :ingredient-name-by-id="ingredientNameById" />
    <div class="mt-6 flex justify-end gap-2">
      <BaseButton variant="secondary" @click="emit('close')">Fermer</BaseButton>
      <BaseButton variant="primary" @click="emit('edit', recipe)">Modifier</BaseButton>
    </div>
  </ModalShell>
</template>
