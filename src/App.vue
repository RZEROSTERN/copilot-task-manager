<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import AppHeader from './components/ui/AppHeader.vue'
import AppSidebar from './components/ui/AppSidebar.vue'
import BoardDialog from './components/ui/BoardDialog.vue'
import { useTheme } from './composables/useTheme'
import { usePwa } from './composables/usePwa'
import { useBoardStore } from './stores/board'
import type { Board } from './types'

const boardStore = useBoardStore()
const { isDark, toggleTheme } = useTheme()
const { isOffline, canInstall, installApp } = usePwa()
const sidebarCollapsed = ref(false)
const boardDialogOpen = ref(false)
const renameTarget = ref<Board | null>(null)
const activeBoard = computed(() => boardStore.activeBoard)
const router = useRouter()

function toggleSidebar(): void {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

function openNewBoard(): void {
  renameTarget.value = null
  boardDialogOpen.value = true
}

function openRenameBoard(board: Board): void {
  renameTarget.value = board
  boardDialogOpen.value = true
}

function saveBoard(payload: { title: string; color: string }): void {
  if (renameTarget.value) {
    boardStore.updateBoard(renameTarget.value.id, payload)
  } else {
    const board = boardStore.createBoard(payload.title, payload.color)
    boardStore.setActiveBoard(board.id)
    void router.push({ name: 'board', params: { boardId: board.id } })
  }
  boardDialogOpen.value = false
  renameTarget.value = null
}

function deleteBoard(board: Board): void {
  const confirmed = window.confirm(
    `Delete "${board.title}" and all of its lists and cards? This cannot be undone.`,
  )
  if (!confirmed) return
  const wasActive = board.id === boardStore.activeBoardId
  boardStore.deleteBoard(board.id)
  if (wasActive) {
    const fallback = boardStore.boards[0]
    if (fallback) {
      boardStore.setActiveBoard(fallback.id)
      void router.push({ name: 'board', params: { boardId: fallback.id } })
    } else {
      void router.push({ name: 'home' })
    }
  }
}

function selectBoard(boardId: string): void {
  boardStore.setActiveBoard(boardId)
  void router.push({ name: 'board', params: { boardId } })
}
</script>

<template>
  <div class="app-shell">
    <AppSidebar
      :boards="boardStore.boards"
      :active-board-id="boardStore.activeBoardId"
      :collapsed="sidebarCollapsed"
      @select-board="selectBoard"
      @new-board="openNewBoard"
      @toggle-collapsed="toggleSidebar"
    />
    <div class="main-panel">
      <AppHeader
        :title="activeBoard?.title ?? 'Your workspace'"
        :is-dark="isDark"
        :is-offline="isOffline"
        :can-install="canInstall"
        @toggle-sidebar="toggleSidebar"
        @toggle-theme="toggleTheme"
        @install-app="installApp"
      />
      <main class="main-content">
        <RouterView
          :boards="boardStore.boards"
          :active-board-id="boardStore.activeBoardId"
          @create="openNewBoard"
          @rename="openRenameBoard"
          @delete="deleteBoard"
          @select="(board: Board) => selectBoard(board.id)"
        />
      </main>
    </div>
    <BoardDialog
      :open="boardDialogOpen"
      :mode="renameTarget ? 'rename' : 'create'"
      :initial-title="renameTarget?.title"
      :initial-color="renameTarget?.color"
      @save="saveBoard"
      @close="boardDialogOpen = false"
    />
  </div>
</template>
