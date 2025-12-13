<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from "vue-router";
import { useAppStore } from '@/stores/appStore';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonInput,
  IonButton,
  toastController
} from '@ionic/vue';

// Importamos componentes opcionales si los usas en el template
import SiteHeader from '@/components/SiteHeader.vue'
import SiteFooter from '@/components/SiteFooter.vue'

const router = useRouter();
const store = useAppStore();

const email = ref("");
const password = ref("");

async function handleLogin() {
  // 1. SOLUCIÓN AL ERROR ARIA (Pantalla bloqueada/gris)
  // Quitamos el foco del botón antes de que Ionic intente cambiar de página
  const activeElement = document.activeElement as HTMLElement;
  if (activeElement && activeElement.blur) {
    activeElement.blur();
  }

  try {
    // 2. Usamos el store para hacer login (así se guardan los datos del usuario globalmente)
    await store.login(email.value, password.value);

    // 3. Redirección condicional usando 'replace' (para no poder volver atrás al login)
    if (store.user?.admin) {
      await router.replace('/admin');
    } else {
      await router.replace('/recetas'); // O '/home' según prefieras
    }

  } catch (error) {
    console.error("Error en login:", error);
    const toast = await toastController.create({
      message: "Email y/o contraseña incorrectos",
      duration: 2000,
      color: 'danger',
      position: 'top' // Sale arriba para que se vea mejor
    });
    await toast.present();
  }
}
</script>

<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Login</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <form @submit.prevent="handleLogin">
        <ion-item>
          <ion-input
            v-model="email"
            type="email"
            placeholder="email"
            required
          />
        </ion-item>

        <ion-item class="ion-margin-bottom">
          <ion-input
            v-model="password"
            placeholder="contraseña"
            type="password"
            required
          />
        </ion-item>

        <ion-button
          type="submit"
          expand="block"
          class="ion-margin-top"
        >
          Iniciar Sesión
        </ion-button>
      </form>
    </ion-content>
  </ion-page>
</template>



<style scoped>
#container {
  text-align: center;

  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;

  color: #8c8c8c;

  margin: 0;
}

#container a {
  text-decoration: none;
}
</style>
