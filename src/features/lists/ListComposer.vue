<script setup lang="ts">
import { nextTick, ref } from 'vue'
import AppIcon from '../../components/ui/AppIcon.vue'

const emit = defineEmits<{
  create: [title: string]
  cancel: []
}>()

const title = ref('')
const input = ref<HTMLInputElement | null>(null)

async function focusInput(): Promise<void> {
  await nextTick()
  input.value?.focus()
}

defineExpose({ focusInput })

function create(): void {
  const name = title.value.trim()
  if (!name) return
  emit('create', name)
  title.value = ''
}
</script>

<template>
  <form
    class="list-composer"
    @submit.prevent="create"
  >
    <label
      class="composer-label"
      for="new-list-title"
    >New list</label>
    <input
      id="new-list-title"
      ref="input"
      v-model="title"
      class="list-title-input composer-input"
      maxlength="60"
      placeholder="Enter list name…"
      @keydown.esc.prevent="emit('cancel')"
    >
    <div class="composer-actions">
      <button
        class="primary-button composer-create"
        type="submit"
        :disabled="!title.trim()"
      >
        Add list
      </button>
      <button
        class="icon-button composer-cancel"
        type="button"
        aria-label="Cancel"
        @click="emit('cancel')"
      >
        <AppIcon
          name="close"
          :size="16"
        />
      </button>
    </div>
  </form>
</template>
