import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { isTauri } from '@tauri-apps/api/core'
import type { Window as TauriWindow } from '@tauri-apps/api/window'

export type Platform = 'web' | 'desktop'

export interface WindowControls {
  minimize(): Promise<void>
  toggleMaximize(): Promise<void>
  close(): Promise<void>
}

export function usePlatform() {
  const isDesktop = ref(false)
  const isMaximized = ref(false)
  const currentWindow = shallowRef<TauriWindow | null>(null)
  const hasWindowControls = computed(() => isDesktop.value && currentWindow.value !== null)
  let unlistenResize: (() => void) | undefined

  async function refreshMaximizedState(): Promise<void> {
    const window = currentWindow.value
    if (!window) return
    try {
      isMaximized.value = await window.isMaximized()
    } catch (error) {
      console.error('Unable to read desktop window state.', error)
    }
  }

  onMounted(async () => {
    isDesktop.value = isTauri()
    if (!isDesktop.value) return

    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window')
      currentWindow.value = getCurrentWindow()
      await refreshMaximizedState()
      unlistenResize = await currentWindow.value.onResized(refreshMaximizedState)
    } catch (error) {
      console.error('Unable to initialize desktop window controls.', error)
    }
  })

  onBeforeUnmount(() => unlistenResize?.())

  async function runWindowAction(action: (window: TauriWindow) => Promise<unknown>): Promise<void> {
    const window = currentWindow.value
    if (!window) return
    try {
      await action(window)
      await refreshMaximizedState()
    } catch (error) {
      console.error('Unable to perform desktop window action.', error)
    }
  }

  async function openExternal(url: string): Promise<void> {
    const destination = new URL(url)
    if (destination.protocol !== 'https:' && destination.protocol !== 'http:') {
      throw new Error('Only HTTP and HTTPS external links are supported.')
    }

    if (isDesktop.value) {
      const { openUrl } = await import('@tauri-apps/plugin-opener')
      await openUrl(destination.toString())
      return
    }
    window.open(destination.toString(), '_blank', 'noopener,noreferrer')
  }

  const platform = computed<Platform>(() => (isDesktop.value ? 'desktop' : 'web'))
  const windowControls: WindowControls = {
    minimize: () => runWindowAction((window) => window.minimize()),
    toggleMaximize: () => runWindowAction((window) => window.toggleMaximize()),
    close: () => runWindowAction((window) => window.close()),
  }

  return {
    platform,
    isDesktop,
    isMaximized,
    hasWindowControls,
    windowControls,
    openExternal,
  }
}
