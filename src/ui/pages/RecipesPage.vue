<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Recipe, RecipeDraft } from '@/domain/models'
import { useUseCases } from '@/ui/di'
import BaseButton from '@/ui/components/base/BaseButton.vue'
import BaseCard from '@/ui/components/base/BaseCard.vue'
import RecipeForm from '@/ui/components/RecipeForm.vue'
import RecipeList from '@/ui/components/RecipeList.vue'
import RecipePreviewModal from '@/ui/components/RecipePreviewModal.vue'

const { getRecipes, getIngredients, saveRecipe, deleteRecipe } = useUseCases()

const recipes = ref<Recipe[]>([])
const ingredientNameById = ref(new Map<string, string>())
const ingredientNames = computed(() =>
  [...ingredientNameById.value.values()].sort((a, b) =>
    a.localeCompare(b, 'fr'),
  ),
)
const editing = ref<RecipeDraft | null>(null)
const previewing = ref<Recipe | null>(null)
const formErrors = ref<string[]>([])
const loaded = ref(false)

async function reload() {
  recipes.value = await getRecipes.execute()
  const ingredients = await getIngredients.execute()
  ingredientNameById.value = new Map(ingredients.map((i) => [i.id, i.name]))
  loaded.value = true
}

onMounted(reload)

function startCreate() {
  formErrors.value = []
  editing.value = {
    name: '',
    servings: 2,
    ingredients: [{ name: '', quantity: 1, unit: 'g' }],
    steps: [],
  }
}

function startEdit(recipe: Recipe) {
  formErrors.value = []
  previewing.value = null
  editing.value = {
    id: recipe.id,
    name: recipe.name,
    servings: recipe.servings,
    ingredients: recipe.ingredients.map((ri) => ({
      name: ingredientNameById.value.get(ri.ingredientId) ?? '',
      quantity: ri.quantity,
      unit: ri.unit,
      note: ri.note,
    })),
    // Le texte libre hérité devient une première étape éditable
    steps: recipe.steps
      ? recipe.steps.map((step) => ({ ...step }))
      : recipe.instructions
        ? [{ action: 'Préparer', detail: recipe.instructions }]
        : [],
  }
}

async function handleSave(draft: RecipeDraft) {
  const result = await saveRecipe.execute(draft)
  if (result.ok) {
    editing.value = null
    formErrors.value = []
    await reload()
  } else {
    formErrors.value = result.errors
  }
}

async function handleDelete(recipe: Recipe) {
  const confirmed = confirm(
    `Supprimer la recette « ${recipe.name} » ?\n` +
      'Les repas planifiés avec cette recette seront retirés du plan.',
  )
  if (!confirmed) return
  await deleteRecipe.execute(recipe.id)
  await reload()
}
</script>

<template>
  <div class="space-y-5">
    <BaseCard v-if="editing">
      <RecipeForm
        :key="editing.id ?? 'new'"
        :draft="editing"
        :errors="formErrors"
        :ingredient-names="ingredientNames"
        @save="handleSave"
        @cancel="editing = null"
      />
    </BaseCard>

    <template v-else>
      <div class="flex flex-wrap items-center gap-3">
        <h1
          class="mr-auto flex items-center gap-3 font-display text-[28px] font-extrabold tracking-tight"
        >
          <span
            class="grid size-12 place-items-center rounded-2xl bg-olive-100 text-[22px] shadow-soft"
            aria-hidden="true"
          >
            📖
          </span>
          Recettes
        </h1>
        <BaseButton variant="primary" @click="startCreate">
          Ajouter une recette
        </BaseButton>
      </div>

      <BaseCard v-if="loaded && recipes.length === 0" class="py-14 text-center">
        <div
          class="mx-auto mb-5 grid size-20 place-items-center rounded-full bg-olive-100 text-4xl"
          aria-hidden="true"
        >
          📖
        </div>
        <p class="eyebrow">Carnet vide</p>
        <p class="mx-auto mt-2 max-w-sm text-ink-soft">
          Aucune recette pour l’instant. Ajoutez votre première recette pour
          commencer à planifier vos repas.
        </p>
      </BaseCard>

      <RecipeList
        v-else
        :recipes="recipes"
        @preview="previewing = $event"
        @edit="startEdit"
        @delete="handleDelete"
      />

      <RecipePreviewModal
        v-if="previewing"
        :recipe="previewing"
        :ingredient-name-by-id="ingredientNameById"
        @edit="startEdit"
        @close="previewing = null"
      />
    </template>
  </div>
</template>
