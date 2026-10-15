<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from './components/ui/AppHeader.vue'
import AppSidebar from './components/ui/AppSidebar.vue'
import { useTheme } from './composables/useTheme'
import { useBoardStore } from './stores/board'

const boardStore = useBoardStore()
const { isDark, toggleTheme } = useTheme()
const sidebarCollapsed = ref(false)
const activeBoard = computed(() => boardStore.activeBoard)

function toggleSidebar(): void {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

function createBoard(): void {
  const title = window.prompt('Name your new board')
  if (!title?.trim()) return
  const board = boardStore.createBoard(title)
  boardStore.setActiveBoard(board.id)
}
</script>

<template>
  <div class="app-shell">
    <AppSidebar
      :boards="boardStore.boards"
      :active-board-id="boardStore.activeBoardId"
      :collapsed="sidebarCollapsed"
      @select-board="boardStore.setActiveBoard"
      @new-board="createBoard"
      @toggle-collapsed="toggleSidebar"
    />
    <div class="main-panel">
      <AppHeader
        :title="activeBoard?.title ?? 'Your workspace'"
        :is-dark="isDark"
        @toggle-sidebar="toggleSidebar"
        @toggle-theme="toggleTheme"
      />
      <main class="main-content">
        <RouterView :board-count="boardStore.boards.length" />
      </main>
    </div>
  </div>
</template>
