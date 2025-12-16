<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '@/stores/appStore';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon,
  IonPopover, IonContent, IonList, IonItem, IonLabel, IonAvatar
} from '@ionic/vue';
import {
  personCircleOutline, logOutOutline, restaurantOutline,
  homeOutline, lockClosedOutline, ellipsisVertical, logInOutline
} from 'ionicons/icons';

const router = useRouter();
const store = useAppStore();

// Estado para controlar el menú desplegable
const popoverOpen = ref(false);
const event = ref(null);

const setOpen = (e, state) => {
  event.value = e;
  popoverOpen.value = state;
};

const handleLogout = async () => {
  await store.logout();
  popoverOpen.value = false;
  router.push('/login');
};

const irA = (ruta) => {
  popoverOpen.value = false;
  router.push(ruta);
};
</script>

<template>
  <ion-header class="ion-no-border">
    <ion-toolbar color="primary">
      <ion-title slot="start" @click="router.push('/')" style="cursor: pointer">
        Recetario
      </ion-title>

      <ion-buttons slot="end">

        <ion-button @click="router.push('/recetas')">
          <ion-icon slot="icon-only" :icon="restaurantOutline"></ion-icon>
        </ion-button>

        <ion-button v-if="!store.isAuthenticated" @click="router.push('/login')">
          Login
          <ion-icon slot="end" :icon="logInOutline"></ion-icon>
        </ion-button>

        <ion-button v-else @click="setOpen($event, true)">
          <ion-icon slot="icon-only" :icon="ellipsisVertical"></ion-icon>
        </ion-button>
      </ion-buttons>

      <ion-popover :is-open="popoverOpen" :event="event" @didDismiss="setOpen(null, false)">
        <ion-content class="ion-padding-vertical">
          <ion-list lines="none">

            <ion-item button @click="irA('/')">
              <ion-icon slot="start" :icon="homeOutline"></ion-icon>
              <ion-label>Inicio</ion-label>
            </ion-item>

            <ion-item button @click="irA('/perfil')">
              <ion-icon slot="start" :icon="personCircleOutline"></ion-icon>
              <ion-label>Mi Perfil</ion-label>
            </ion-item>

            <ion-item button v-if="store.user?.admin" @click="irA('/admin')">
              <ion-icon slot="start" :icon="lockClosedOutline" color="warning"></ion-icon>
              <ion-label>Admin Panel</ion-label>
            </ion-item>

            <ion-item lines="full"></ion-item> <ion-item button @click="handleLogout" detail="false">
              <ion-icon slot="start" :icon="logOutOutline" color="danger"></ion-icon>
              <ion-label color="danger">Cerrar Sesión</ion-label>
            </ion-item>

          </ion-list>
        </ion-content>
      </ion-popover>

    </ion-toolbar>
  </ion-header>
</template>

<style scoped>
/* Un poco de sombra suave para diferenciar el header */
ion-header {
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
</style>