<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import type { Card, Label, TaskList } from '../../types'
import AppIcon from '../../components/ui/AppIcon.vue'
import CardComposer from '../cards/CardComposer.vue'
import CardTile from '../cards/CardTile.vue'

const props = defineProps<{
  list: TaskList
  cards: Card[]
  labels: Label[]
  draggingCardId: string | null
}>()

const emit = defineEmits<{
  rename: [payload: { listId: string; title: string }]
  delete: [list: TaskList]
  createCard: [payload: { listId: string; title: string }]
  moveCard: [payload: { cardId: string; targetListId: string; position: number }]
  cardDragStart: [cardId: string]
  cardDragEnd: []
  openCard: [card: Card]
}>()

const editing = ref(false)
const title = ref(props.list.title)
const titleInput = ref<HTMLInputElement | null>(null)
const addingCard = ref(false)
const sortableCards = ref<Card[]>([...props.cards])

watch(
  () => props.cards,
  (cards) => {
    sortableCards.value = [...cards]
  },
  { deep: true },
)

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

function finishCardDrag(): void {
  const cardId = props.draggingCardId
  if (!cardId) return
  const position = sortableCards.value.findIndex((card) => card.id === cardId)
  if (position < 0) return
  emit('moveCard', { cardId, targetListId: props.list.id, position })
}

function handleCardDragStart(event: { oldIndex?: number }): void {
  const card = event.oldIndex === undefined ? undefined : sortableCards.value[event.oldIndex]
  if (card) emit('cardDragStart', card.id)
}

function handleCardDragEnd(): void {
  finishCardDrag()
  emit('cardDragEnd')
}

function createCard(title: string): void {
  emit('createCard', { listId: props.list.id, title })
  addingCard.value = false
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

    <VueDraggable
      v-model="sortableCards"
      class="list-card-stack"
      :group="{ name: 'board-cards', pull: true, put: true }"
      :animation="160"
      handle=".card-drag-handle"
      draggable=".task-card-draggable"
      ghost-class="card-ghost"
      chosen-class="card-chosen"
      drag-class="card-dragging"
      :empty-insert-threshold="24"
      @start="handleCardDragStart"
      @end="handleCardDragEnd"
      @add="finishCardDrag"
    >
      <div
        v-for="card in sortableCards"
        :key="card.id"
        class="task-card-draggable"
        role="button"
        tabindex="0"
        :aria-label="`Open card: ${card.title}`"
        @click="emit('openCard', card)"
        @keydown.enter.prevent="emit('openCard', card)"
        @keydown.space.prevent="emit('openCard', card)"
      >
        <span
          class="card-drag-handle"
          aria-label="Drag to move card"
          title="Drag to move"
        >
          <AppIcon
            name="drag"
            :size="15"
          />
        </span>
        <CardTile
          :card="card"
          :labels="labels"
        />
      </div>
      <div
        v-if="sortableCards.length === 0 && !addingCard"
        class="list-empty-content"
      >
        <div class="list-empty-mark">
          <span /><span /><span />
        </div>
        <p>No cards yet</p>
        <span>Add a card to get started</span>
      </div>
    </VueDraggable>

    <CardComposer
      v-if="addingCard"
      :active="addingCard"
      @create="createCard"
      @cancel="addingCard = false"
    />
    <button
      v-else
      class="list-add-card"
      type="button"
      @click="addingCard = true"
    >
      <AppIcon
        name="plus"
        :size="15"
      />
      Add a card
    </button>
  </article>
</template>
