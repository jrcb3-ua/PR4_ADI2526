<template>
  <header class="site-header">
    <img
      src="@/assets/img/logo.png"
      alt="Logo Recetario"
      class="site-header__logo"
    />

    <nav class="site-header__nav">
      <ul>
        <li><RouterLink to="/">Inicio</RouterLink></li>
        <li><RouterLink to="/recetas">Recetas</RouterLink></li>

        <li v-if="store.isAuthenticated">
          <RouterLink to="/perfil">Perfil</RouterLink>
        </li>

        <li v-if="store.user?.admin" class="admin-nav-item">
          <RouterLink to="/admin" class="admin-link">Admin</RouterLink>
        </li>

        <li v-if="store.isAuthenticated">
          <RouterLink to="#" @click.prevent="handleLogout">Logout</RouterLink>
        </li>

        <li v-else>
          <RouterLink to="/login">Login</RouterLink>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script setup>
import { RouterLink, useRouter } from "vue-router";
import { useAppStore } from '@/stores/appStore'

const router = useRouter();
const store = useAppStore();

const handleLogout = () => {
  store.logout();
  router.push('/'); 
};
</script>

<style scoped>
@import "@/assets/css/login.css";
</style>