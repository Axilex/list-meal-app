<script setup lang="ts">
const props = defineProps<{
  label?: string
  min?: number
  /** Libellé d'unité affiché sous la valeur (ex. « portions »). */
  unit?: string
}>()

const model = defineModel<number>({ required: true })

function adjust(delta: number) {
  const next = (Number.isFinite(model.value) ? model.value : 0) + delta
  model.value = Math.max(props.min ?? 1, next)
}
</script>

<template>
  <div>
    <span v-if="label" class="field-label">{{ label }}</span>
    <div class="flex items-center gap-3">
      <button
        type="button"
        class="icon-btn text-lg font-bold disabled:pointer-events-none disabled:opacity-40"
        :disabled="model <= (min ?? 1)"
        aria-label="Diminuer"
        @click="adjust(-1)"
      >
        −
      </button>
      <span class="min-w-14 text-center">
        <span class="block font-display text-[26px] leading-none font-extrabold tabular-nums">
          {{ model }}
        </span>
        <span v-if="unit" class="block text-[11px] font-semibold text-ink-faint">
          {{ unit }}
        </span>
      </span>
      <button
        type="button"
        class="icon-btn text-lg font-bold"
        aria-label="Augmenter"
        @click="adjust(1)"
      >
        +
      </button>
    </div>
  </div>
</template>
