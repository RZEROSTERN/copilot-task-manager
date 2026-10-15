<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import { RouterLink, useRoute } from 'vue-router'
import AppIcon from '../components/ui/AppIcon.vue'
import CardDetailModal from '../features/cards/CardDetailModal.vue'
import ListColumn from '../features/lists/ListColumn.vue'
import ListComposer from '../features/lists/ListComposer.vue'
import { useBoardStore } from '../stores/board'
import { useBoardSearch } from '../composables/useBoardSearch'
import type { Board, Card, TaskList } from '../types'

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
const selectedCardId = ref<string | null>(null)
const labelFilterOpen = ref(false)
const focusedListId = ref<string | null>(null)
const listColumnRefs = new Map<string, InstanceType<typeof ListColumn>>()
const {
  query,
  selectedLabelIds,
  searchInput,
  hasActiveFilters,
  matches,
  toggleLabelFilter,
  clearFilters,
  focusSearch,
} = useBoardSearch()
const allCards = computed(() => lists.value.flatMap((list) => store.cardsForList(list.id)))
const matchingCardCount = computed(() =>
  allCards.value.filter((card) => matches(card, store.labels)).length,
)

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

function openCard(card: Card): void {
  selectedCardId.value = card.id
}

function deleteCard(card: Card): void {
  store.deleteCard(card.id)
  selectedCardId.value = null
}

function visibleCards(listId: string): Card[] {
  return store.cardsForList(listId).filter((card) => matches(card, store.labels))
}

function setListColumnRef(listId: string, instance: InstanceType<typeof ListColumn> | null): void {
  if (instance) listColumnRefs.set(listId, instance)
  else listColumnRefs.delete(listId)
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    target.matches('input, textarea, select, [role="textbox"]') ||
    target.closest('[role="dialog"]') !== null
  )
}

function onShortcut(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    if (labelFilterOpen.value) labelFilterOpen.value = false
    return
  }
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || isTypingTarget(event.target)) return
  if (event.key === '/') {
    event.preventDefault()
    focusSearch()
  } else if (event.key.toLowerCase() === 'n' && focusedListId.value) {
    event.preventDefault()
    void listColumnRefs.get(focusedListId.value)?.focusAddCard()
  }
}

onMounted(() => window.addEventListener('keydown', onShortcut))
onBeforeUnmount(() => window.removeEventListener('keydown', onShortcut))
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

    <div class="board-tools">
      <div class="board-search">
        <AppIcon
          name="search"
          :size="16"
        />
        <input
          id="board-search"
          ref="searchInput"
          v-model="query"
          type="search"
          aria-label="Search cards"
          placeholder="Search cards…"
          autocomplete="off"
        >
        <kbd>/</kbd>
        <button
          v-if="query"
          class="search-clear"
          type="button"
          aria-label="Clear card search"
          @click="query = ''"
        >
          <AppIcon
            name="clear"
            :size="14"
          />
        </button>
      </div>
      <div class="label-filter-wrap">
        <button
          class="filter-trigger"
          :class="{ 'is-active': selectedLabelIds.length > 0 }"
          type="button"
          :aria-expanded="labelFilterOpen"
          aria-controls="label-filter-menu"
          @click="labelFilterOpen = !labelFilterOpen"
        >
          <AppIcon
            name="filter"
            :size="15"
          />
          Labels
          <span
            v-if="selectedLabelIds.length"
            class="filter-count"
          >{{ selectedLabelIds.length }}</span>
        </button>
        <div
          v-if="labelFilterOpen"
          id="label-filter-menu"
          class="label-filter-menu"
        >
          <div class="filter-menu-heading">
            <span>Filter by labels</span>
            <button
              v-if="selectedLabelIds.length"
              class="filter-clear"
              type="button"
              @click="selectedLabelIds = []"
            >
              Clear
            </button>
          </div>
          <button
            v-for="label in store.labels"
            :key="label.id"
            class="filter-label-option"
            :aria-pressed="selectedLabelIds.includes(label.id)"
            type="button"
            @click="toggleLabelFilter(label.id)"
          >
            <span
              class="filter-label-swatch"
              :style="{ backgroundColor: label.color }"
            />
            {{ label.name }}
            <span
              v-if="selectedLabelIds.includes(label.id)"
              class="filter-check"
            >✓</span>
          </button>
          <p
            v-if="!store.labels.length"
            class="filter-empty"
          >
            No labels available.
          </p>
        </div>
      </div>
      <button
        v-if="hasActiveFilters"
        class="clear-filters-button"
        type="button"
        @click="clearFilters"
      >
        Clear filters
      </button>
      <span class="search-results-count">
        {{ matchingCardCount }} {{ matchingCardCount === 1 ? 'card' : 'cards' }}
      </span>
    </div>

    <div class="kanban-scroll-hint">
      <span /> Drag lists to reorder <span />
      <span class="shortcut-hint">Press N in a list to add a card</span>
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
          :ref="(instance) => setListColumnRef(list.id, instance as InstanceType<typeof ListColumn> | null)"
          :list="list"
          :cards="store.cardsForList(list.id)"
          :labels="store.labels"
          :dragging-card-id="draggingCardId"
          :search-query="query"
          :active-label-ids="selectedLabelIds"
          :visible-card-ids="visibleCards(list.id).map((card) => card.id)"
          @focus-list="focusedListId = $event"
          @blur-list="(listId) => { if (focusedListId === listId) focusedListId = null }"
          @rename="({ listId, title }) => store.renameList(listId, title)"
          @delete="deleteList"
          @create-card="createCard"
          @move-card="moveCard"
          @card-drag-start="handleCardDragStart"
          @card-drag-end="handleCardDragEnd"
          @open-card="openCard"
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
    <CardDetailModal
      :card-id="selectedCardId"
      @close="selectedCardId = null"
      @delete="deleteCard"
    />
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
