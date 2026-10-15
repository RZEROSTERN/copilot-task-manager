<script setup lang="ts">
import AppIcon from './AppIcon.vue'

defineProps<{
  title: string
  isDark: boolean
  isOffline: boolean
  canInstall: boolean
  isDesktop: boolean
  isMaximized: boolean
  hasWindowControls: boolean
}>()

const emit = defineEmits<{
  toggleSidebar: []
  toggleTheme: []
  installApp: []
  minimizeWindow: []
  toggleMaximizeWindow: []
  closeWindow: []
}>()
</script>

<template>
  <header
    class="app-header"
    :class="{ 'desktop-app-header': isDesktop }"
  >
    <button
      class="icon-button mobile-sidebar-toggle"
      type="button"
      aria-label="Toggle sidebar"
      @click="emit('toggleSidebar')"
    >
      <AppIcon name="panel" />
    </button>
    <div
      class="header-title-group"
      :class="{ 'desktop-title-drag': isDesktop }"
      :data-tauri-drag-region="isDesktop ? '' : undefined"
    >
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
        v-if="isDesktop && hasWindowControls"
        class="window-controls"
      >
        <button
          class="window-control-button"
          type="button"
          aria-label="Minimize window"
          title="Minimize"
          @click="emit('minimizeWindow')"
        >
          <AppIcon
            name="window-minimize"
            :size="14"
          />
        </button>
        <button
          class="window-control-button"
          type="button"
          :aria-label="isMaximized ? 'Restore window' : 'Maximize window'"
          :title="isMaximized ? 'Restore' : 'Maximize'"
          @click="emit('toggleMaximizeWindow')"
        >
          <AppIcon
            :name="isMaximized ? 'window-restore' : 'window-maximize'"
            :size="13"
          />
        </button>
        <button
          class="window-control-button window-close-button"
          type="button"
          aria-label="Close window"
          title="Close"
          @click="emit('closeWindow')"
        >
          <AppIcon
            name="close"
            :size="14"
          />
        </button>
      </div>
      <div
        class="user-avatar"
        aria-label="Your profile"
      >
        M
      </div>
    </div>
  </header>
</template>
