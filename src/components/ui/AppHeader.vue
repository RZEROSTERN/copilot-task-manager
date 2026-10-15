<script setup lang="ts">
import AppIcon from './AppIcon.vue'

defineProps<{
  title: string
  isDark: boolean
}>()

const emit = defineEmits<{
  toggleSidebar: []
  toggleTheme: []
}>()
</script>

<template>
  <header class="app-header">
    <div class="header-title-group">
      <button
        class="icon-button mobile-sidebar-toggle"
        type="button"
        aria-label="Toggle sidebar"
        @click="emit('toggleSidebar')"
      >
        <AppIcon name="panel" />
      </button>
      <span class="header-context">Workspace</span>
      <AppIcon
        name="chevron"
        class="header-chevron"
        :size="14"
      />
      <h1>{{ title }}</h1>
    </div>
    <div class="header-actions">
      <span class="saved-indicator"><span /> Saved</span>
      <button
        class="icon-button theme-toggle"
        type="button"
        :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        @click="emit('toggleTheme')"
      >
        <AppIcon :name="isDark ? 'sun' : 'moon'" />
      </button>
      <div
        class="user-avatar"
        aria-label="Your profile"
      >
        M
      </div>
    </div>
  </header>
</template>
