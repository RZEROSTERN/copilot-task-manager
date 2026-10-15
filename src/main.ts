import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { useBoardStore } from './stores/board'
import './style.css'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

useBoardStore(pinia)

createApp(App).use(pinia).use(router).mount('#app')
