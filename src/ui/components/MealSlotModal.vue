<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { MealSlot, MealType, Recipe } from '@/domain/models'
import { formatDayLabel } from '@/shared/date'
import { newId } from '@/shared/id'
import MealBadge from '@/ui/components/MealBadge.vue'
import RecipePreview from '@/ui/components/RecipePreview.vue'
import { recipeVisual } from '@/ui/recipeVisual'
import BaseButton from '@/ui/components/base/BaseButton.vue'
import BaseStepper from '@/ui/components/base/BaseStepper.vue'
import ModalShell from '@/ui/components/base/ModalShell.vue'

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
const search = ref('')

function normalize(value: string): string {
  return value.trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
}

// Sélecteur visuel : recettes triées, filtrées par la recherche
const pickerRecipes = computed(() => {
  const query = normalize(search.value)
  return [...props.recipes]
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
    .filter((r) => !query || normalize(r.name).includes(query))
})

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
  <ModalShell max-width="max-w-lg" @close="emit('close')">
    <MealBadge :meal-type="mealType" />
    <h2 class="mt-2 mb-5 font-display text-[22px] font-extrabold tracking-tight capitalize">
      {{ formatDayLabel(date) }}
    </h2>

    <div class="space-y-4">
      <fieldset>
        <legend class="field-label">Recette</legend>
        <input
          v-if="recipes.length > 6"
          v-model="search"
          type="search"
          placeholder="🔍 Chercher…"
          aria-label="Chercher une recette"
          class="field-control mb-2"
        />
        <div
          class="max-h-56 space-y-1.5 overflow-y-auto rounded-2xl border border-line bg-paper/60 p-2"
        >
          <p v-if="pickerRecipes.length === 0" class="px-3 py-4 text-center text-sm text-ink-soft">
            Aucune recette ne correspond.
          </p>
          <button
            v-for="recipe in pickerRecipes"
            :key="recipe.id"
            type="button"
            class="flex w-full cursor-pointer items-center gap-2.5 rounded-xl border-2 px-3 py-2 text-left transition-all duration-150 ease-pop"
            :class="
              recipe.id === recipeId
                ? 'shadow-soft'
                : 'border-transparent hover:border-line-strong hover:bg-cream'
            "
            :style="
              recipe.id === recipeId
                ? {
                    backgroundColor: recipeVisual(recipe.name).soft,
                    borderColor: recipeVisual(recipe.name).border,
                  }
                : undefined
            "
            :aria-pressed="recipe.id === recipeId"
            @click="recipeId = recipe.id"
          >
            <span class="text-xl" aria-hidden="true">{{ recipeVisual(recipe.name).emoji }}</span>
            <span
              class="min-w-0 flex-1 truncate text-sm font-bold"
              :style="recipe.id === recipeId ? { color: recipeVisual(recipe.name).text } : undefined"
            >
              {{ recipe.name }}
            </span>
            <span
              v-if="recipe.id === recipeId"
              class="grid size-5 shrink-0 place-items-center rounded-full text-[11px] font-bold text-white"
              :style="{ backgroundColor: recipeVisual(recipe.name).accent }"
              aria-hidden="true"
            >
              ✓
            </span>
          </button>
        </div>
      </fieldset>

      <BaseStepper v-model="servings" label="Portions" :min="1" unit="personnes" />
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
  </ModalShell>
</template>
