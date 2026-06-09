<script setup lang="ts">
import { computed } from 'vue'
import type { ShoppingList, ShoppingListItem } from '@/domain/models'
import { countLabel, UNIT_LABELS } from '@/shared/labels'
import { groupByAisle } from '@/ui/aisle'

const props = defineProps<{ list: ShoppingList }>()

const emit = defineEmits<{
  toggle: [item: ShoppingListItem, checked: boolean]
}>()

// À acheter : groupé par rayon ; déjà coché : regroupé en bas
const aisleGroups = computed(() =>
  groupByAisle(props.list.items.filter((item) => !item.checked)),
)
const checkedItems = computed(() =>
  props.list.items.filter((item) => item.checked),
)

function onToggle(item: ShoppingListItem, event: Event) {
  const input = event.target as HTMLInputElement
  const checked = input.checked
  // La case reflète l'état persisté : si l'écriture échoue, elle ne bouge pas
  input.checked = item.checked
  emit('toggle', item, checked)
}
</script>

<template>
  <div
    class="overflow-hidden rounded-[28px] border border-line bg-cream shadow-soft print:rounded-none print:border-0 print:bg-white print:shadow-none"
  >
    <div
      class="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5 print:border-ink/30 print:px-0 print:py-2"
    >
      <span class="eyebrow print:text-ink-soft">À acheter</span>
      <span class="text-[12px] font-medium text-ink-soft tabular-nums">
        {{ countLabel(list.items.length, 'article') }}
      </span>
    </div>

    <!-- Tout est coché : petite victoire à la place de la liste -->
    <p
      v-if="aisleGroups.length === 0"
      class="px-5 py-10 text-center font-display text-[17px] font-bold text-olive-700"
    >
      🎉 Tout est dans le panier !
    </p>

    <section
      v-for="group in aisleGroups"
      :key="group.aisle.id"
      class="print-avoid-break"
    >
      <h3
        class="flex items-center gap-2 border-y border-line bg-paper/70 px-5 py-2 font-display text-[13px] font-bold text-ink-soft first-of-type:border-t-0 print:border-t-0 print:border-b-0 print:bg-transparent print:px-0 print:pt-4 print:pb-1 print:text-[12pt] print:text-ink"
      >
        <span aria-hidden="true">{{ group.aisle.emoji }}</span>
        {{ group.aisle.label }}
        <span
          class="ml-auto text-[11px] font-semibold text-ink-faint tabular-nums print:hidden"
        >
          {{ group.items.length }}
        </span>
      </h3>
      <ul>
        <li
          v-for="(item, index) in group.items"
          :key="`${item.ingredientId}|${item.unit}`"
          class="flex items-center gap-3 px-5 py-3 transition-colors duration-150 hover:bg-paper print:border-t-0 print:px-0 print:py-1.5"
          :class="index > 0 ? 'border-t border-line' : ''"
        >
          <input
            type="checkbox"
            :checked="item.checked"
            :aria-label="`Cocher ${item.name}`"
            class="checkbox"
            @change="onToggle(item, $event)"
          />
          <span class="text-ink print:text-[11pt]">
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
            class="rounded-full bg-paper px-2.5 py-0.5 text-[13px] font-semibold whitespace-nowrap text-ink tabular-nums print:bg-transparent print:px-0 print:text-[11pt]"
          >
            {{ item.totalQuantity }} {{ UNIT_LABELS[item.unit] }}
          </span>
        </li>
      </ul>
    </section>

    <!-- Déjà dans le panier : replié visuellement en bas, hors impression -->
    <section v-if="checkedItems.length > 0" class="no-print">
      <h3
        class="flex items-center gap-2 border-y border-line bg-olive-50/60 px-5 py-2 font-display text-[13px] font-bold text-olive-700"
      >
        <span aria-hidden="true">✅</span>
        Dans le panier
        <span class="ml-auto text-[11px] font-semibold text-olive-600 tabular-nums">
          {{ checkedItems.length }}
        </span>
      </h3>
      <ul>
        <li
          v-for="(item, index) in checkedItems"
          :key="`${item.ingredientId}|${item.unit}`"
          class="flex items-center gap-3 px-5 py-2.5 transition-colors duration-150 hover:bg-paper"
          :class="index > 0 ? 'border-t border-line' : ''"
        >
          <input
            type="checkbox"
            :checked="item.checked"
            :aria-label="`Décocher ${item.name}`"
            class="checkbox"
            @change="onToggle(item, $event)"
          />
          <span class="text-ink-faint line-through decoration-ink-faint">
            {{ item.name }}
          </span>
          <span class="ml-auto text-[13px] text-ink-faint tabular-nums">
            {{ item.totalQuantity }} {{ UNIT_LABELS[item.unit] }}
          </span>
        </li>
      </ul>
    </section>
  </div>
</template>
