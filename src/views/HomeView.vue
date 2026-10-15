<script setup lang="ts">
import type { Board } from '../types'
import AppIcon from '../components/ui/AppIcon.vue'

defineProps<{
  boards: Board[]
  activeBoardId: string | null
}>()

const emit = defineEmits<{
  create: []
  rename: [board: Board]
  delete: [board: Board]
  select: [board: Board]
}>()
</script>

<template>
  <div class="boards-home">
    <div class="boards-heading">
      <div>
        <p class="eyebrow">
          Workspace
        </p>
        <h2>Your boards</h2>
        <p class="boards-subtitle">
          A home for everything you’re working on.
        </p>
      </div>
      <button
        class="primary-button"
        type="button"
        @click="emit('create')"
      >
        <AppIcon
          name="plus"
          :size="17"
        />
        <span>New board</span>
      </button>
    </div>

    <div
      v-if="boards.length"
      class="board-grid"
    >
      <article
        v-for="board in boards"
        :key="board.id"
        class="board-card"
        :class="{ 'is-current': board.id === activeBoardId }"
      >
        <button
          class="board-card-main"
          type="button"
          @click="emit('select', board)"
        >
          <span
            class="board-card-art"
            :style="{ '--board-color': board.color }"
          >
            <span class="art-column art-column-one"><i /><i /><i /></span>
            <span class="art-column art-column-two"><i /><i /></span>
            <span class="art-column art-column-three"><i /><i /><i /></span>
          </span>
          <span class="board-card-details">
            <span class="board-card-title">{{ board.title }}</span>
            <span class="board-card-caption">
              {{ board.id === activeBoardId ? 'Currently open' : 'Open board' }}
            </span>
          </span>
        </button>
        <div class="board-card-actions">
          <span
            class="board-card-color"
            :style="{ backgroundColor: board.color }"
          />
          <button
            class="icon-button board-action"
            type="button"
            :aria-label="`Rename ${board.title}`"
            @click="emit('rename', board)"
          >
            <span aria-hidden="true">✎</span>
          </button>
          <button
            class="icon-button board-action danger-action"
            type="button"
            :aria-label="`Delete ${board.title}`"
            @click="emit('delete', board)"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      </article>

      <button
        class="board-create-card"
        type="button"
        @click="emit('create')"
      >
        <span class="create-card-icon"><AppIcon name="plus" /></span>
        <span>Create a board</span>
      </button>
    </div>

    <div
      v-else
      class="boards-empty-state"
    >
      <div class="empty-state-icon">
        <AppIcon
          name="grid"
          :size="24"
        />
      </div>
      <h3>Start with a board</h3>
      <p>Create a board to organize a project, plan a launch, or keep track of everyday tasks.</p>
      <button
        class="primary-button"
        type="button"
        @click="emit('create')"
      >
        <AppIcon
          name="plus"
          :size="17"
        />
        <span>Create your first board</span>
      </button>
    </div>
  </div>
</template>
