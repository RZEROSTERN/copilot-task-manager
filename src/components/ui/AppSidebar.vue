<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { Board } from '../../types'
import AppIcon from './AppIcon.vue'

const props = defineProps<{
  boards: Board[]
  activeBoardId: string | null
  collapsed: boolean
}>()

const emit = defineEmits<{
  selectBoard: [boardId: string]
  newBoard: []
  toggleCollapsed: []
}>()

const activeBoard = computed(() =>
  props.boards.find((board) => board.id === props.activeBoardId),
)
</script>

<template>
  <aside
    class="app-sidebar"
    :class="{ 'is-collapsed': collapsed }"
  >
    <div class="sidebar-brand">
      <div class="brand-mark">
        <AppIcon
          name="grid"
          :size="19"
        />
      </div>
      <span
        v-if="!collapsed"
        class="brand-name"
      >Taskflow</span>
      <button
        class="icon-button sidebar-collapse"
        type="button"
        :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        @click="emit('toggleCollapsed')"
      >
        <AppIcon name="panel" />
      </button>
    </div>

    <div
      v-if="!collapsed"
      class="workspace-label"
    >
      <span class="workspace-avatar">M</span>
      <span class="workspace-name">My workspace</span>
      <AppIcon
        name="chevron"
        :size="15"
      />
    </div>

    <div class="sidebar-section">
      <div
        v-if="!collapsed"
        class="section-heading"
      >
        <span>Your boards</span>
        <button
          class="icon-button tiny-icon"
          type="button"
          aria-label="Create board"
          @click="emit('newBoard')"
        >
          <AppIcon
            name="plus"
            :size="16"
          />
        </button>
      </div>
      <RouterLink
        v-for="board in boards"
        :key="board.id"
        class="board-nav-item"
        :class="{ 'is-active': board.id === activeBoardId }"
        :to="{ name: 'board', params: { boardId: board.id } }"
        :title="collapsed ? board.title : undefined"
        @click="emit('selectBoard', board.id)"
      >
        <span
          class="board-color"
          :style="{ backgroundColor: board.color }"
        />
        <span
          v-if="!collapsed"
          class="board-nav-title"
        >{{ board.title }}</span>
        <span
          v-if="!collapsed && board.id === activeBoard?.id"
          class="active-indicator"
        />
      </RouterLink>
      <button
        v-if="!collapsed"
        class="new-board-button"
        type="button"
        @click="emit('newBoard')"
      >
        <AppIcon
          name="plus"
          :size="16"
        />
        <span>New board</span>
      </button>
    </div>

    <div
      v-if="!collapsed"
      class="sidebar-footer"
    >
      <span class="footer-dot" />
      <span>All changes saved locally</span>
    </div>
  </aside>
</template>
