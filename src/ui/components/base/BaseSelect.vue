<script setup lang="ts" generic="T extends string">
defineProps<{
  label?: string
  options: { value: T; label: string }[]
  placeholder?: string
}>()

const model = defineModel<T | ''>()
</script>

<template>
  <label class="block">
    <span v-if="label" class="field-label">{{ label }}</span>
    <select v-model="model" class="field-control field-select">
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </label>
</template>
