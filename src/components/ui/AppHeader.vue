<script setup lang="ts">
import AppIcon from './AppIcon.vue'

defineProps<{
  title: string
  isDark: boolean
  isOffline: boolean
  canInstall: boolean
}>()

const emit = defineEmits<{
  toggleSidebar: []
  toggleTheme: []
  installApp: []
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
      <span
        v-if="isOffline"
        class="offline-indicator"
        role="status"
        aria-live="polite"
      >
        Offline
      </span>
      <span class="saved-indicator"><span /> Saved</span>
      <button
        v-if="canInstall"
        class="install-app-button"
        type="button"
        @click="emit('installApp')"
      >
        <AppIcon
          name="download"
          :size="15"
        />
        Install
      </button>
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
