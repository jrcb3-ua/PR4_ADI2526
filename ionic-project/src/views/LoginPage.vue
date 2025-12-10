<script setup lang="ts">
    import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
    import { IonItem, IonInput, IonButton, toastController } from '@ionic/vue';
    import { ref } from 'vue';
    import {login} from '@/backend/services/authService'
    import {useRouter} from "vue-router"

    const router = useRouter()
    const email = ref("")
    const password = ref("")
    async function handleLogin() {
      try {
        console.log("Datos", email.value, password.value)
        await login(email.value, password.value)
        router.push('/lista-compra')
      }
      catch {
        const toast = await toastController.create({
                message: "Email y/o contraseña incorrectos",
                duration: 2000,
                color: 'danger'
                })
            toast.present()
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
