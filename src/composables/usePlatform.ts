import { computed } from 'vue'

export type Platform = 'web' | 'desktop'

export interface WindowControls {
  minimize(): Promise<void>
  toggleMaximize(): Promise<void>
  close(): Promise<void>
}

export interface PlatformAdapter {
  platform: Platform
  windowControls: WindowControls | null
  openExternal(url: string): Promise<void>
}

interface DesktopBridge {
  minimize(): Promise<void>
  toggleMaximize(): Promise<void>
  close(): Promise<void>
  openExternal(url: string): Promise<void>
}

declare global {
  interface Window {
    __TAURI_INTERNALS__?: DesktopBridge
  }
}

const adapter: PlatformAdapter = {
  get platform() {
    return typeof window !== 'undefined' && window.__TAURI_INTERNALS__ !== undefined
      ? 'desktop'
      : 'web'
  },
  get windowControls() {
    const bridge = typeof window !== 'undefined' ? window.__TAURI_INTERNALS__ : undefined
    if (!bridge) return null
    return {
      minimize: () => bridge.minimize(),
      toggleMaximize: () => bridge.toggleMaximize(),
      close: () => bridge.close(),
    }
  },
  async openExternal(url: string): Promise<void> {
    const destination = new URL(url)
    if (destination.protocol !== 'https:' && destination.protocol !== 'http:') {
      throw new Error('Only HTTP and HTTPS external links are supported.')
    }
    const bridge = typeof window !== 'undefined' ? window.__TAURI_INTERNALS__ : undefined
    if (bridge) {
      await bridge.openExternal(destination.toString())
      return
    }
    window.open(destination.toString(), '_blank', 'noopener,noreferrer')
  },
}

export function usePlatform() {
  const platform = computed(() => adapter.platform)
  const isDesktop = computed(() => platform.value === 'desktop')

  return {
    platform,
    isDesktop,
    windowControls: adapter.windowControls,
    openExternal: adapter.openExternal,
  }
}
