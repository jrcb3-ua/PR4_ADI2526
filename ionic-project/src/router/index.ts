import { createRouter, createWebHistory } from '@ionic/vue-router'

import HomeView from '@/views/HomeView.vue'
import Login from '@/views/LoginPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/recetas',
      name: 'recetas',
      component: () => import('@/views/Recetas.vue'),
    },
    {
      path: '/perfil',
      name: 'perfil',
      component: () => import('@/views/Perfil.vue'),
    },
    {
      path: '/registro',
      name: 'registro',
      component: () => import('@/views/Registro.vue'),
    },
    {
      path: '/nueva-receta',
      name: 'nueva-receta',
      component: () => import('@/views/NuevaReceta.vue'),
    },
    {
      path: '/receta/:id',
      name: 'receta-detalle',
      component: () => import('@/views/RecetaDetalle.vue'),
      props: true
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/AdminPanel.vue'),
      meta: { requiresAuth: true }
    }
  ],
})

export default router
