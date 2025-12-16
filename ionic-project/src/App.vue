<template>
  <ion-app>
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { onMounted, onUnmounted } from 'vue';
import { useAppStore } from '@/stores/appStore';

const store = useAppStore();

onMounted(async () => {
  console.log("aplicación iniciada: Activando RealtimeGlobal");

  // Aquí activamos la escucha.
  // Ahora, aunque estés en el Perfil o creando una receta,
  // si alguien cambia la base de datos, te saltará la notificación.
  await store.subscribeToRealtime();
});

onUnmounted(() => {
  // Limpieza (buena práctica por si la app se desmonta)
  store.unsubscribeFromRealtime();
});
</script>