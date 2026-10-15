import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { isTauri } from '@tauri-apps/api/core'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { useBoardStore } from './stores/board'
import './style.css'

if (import.meta.env.PROD && !isTauri() && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const appBase = new URL(import.meta.env.BASE_URL, window.location.origin)
    const workerUrl = new URL('service-worker.js', appBase)
    void navigator.serviceWorker.register(workerUrl, { scope: appBase.pathname }).catch((error: unknown) => {
      console.error('Unable to register the offline app worker.', error)
    })
  })
}

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

useBoardStore(pinia)

createApp(App).use(pinia).use(router).mount('#app')
