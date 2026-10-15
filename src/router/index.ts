import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/boards/:boardId',
      name: 'board',
      component: () => import('../views/BoardView.vue'),
    },
  ],
})

export default router
