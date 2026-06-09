<script setup lang="ts">
import { dismissToast, toasts } from '@/ui/toast'
</script>

<template>
  <!-- bottom-24 sur mobile : laisse la barre d'onglets visible -->
  <div
    class="no-print pointer-events-none fixed inset-x-0 bottom-24 z-40 flex flex-col items-center gap-2 px-4 sm:bottom-6"
    aria-live="polite"
  >
    <TransitionGroup name="toast">
      <button
        v-for="toast in toasts"
        :key="toast.id"
        type="button"
        class="pointer-events-auto flex cursor-pointer items-center gap-2 rounded-full bg-ink px-4 py-2.5 font-display text-sm font-bold text-white shadow-modal"
        @click="dismissToast(toast.id)"
      >
        <span v-if="toast.emoji" aria-hidden="true">{{ toast.emoji }}</span>
        {{ toast.message }}
      </button>
    </TransitionGroup>
  </div>
</template>
