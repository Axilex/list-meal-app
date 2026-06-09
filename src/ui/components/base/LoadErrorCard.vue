<script setup lang="ts">
import BaseButton from '@/ui/components/base/BaseButton.vue'
import BaseCard from '@/ui/components/base/BaseCard.vue'

const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <BaseCard class="py-14 text-center">
    <div
      class="mx-auto mb-5 grid size-20 place-items-center rounded-full bg-brick-50 text-4xl"
      aria-hidden="true"
    >
      ⚠️
    </div>
    <p class="eyebrow">Chargement impossible</p>
    <p class="mx-auto mt-2 mb-6 max-w-sm text-ink-soft">
      Vos données n’ont pas pu être chargées. Vérifiez votre connexion, puis
      réessayez.
    </p>
    <BaseButton variant="primary" @click="emit('retry')">Réessayer</BaseButton>
  </BaseCard>
</template>
