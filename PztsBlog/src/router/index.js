import Register from '@/views/login/register.vue'
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
    {
      path: '/article/:id',
      name: 'article',
      component: () => import('@/views/Article/index.vue')
    },
    {
      path: '/user',
      name: 'user',
      component: () => import('@/views/User/index.vue')
    },
    {
      path: '/publish',
      name: 'publish',
      component: () => import('@/views/Publish/index.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/login/login.vue')
    },
    {
      path:'/register',
      name:'register',
      component: () => import('@/views/login/register.vue')
    }
  ],
  scrollBehavior() {
    return { left: 0, top: 0 }
  },
})

export default router