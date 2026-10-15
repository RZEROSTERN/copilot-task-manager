<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { RouterLink, useRoute } from 'vue-router'
import AppIcon from '../components/ui/AppIcon.vue'
import ListColumn from '../features/lists/ListColumn.vue'
import ListComposer from '../features/lists/ListComposer.vue'
import { useBoardStore } from '../stores/board'
import type { Board, TaskList } from '../types'

defineProps<{
  boards: Board[]
  activeBoardId: string | null
}>()

defineEmits<{
  create: []
  rename: [board: Board]
  delete: [board: Board]
  select: [board: Board]
}>()

const route = useRoute()
const store = useBoardStore()
const board = computed(() => store.boardById(String(route.params.boardId)))
const lists = computed(() => board.value ? store.listsForBoard(board.value.id) : [])
const sortableLists = ref<TaskList[]>([])
const addingList = ref(false)
const listComposer = ref<InstanceType<typeof ListComposer> | null>(null)
const draggingCardId = ref<string | null>(null)

watch(
  lists,
  (nextLists) => {
    sortableLists.value = nextLists.map((list) => ({ ...list, cardIds: [...list.cardIds] }))
  },
  { immediate: true },
)

function reorderLists(): void {
  if (!board.value) return
  store.reorderLists(board.value.id, sortableLists.value.map((list) => list.id))
}

async function addList(): Promise<void> {
  addingList.value = true
  await nextTick()
  void listComposer.value?.focusInput()
}

function createList(title: string): void {
  if (!board.value) return
  store.createList(board.value.id, title)
  addingList.value = false
}

function deleteList(list: TaskList): void {
  const confirmed = window.confirm(
    `Delete "${list.title}" and its ${list.cardIds.length} ${list.cardIds.length === 1 ? 'card' : 'cards'}? This cannot be undone.`,
  )
  if (confirmed) store.deleteList(list.id)
}

function createCard(payload: { listId: string; title: string }): void {
  store.createCard(payload.listId, payload.title)
}

function moveCard(payload: { cardId: string; targetListId: string; position: number }): void {
  store.moveCard(payload.cardId, payload.targetListId, payload.position)
}

function handleCardDragStart(cardId: string): void {
  draggingCardId.value = cardId
}

function handleCardDragEnd(): void {
  draggingCardId.value = null
}
</script>

<template>
  <section
    v-if="board"
    class="kanban-board-page"
  >
    <div class="kanban-heading">
      <div class="kanban-heading-title">
        <RouterLink
          class="back-to-boards"
          :to="{ name: 'home' }"
          aria-label="Back to all boards"
        >
          <AppIcon
            name="chevron"
            :size="16"
          />
        </RouterLink>
        <div>
          <p class="eyebrow">
            Board
          </p>
          <h2>{{ board.title }}</h2>
        </div>
        <span class="board-list-total">{{ lists.length }} {{ lists.length === 1 ? 'list' : 'lists' }}</span>
      </div>
      <button
        class="primary-button add-list-top"
        type="button"
        @click="addList"
      >
        <AppIcon
          name="plus"
          :size="16"
        />
        Add list
      </button>
    </div>

    <div class="kanban-scroll-hint">
      <span /> Drag lists to reorder <span />
    </div>

    <div class="kanban-scroll-area">
      <VueDraggable
        v-if="lists.length"
        v-model="sortableLists"
        class="kanban-lists"
        :animation="180"
        handle=".list-drag-handle"
        ghost-class="list-ghost"
        chosen-class="list-chosen"
        drag-class="list-dragging"
        @end="reorderLists"
      >
        <ListColumn
          v-for="list in sortableLists"
          :key="list.id"
          :list="list"
          :cards="store.cardsForList(list.id)"
          :labels="store.labels"
          :dragging-card-id="draggingCardId"
          @rename="({ listId, title }) => store.renameList(listId, title)"
          @delete="deleteList"
          @create-card="createCard"
          @move-card="moveCard"
          @card-drag-start="handleCardDragStart"
          @card-drag-end="handleCardDragEnd"
        />
      </VueDraggable>
      <div
        v-else
        class="lists-empty-state"
      >
        <div class="empty-state-icon">
          <AppIcon
            name="grid"
            :size="22"
          />
        </div>
        <h3>Start with a list</h3>
        <p>Lists help break your board into clear stages.</p>
      </div>

      <ListComposer
        v-if="addingList"
        ref="listComposer"
        class="new-list-composer"
        @create="createList"
        @cancel="addingList = false"
      />
      <button
        v-else
        class="add-list-tile"
        type="button"
        @click="addList"
      >
        <AppIcon
          name="plus"
          :size="17"
        />
        {{ lists.length ? 'Add another list' : 'Add your first list' }}
      </button>
    </div>
  </section>
  <section
    v-else
    class="board-not-found"
  >
    <div class="empty-state-icon">
      <AppIcon
        name="grid"
        :size="24"
      />
    </div>
    <h2>Board not found</h2>
    <p>This board may have been deleted. Choose another board from your workspace.</p>
    <RouterLink
      class="text-link"
      :to="{ name: 'home' }"
    >
      View all boards
    </RouterLink>
  </section>
</template>
