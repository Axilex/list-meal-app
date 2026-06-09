<script setup lang="ts">
import type { ShoppingList, ShoppingListItem } from '@/domain/models'
import { UNIT_LABELS } from '@/shared/labels'

defineProps<{ list: ShoppingList }>()

const emit = defineEmits<{
  toggle: [item: ShoppingListItem, checked: boolean]
}>()

function onToggle(item: ShoppingListItem, event: Event) {
  emit('toggle', item, (event.target as HTMLInputElement).checked)
}
</script>

<template>
  <div class="overflow-hidden rounded-[28px] border border-line bg-cream shadow-soft">
    <div class="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
      <span class="eyebrow">À acheter</span>
      <span class="text-[12px] font-medium text-ink-soft tabular-nums">
        {{ list.items.length }} article(s)
      </span>
    </div>
    <ul>
      <li
        v-for="(item, index) in list.items"
        :key="`${item.ingredientId}|${item.unit}`"
        class="flex items-center gap-3 px-5 py-3 transition-colors duration-150 hover:bg-paper"
        :class="index > 0 ? 'border-t border-line' : ''"
      >
        <input
          type="checkbox"
          :checked="item.checked"
          class="checkbox print:hidden"
          @change="onToggle(item, $event)"
        />
        <span
          :class="
            item.checked
              ? 'text-ink-faint line-through decoration-ink-faint'
              : 'text-ink'
          "
        >
          {{ item.name }}
          <span v-if="item.notes" class="text-[13px] text-ink-soft">
            ({{ item.notes }})
          </span>
        </span>
        <!-- Pointillés de conduite, façon carte de menu -->
        <span
          aria-hidden="true"
          class="mx-1 mb-[5px] min-w-4 flex-1 self-end border-b border-dotted border-line-strong"
        ></span>
        <span
          class="rounded-full px-2.5 py-0.5 text-[13px] font-semibold whitespace-nowrap tabular-nums"
          :class="item.checked ? 'bg-paper/60 text-ink-faint' : 'bg-paper text-ink'"
        >
          {{ item.totalQuantity }} {{ UNIT_LABELS[item.unit] }}
        </span>
      </li>
    </ul>
  </div>
</template>
