<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { Recipe, RecipeDraft } from '@/domain/models'
import { countLabel } from '@/shared/labels'
import { useUseCases } from '@/ui/di'
import { showErrorToast, showToast } from '@/ui/toast'
import BaseButton from '@/ui/components/base/BaseButton.vue'
import BaseCard from '@/ui/components/base/BaseCard.vue'
import ConfirmModal from '@/ui/components/base/ConfirmModal.vue'
import LoadErrorCard from '@/ui/components/base/LoadErrorCard.vue'
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
const deleting = ref<Recipe | null>(null)
const formErrors = ref<string[]>([])
const loaded = ref(false)
const loadFailed = ref(false)
const saving = ref(false)
const search = ref('')

// Recherche insensible aux accents et à la casse (« pates » trouve « Pâtes »)
function normalize(value: string): string {
  return value.trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
}

const filteredRecipes = computed(() => {
  const query = normalize(search.value)
  if (!query) return recipes.value
  return recipes.value.filter((r) => normalize(r.name).includes(query))
})

async function reload() {
  loadFailed.value = false
  try {
    recipes.value = await getRecipes.execute()
    const ingredients = await getIngredients.execute()
    ingredientNameById.value = new Map(ingredients.map((i) => [i.id, i.name]))
  } catch {
    loadFailed.value = true
  }
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
  if (saving.value) return
  saving.value = true
  try {
    const result = await saveRecipe.execute(draft)
    if (result.ok) {
      const created = !draft.id
      editing.value = null
      formErrors.value = []
      await reload()
      showToast(created ? 'Recette ajoutée au carnet' : 'Recette mise à jour', '✅')
    } else {
      formErrors.value = result.errors
    }
  } catch {
    showErrorToast('La recette n’a pas pu être enregistrée. Réessayez.')
  } finally {
    saving.value = false
  }
}

async function confirmDelete() {
  if (!deleting.value) return
  const recipe = deleting.value
  // Fermée tout de suite : pas de second clic possible pendant l'écriture
  deleting.value = null
  try {
    await deleteRecipe.execute(recipe.id)
    await reload()
    showToast('Recette supprimée', '🗑️')
  } catch {
    showErrorToast('La recette n’a pas pu être supprimée. Réessayez.')
  }
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
        :saving="saving"
        @save="handleSave"
        @cancel="editing = null"
      />
    </BaseCard>

    <template v-else>
      <div class="flex flex-wrap items-center gap-3">
        <div class="mr-auto flex items-center gap-3">
          <span
            class="grid size-12 place-items-center rounded-2xl bg-olive-100 text-[22px] shadow-soft"
            aria-hidden="true"
          >
            📖
          </span>
          <div>
            <h1 class="font-display text-[28px] font-extrabold tracking-tight">
              Recettes
            </h1>
            <p v-if="recipes.length > 0" class="text-[13px] text-ink-soft tabular-nums">
              {{ countLabel(recipes.length, 'recette') }} au carnet
            </p>
            <p v-else class="text-[13px] text-ink-soft">Votre carnet de cuisine</p>
          </div>
        </div>
        <BaseButton variant="primary" @click="startCreate">
          Ajouter une recette
        </BaseButton>
      </div>

      <!-- Recherche dès que le carnet s'étoffe -->
      <label v-if="recipes.length >= 4" class="relative block sm:max-w-xs">
        <span
          class="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
          aria-hidden="true"
        >
          🔍
        </span>
        <input
          v-model="search"
          type="search"
          placeholder="Chercher une recette…"
          aria-label="Chercher une recette"
          class="field-control pl-11"
        />
      </label>

      <LoadErrorCard v-if="loadFailed" @retry="reload" />

      <BaseCard v-else-if="loaded && recipes.length === 0" class="py-14 text-center">
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

      <!-- Squelette pendant le chargement (latence Firestore) -->
      <div v-else-if="!loaded" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="i in 6" :key="i" class="skeleton h-52 !rounded-[28px]"></div>
      </div>

      <BaseCard
        v-else-if="filteredRecipes.length === 0"
        class="py-10 text-center"
      >
        <p class="text-3xl" aria-hidden="true">🤷</p>
        <p class="mt-3 text-ink-soft">
          Aucune recette ne correspond à « {{ search }} ».
        </p>
      </BaseCard>

      <RecipeList
        v-else
        :recipes="filteredRecipes"
        @preview="previewing = $event"
        @edit="startEdit"
        @delete="deleting = $event"
      />

      <RecipePreviewModal
        v-if="previewing"
        :recipe="previewing"
        :ingredient-name-by-id="ingredientNameById"
        @edit="startEdit"
        @close="previewing = null"
      />

      <ConfirmModal
        v-if="deleting"
        :title="`Supprimer « ${deleting.name} » ?`"
        message="Les repas planifiés avec cette recette seront retirés du plan."
        confirm-label="Supprimer"
        emoji="🗑️"
        danger
        @confirm="confirmDelete"
        @close="deleting = null"
      />
    </template>
  </div>
</template>
