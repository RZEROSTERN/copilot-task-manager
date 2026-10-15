<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import type { TaskList } from '../../types'
import AppIcon from '../../components/ui/AppIcon.vue'

const props = defineProps<{
  list: TaskList
}>()

const emit = defineEmits<{
  rename: [payload: { listId: string; title: string }]
  delete: [list: TaskList]
}>()

const editing = ref(false)
const title = ref(props.list.title)
const titleInput = ref<HTMLInputElement | null>(null)

watch(
  () => props.list.title,
  (nextTitle) => {
    if (!editing.value) title.value = nextTitle
  },
)

async function startEditing(): Promise<void> {
  editing.value = true
  title.value = props.list.title
  await nextTick()
  titleInput.value?.focus()
  titleInput.value?.select()
}

function saveTitle(): void {
  const nextTitle = title.value.trim()
  if (nextTitle && nextTitle !== props.list.title) {
    emit('rename', { listId: props.list.id, title: nextTitle })
  } else {
    title.value = props.list.title
  }
  editing.value = false
}

function cancelEdit(): void {
  title.value = props.list.title
  editing.value = false
}
</script>

<template>
  <article class="kanban-list">
    <header class="kanban-list-header">
      <span
        class="list-drag-handle"
        aria-label="Drag to reorder list"
        title="Drag to reorder"
      >
        <span /><span /><span /><span /><span /><span />
      </span>
      <span class="list-color-dot" />
      <input
        v-if="editing"
        ref="titleInput"
        v-model="title"
        class="list-title-input"
        maxlength="60"
        aria-label="List title"
        @keydown.enter.prevent="saveTitle"
        @keydown.esc.prevent="cancelEdit"
        @blur="saveTitle"
      >
      <button
        v-else
        class="list-title-button"
        type="button"
        :aria-label="`Rename ${list.title}`"
        @click="startEditing"
      >
        {{ list.title }}
      </button>
      <span class="list-card-count">{{ list.cardIds.length }}</span>
      <button
        class="icon-button list-menu-button"
        type="button"
        :aria-label="`Delete ${list.title}`"
        title="Delete list"
        @click="emit('delete', list)"
      >
        <AppIcon
          name="more"
          :size="17"
        />
      </button>
    </header>

    <div class="list-empty-content">
      <div class="list-empty-mark">
        <span /><span /><span />
      </div>
      <p>{{ list.cardIds.length ? 'Cards are ready to organize' : 'No cards yet' }}</p>
      <span>Cards will appear here</span>
    </div>

    <button
      class="list-add-card"
      type="button"
      disabled
    >
      <AppIcon
        name="plus"
        :size="15"
      />
      Add a card
    </button>
  </article>
</template>
