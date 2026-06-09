<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { MealSlot, MealType, Recipe } from '@/domain/models'
import { formatDayLabel } from '@/shared/date'
import { newId } from '@/shared/id'
import MealBadge from '@/ui/components/MealBadge.vue'
import RecipePreview from '@/ui/components/RecipePreview.vue'
import { recipeVisual } from '@/ui/recipeVisual'
import BaseButton from '@/ui/components/base/BaseButton.vue'
import BaseInput from '@/ui/components/base/BaseInput.vue'
import BaseSelect from '@/ui/components/base/BaseSelect.vue'

const props = defineProps<{
  date: string
  mealType: MealType
  slot: MealSlot | null
  recipes: Recipe[]
  ingredientNameById: Map<string, string>
}>()

const emit = defineEmits<{
  save: [slot: MealSlot]
  remove: [slotId: string]
  close: []
}>()

const recipeId = ref<string>(props.slot?.recipeId ?? '')
const servings = ref<number>(props.slot?.servings ?? 2)

const selectedRecipe = computed(
  () => props.recipes.find((r) => r.id === recipeId.value) ?? null,
)

// À la sélection d'une recette, proposer son nombre de portions de base
watch(recipeId, (id) => {
  const recipe = props.recipes.find((r) => r.id === id)
  if (recipe && !props.slot) servings.value = recipe.servings
})

function save() {
  emit('save', {
    id: props.slot?.id ?? newId(),
    date: props.date,
    mealType: props.mealType,
    recipeId: recipeId.value,
    servings: servings.value,
  })
}
</script>

<template>
  <div
    class="modal-backdrop fixed inset-0 z-30 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
    @click.self="emit('close')"
  >
    <div
      class="modal-panel max-h-[85vh] w-full max-w-md overflow-y-auto rounded-[28px] border border-line bg-cream p-6 shadow-modal"
    >
      <MealBadge :meal-type="mealType" />
      <h2 class="mt-2 mb-5 font-display text-[22px] font-extrabold tracking-tight capitalize">
        {{ formatDayLabel(date) }}
      </h2>

      <div class="space-y-3">
        <BaseSelect
          v-model="recipeId"
          label="Recette"
          placeholder="Choisissez une recette"
          :options="
            recipes.map((r) => ({
              value: r.id,
              label: `${recipeVisual(r.name).emoji} ${r.name}`,
            }))
          "
        />
        <BaseInput
          v-model="servings"
          label="Portions"
          type="number"
          :min="1"
          :step="1"
        />
      </div>

      <!-- Aperçu de la recette choisie, quantités à l'échelle des portions -->
      <div
        v-if="selectedRecipe"
        class="mt-5 rounded-2xl border border-line bg-paper/60 p-4"
      >
        <RecipePreview
          :recipe="selectedRecipe"
          :ingredient-name-by-id="ingredientNameById"
          :servings="servings > 0 ? servings : undefined"
        />
      </div>

      <div class="mt-6 flex flex-wrap justify-end gap-2">
        <BaseButton
          v-if="slot"
          variant="danger"
          class="mr-auto"
          @click="emit('remove', slot.id)"
        >
          Retirer
        </BaseButton>
        <BaseButton variant="secondary" @click="emit('close')">Annuler</BaseButton>
        <BaseButton
          variant="primary"
          :disabled="recipeId === '' || !(servings > 0)"
          @click="save"
        >
          Enregistrer
        </BaseButton>
      </div>
    </div>
  </div>
</template>
