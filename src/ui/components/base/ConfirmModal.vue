<script setup lang="ts">
import BaseButton from '@/ui/components/base/BaseButton.vue'
import ModalShell from '@/ui/components/base/ModalShell.vue'

// Remplace window.confirm() : confirmation sur la charte de l'app.
defineProps<{
  title: string
  message: string
  confirmLabel: string
  emoji?: string
  danger?: boolean
}>()

const emit = defineEmits<{ confirm: []; close: [] }>()
</script>

<template>
  <ModalShell max-width="max-w-sm" @close="emit('close')">
    <div class="text-center">
      <div
        class="mx-auto grid size-14 place-items-center rounded-full text-2xl"
        :class="danger ? 'bg-brick-50' : 'bg-olive-100'"
        aria-hidden="true"
      >
        {{ emoji ?? '🤔' }}
      </div>
      <h2 class="mt-3 font-display text-[20px] font-extrabold tracking-tight">
        {{ title }}
      </h2>
      <p class="mt-2 text-sm whitespace-pre-line text-ink-soft">{{ message }}</p>
    </div>
    <div class="mt-6 flex justify-center gap-2">
      <BaseButton variant="secondary" @click="emit('close')">Annuler</BaseButton>
      <BaseButton :variant="danger ? 'danger' : 'primary'" @click="emit('confirm')">
        {{ confirmLabel }}
      </BaseButton>
    </div>
  </ModalShell>
</template>
