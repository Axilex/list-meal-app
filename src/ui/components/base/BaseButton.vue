<script setup lang="ts">
type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

const props = defineProps<{
  variant?: Variant
  type?: 'button' | 'submit'
  disabled?: boolean
}>()

const variantClasses: Record<Variant, string> = {
  // CTA corail 3D : ombre dure sous le bouton, qui s'écrase à l'appui
  primary:
    'border-2 border-transparent bg-olive-500 text-white shadow-[var(--shadow-button)] hover:-translate-y-0.5 hover:bg-olive-600 hover:shadow-[0_7px_0_rgba(208,58,38,0.85)] active:translate-y-1 active:shadow-[0_2px_0_rgba(208,58,38,0.85)]',
  secondary:
    'border-2 border-line-strong bg-cream text-ink shadow-soft hover:-translate-y-0.5 hover:border-olive-300 hover:bg-olive-50 active:scale-95',
  danger:
    'border-2 border-brick-200 bg-cream text-brick-600 hover:border-brick-600 hover:bg-brick-50 active:scale-95',
  ghost:
    'border-2 border-transparent text-ink-soft hover:bg-olive-50 hover:text-olive-700 active:scale-95',
}
</script>

<template>
  <button
    :type="props.type ?? 'button'"
    :disabled="disabled"
    class="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full px-5 py-2.5 font-display text-sm font-bold transition-all duration-150 ease-pop focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-olive-500 disabled:cursor-not-allowed disabled:opacity-45"
    :class="variantClasses[variant ?? 'secondary']"
  >
    <slot />
  </button>
</template>
