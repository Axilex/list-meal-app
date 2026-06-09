<script setup lang="ts">
import { reactive } from 'vue'
import type { RecipeDraft, Unit } from '@/domain/models'
import { STEP_ACTIONS, UNIT_LABELS } from '@/shared/labels'
import BaseButton from '@/ui/components/base/BaseButton.vue'
import BaseInput from '@/ui/components/base/BaseInput.vue'
import BaseSelect from '@/ui/components/base/BaseSelect.vue'

const props = defineProps<{
  draft: RecipeDraft
  errors: string[]
  /** Noms d'ingrédients existants, proposés en autocomplétion. */
  ingredientNames: string[]
  /** Écriture en cours : neutralise la soumission pour éviter un double envoi. */
  saving?: boolean
}>()

const emit = defineEmits<{
  save: [draft: RecipeDraft]
  cancel: []
}>()

// Copie locale : le parent reste propriétaire du draft d'origine
// (pas de structuredClone : props.draft est un Proxy réactif, non clonable)
const form = reactive({
  ...props.draft,
  ingredients: props.draft.ingredients.map((row) => ({ ...row })),
  steps: (props.draft.steps ?? []).map((step) => ({ ...step })),
})

const unitOptions = (Object.keys(UNIT_LABELS) as Unit[]).map((unit) => ({
  value: unit,
  label: UNIT_LABELS[unit],
}))

const actionOptions = STEP_ACTIONS.map(({ action, emoji }) => ({
  value: action,
  label: `${emoji} ${action}`,
}))

function addIngredientRow() {
  form.ingredients.push({ name: '', quantity: 1, unit: 'g' })
}

function removeIngredientRow(index: number) {
  form.ingredients.splice(index, 1)
}

function addStepRow() {
  form.steps.push({ action: 'Préparer', detail: '' })
}

function removeStepRow(index: number) {
  form.steps.splice(index, 1)
}
</script>

<template>
  <form class="space-y-5" @submit.prevent="emit('save', { ...form })">
    <div>
      <p class="eyebrow text-olive-600">Recette</p>
      <h2 class="mt-1 font-display text-[22px] font-extrabold tracking-tight">
        {{ form.id ? 'Modifier la recette' : 'Nouvelle recette' }}
      </h2>
    </div>

    <ul
      v-if="errors.length > 0"
      class="space-y-1 rounded-2xl border-2 border-brick-200 bg-brick-50 p-3.5 text-sm text-brick-700"
    >
      <li v-for="error in errors" :key="error">{{ error }}</li>
    </ul>

    <div class="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_140px]">
      <BaseInput v-model="form.name" label="Nom" placeholder="Riz à la tomate" />
      <BaseInput v-model="form.servings" label="Portions" type="number" :min="1" :step="1" />
    </div>

    <fieldset>
      <legend class="field-label mb-2">Ingrédients</legend>
      <div class="space-y-2">
        <div
          v-for="(row, index) in form.ingredients"
          :key="index"
          class="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[1fr_90px_110px_1fr_auto]"
        >
          <BaseInput
            v-model="row.name"
            placeholder="Tomate"
            list="ingredient-names"
            class="col-span-1"
          />
          <BaseInput
            v-model="row.quantity"
            type="number"
            :min="0"
            step="any"
            placeholder="200"
            class="sm:order-none"
          />
          <BaseSelect v-model="row.unit" :options="unitOptions" />
          <BaseInput v-model="row.note" placeholder="Note (en dés, en boîte…)" />
          <BaseButton
            variant="ghost"
            title="Retirer cet ingrédient"
            @click="removeIngredientRow(index)"
          >
            ✕
          </BaseButton>
        </div>
      </div>
      <BaseButton variant="secondary" class="mt-3" @click="addIngredientRow">
        + Ajouter un ingrédient
      </BaseButton>
      <datalist id="ingredient-names">
        <option v-for="name in ingredientNames" :key="name" :value="name" />
      </datalist>
    </fieldset>

    <fieldset>
      <legend class="field-label mb-2">Étapes (optionnel)</legend>
      <div class="space-y-3">
        <div
          v-for="(step, index) in form.steps"
          :key="index"
          class="rounded-2xl border border-line bg-paper/60 p-4"
        >
          <div class="mb-3 flex items-center justify-between">
            <span class="eyebrow">Étape {{ index + 1 }}</span>
            <BaseButton
              variant="ghost"
              title="Retirer cette étape"
              @click="removeStepRow(index)"
            >
              ✕
            </BaseButton>
          </div>
          <div class="grid grid-cols-1 gap-2 sm:grid-cols-[180px_1fr_120px]">
            <BaseSelect v-model="step.action" label="Type" :options="actionOptions" />
            <BaseInput
              v-model="step.detail"
              label="Détail"
              placeholder="le poulet en dés, à feu vif…"
            />
            <BaseInput
              v-model="step.durationMin"
              label="Durée (min)"
              type="number"
              :min="1"
              :step="1"
              placeholder="10"
            />
          </div>
        </div>
      </div>
      <BaseButton variant="secondary" class="mt-3" @click="addStepRow">
        + Ajouter une étape
      </BaseButton>
    </fieldset>

    <div class="flex justify-end gap-2 border-t border-line pt-4">
      <BaseButton variant="secondary" @click="emit('cancel')">Annuler</BaseButton>
      <BaseButton variant="primary" type="submit" :disabled="saving">
        {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
      </BaseButton>
    </div>
  </form>
</template>
