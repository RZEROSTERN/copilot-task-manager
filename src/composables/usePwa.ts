import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export function usePwa() {
  const isOffline = ref(!navigator.onLine)
  const isInstalled = ref(false)
  const installPrompt = shallowRef<InstallPromptEvent | null>(null)
  const canInstall = computed(() => installPrompt.value !== null && !isInstalled.value)

  function updateOnlineStatus(): void {
    isOffline.value = !navigator.onLine
  }

  function captureInstallPrompt(event: Event): void {
    event.preventDefault()
    installPrompt.value = event as InstallPromptEvent
  }

  function markInstalled(): void {
    isInstalled.value = true
    installPrompt.value = null
  }

  onMounted(() => {
    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)
    window.addEventListener('beforeinstallprompt', captureInstallPrompt)
    window.addEventListener('appinstalled', markInstalled)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('online', updateOnlineStatus)
    window.removeEventListener('offline', updateOnlineStatus)
    window.removeEventListener('beforeinstallprompt', captureInstallPrompt)
    window.removeEventListener('appinstalled', markInstalled)
  })

  async function installApp(): Promise<void> {
    const prompt = installPrompt.value
    if (!prompt) return

    try {
      await prompt.prompt()
      await prompt.userChoice
    } catch (error) {
      console.error('Unable to open the app installation prompt.', error)
    }
    installPrompt.value = null
  }

  return { isOffline, canInstall, installApp }
}
