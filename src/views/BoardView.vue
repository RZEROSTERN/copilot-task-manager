<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from '../components/ui/AppIcon.vue'
import { useBoardStore } from '../stores/board'
import type { Board } from '../types'

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
</script>

<template>
  <section
    v-if="board"
    class="board-overview"
  >
    <div class="board-overview-heading">
      <div>
        <p class="eyebrow">
          Board
        </p>
        <h2>{{ board.title }}</h2>
        <p class="boards-subtitle">
          Your project at a glance.
        </p>
      </div>
      <span class="board-overview-badge">
        <span :style="{ backgroundColor: board.color }" />
        {{ lists.length }} {{ lists.length === 1 ? 'list' : 'lists' }}
      </span>
    </div>

    <div
      v-if="lists.length"
      class="board-preview-grid"
    >
      <article
        v-for="list in lists"
        :key="list.id"
        class="board-preview-list"
      >
        <div class="preview-list-header">
          <span class="preview-list-dot" />
          <h3>{{ list.title }}</h3>
          <span class="preview-list-count">{{ store.cardsForList(list.id).length }}</span>
        </div>
        <p
          v-if="store.cardsForList(list.id).length"
          class="preview-card-names"
        >
          {{ store.cardsForList(list.id).slice(0, 3).map((card) => card.title).join(' · ') }}
        </p>
        <p
          v-else
          class="preview-empty"
        >
          No cards yet
        </p>
      </article>
    </div>

    <div
      v-else
      class="board-empty-lists"
    >
      <div class="empty-state-icon">
        <AppIcon
          name="grid"
          :size="24"
        />
      </div>
      <h3>This board is ready for lists</h3>
      <p>Lists and cards can be added as you plan your work.</p>
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
