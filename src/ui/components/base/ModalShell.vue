<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

// Coquille commune des modales : fond flouté, panneau à ressort,
// fermeture par clic à l'extérieur ou touche Échap.
defineProps<{
  /** Classe de largeur max du panneau (défaut : max-w-md). */
  maxWidth?: string
}>()

const emit = defineEmits<{ close: [] }>()

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div
    class="modal-backdrop fixed inset-0 z-30 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
    @click.self="emit('close')"
  >
    <div
      role="dialog"
      aria-modal="true"
      class="modal-panel max-h-[85vh] w-full overflow-y-auto rounded-[28px] border border-line bg-cream p-6 shadow-modal"
      :class="maxWidth ?? 'max-w-md'"
    >
      <slot />
    </div>
  </div>
</template>
