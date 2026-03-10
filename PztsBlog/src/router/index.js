import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/portal',
    },
    {
      path: '/portal',
      name: 'portal',
      component: () => import('@/views/portal/index.vue'),
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('@/views/Home/index.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFound.vue'),
    },
  ],
  scrollBehavior() {
    return { left: 0, top: 0 }
  },
})

export default router
