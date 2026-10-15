<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

const props = defineProps<{
  active: boolean
}>()

const emit = defineEmits<{
  create: [title: string]
  cancel: []
}>()

const title = ref('')
const input = ref<HTMLTextAreaElement | null>(null)

watch(
  () => props.active,
  async (active) => {
    if (!active) return
    await nextTick()
    input.value?.focus()
  },
  { immediate: true },
)

function create(): void {
  const cardTitle = title.value.trim()
  if (!cardTitle) return
  emit('create', cardTitle)
  title.value = ''
}

async function focusInput(): Promise<void> {
  await nextTick()
  input.value?.focus()
}

defineExpose({ focusInput })

function onKeydown(event: KeyboardEvent): void {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    create()
  } else if (event.key === 'Escape') {
    event.preventDefault()
    title.value = ''
    emit('cancel')
  }
}
</script>

<template>
  <form
    class="card-composer"
    @submit.prevent="create"
  >
    <textarea
      ref="input"
      v-model="title"
      rows="2"
      maxlength="240"
      aria-label="New card title"
      placeholder="Enter a title for this card…"
      @keydown="onKeydown"
    />
    <div class="card-composer-actions">
      <span>Enter to add · Esc to cancel</span>
      <button
        class="card-composer-submit"
        type="submit"
        :disabled="!title.trim()"
      >
        Add card
      </button>
    </div>
  </form>
</template>
