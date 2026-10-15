<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { LABEL_COLORS } from '../../types'

const props = defineProps<{
  open: boolean
  initialTitle?: string
  initialColor?: string
  mode: 'create' | 'rename'
}>()

const emit = defineEmits<{
  save: [payload: { title: string; color: string }]
  close: []
}>()

const title = ref('')
const color = ref<string>(LABEL_COLORS[5])
const dialog = ref<HTMLDialogElement | null>(null)
const titleInput = ref<HTMLInputElement | null>(null)
const canSave = computed(() => title.value.trim().length > 0)

watch(
  () => props.open,
  (open) => {
    if (open) {
      title.value = props.initialTitle ?? ''
      color.value = props.initialColor ?? LABEL_COLORS[5]
      requestAnimationFrame(() => {
        if (dialog.value && !dialog.value.open) dialog.value.showModal()
        titleInput.value?.focus()
      })
    } else if (dialog.value?.open) {
      dialog.value.close()
    }
  },
  { immediate: true },
)

function close(): void {
  emit('close')
}

function save(): void {
  if (!canSave.value) return
  emit('save', { title: title.value.trim(), color: color.value })
}

function onCancel(event: Event): void {
  event.preventDefault()
  close()
}
</script>

<template>
  <dialog
    ref="dialog"
    class="board-dialog"
    @cancel="onCancel"
    @click.self="close"
  >
    <form
      class="board-dialog-form"
      @submit.prevent="save"
    >
      <div class="dialog-heading">
        <div>
          <p class="eyebrow">
            {{ mode === 'create' ? 'New workspace board' : 'Board settings' }}
          </p>
          <h2>{{ mode === 'create' ? 'Create a board' : 'Rename board' }}</h2>
        </div>
        <button
          class="icon-button dialog-close"
          type="button"
          aria-label="Close dialog"
          @click="close"
        >
          ×
        </button>
      </div>
      <label
        class="dialog-label"
        for="board-title"
      >Board name</label>
      <input
        id="board-title"
        ref="titleInput"
        v-model="title"
        class="board-title-input"
        type="text"
        maxlength="60"
        placeholder="e.g. Product launch"
        required
      >
      <fieldset class="color-picker">
        <legend class="dialog-label">
          Board color
        </legend>
        <button
          v-for="swatch in LABEL_COLORS"
          :key="swatch"
          class="color-swatch"
          :class="{ 'is-selected': color === swatch }"
          :style="{ '--swatch': swatch }"
          type="button"
          :aria-label="`Select color ${swatch}`"
          :aria-pressed="color === swatch"
          @click="color = swatch"
        />
      </fieldset>
      <div class="dialog-actions">
        <button
          class="secondary-button"
          type="button"
          @click="close"
        >
          Cancel
        </button>
        <button
          class="primary-button"
          type="submit"
          :disabled="!canSave"
        >
          {{ mode === 'create' ? 'Create board' : 'Save changes' }}
        </button>
      </div>
    </form>
  </dialog>
</template>
