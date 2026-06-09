<script setup lang="ts">
defineProps<{
  label?: string
  type?: string
  placeholder?: string
  min?: number
  step?: number | 'any'
  /** Id d'un <datalist> pour l'autocomplétion native. */
  list?: string
}>()

// Avec type="number", v-model natif applique automatiquement la conversion en nombre.
const model = defineModel<string | number>()
</script>

<template>
  <label class="block">
    <span v-if="label" class="field-label">{{ label }}</span>
    <input
      v-model="model"
      :type="type ?? 'text'"
      :placeholder="placeholder"
      :min="min"
      :step="step"
      :list="list"
      class="field-control"
    />
  </label>
</template>
