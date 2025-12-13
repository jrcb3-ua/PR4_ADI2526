<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonItem,
  IonInput,
  IonButton,
  IonText,
  IonIcon,
  IonList,
  IonLabel
} from '@ionic/vue'
import { personAddOutline, personOutline, mailOutline, lockClosedOutline } from 'ionicons/icons'

const router = useRouter()
const store = useAppStore()

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})
const isLoading = ref(false)

async function handleRegister(){
  store.error = null

  if(form.value.password !== form.value.confirmPassword){
    store.error = 'Las contraseñas no coinciden'
    return
  }

  isLoading.value = true

  try {
    await store.register({
      name: form.value.name,
      email: form.value.email,
      password: form.value.password,
      passwordConfirm: form.value.confirmPassword
    })

    alert('Usuario creado correctamente') // En Ionic podrías usar alertController, pero esto funciona
    router.push('/login')
  } catch (error) {
    console.error('Error en registro:', error)
  } finally {
    isLoading.value = false
  }
}

function clearError() {
  store.error = null
}

onMounted(() => {
  if (store.isAuthenticated) {
    // Si ya está logueado, lo mandamos al home
    router.push('/')
  }
})
</script>

<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/login"></ion-back-button>
        </ion-buttons>
        <ion-title>Crear Cuenta</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">

      <div class="register-container">

        <div class="ion-text-center ion-margin-bottom">
          <ion-icon :icon="personAddOutline" class="register-icon" color="primary"></ion-icon>
          <h1 class="ion-no-margin">Regístrate</h1>
          <p class="ion-text-medium">Únete a Recetario hoy</p>
        </div>

        <div v-if="store.error" class="error-box animate-fade-in">
          <ion-text color="danger">
            <p>{{ store.error }}</p>
          </ion-text>
        </div>

        <form @submit.prevent="handleRegister">
          <ion-list lines="none">

            <ion-item class="custom-input ion-margin-bottom">
              <ion-icon slot="start" :icon="personOutline" color="medium"></ion-icon>
              <ion-input
                label="Nombre completo"
                label-placement="floating"
                v-model="form.name"
                @ionInput="clearError"
                required
                type="text"
                :disabled="isLoading"
              ></ion-input>
            </ion-item>

            <ion-item class="custom-input ion-margin-bottom">
              <ion-icon slot="start" :icon="mailOutline" color="medium"></ion-icon>
              <ion-input
                label="Email"
                label-placement="floating"
                v-model="form.email"
                @ionInput="clearError"
                required
                type="email"
                :disabled="isLoading"
              ></ion-input>
            </ion-item>

            <ion-item class="custom-input ion-margin-bottom">
              <ion-icon slot="start" :icon="lockClosedOutline" color="medium"></ion-icon>
              <ion-input
                label="Contraseña"
                label-placement="floating"
                v-model="form.password"
                @ionInput="clearError"
                required
                type="password"
                :disabled="isLoading"
              ></ion-input>
            </ion-item>

            <ion-item class="custom-input ion-margin-bottom">
              <ion-icon slot="start" :icon="lockClosedOutline" color="medium"></ion-icon>
              <ion-input
                label="Repetir contraseña"
                label-placement="floating"
                v-model="form.confirmPassword"
                @ionInput="clearError"
                required
                type="password"
                :disabled="isLoading"
              ></ion-input>
            </ion-item>
          </ion-list>

          <ion-button
            expand="block"
            type="submit"
            class="ion-margin-top submit-btn"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Creando cuenta...' : 'Registrarse' }}
          </ion-button>

        </form>

        <div class="ion-text-center ion-margin-top">
          <ion-text color="medium">
            <p>¿Ya tienes cuenta?</p>
          </ion-text>
          <ion-button fill="clear" router-link="/login" size="small">
            Inicia sesión aquí
          </ion-button>
        </div>

      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.register-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 90%; /* Centrado vertical */
}

.register-icon {
  font-size: 4rem;
  margin-bottom: 10px;
}

.custom-input {
  --background: #f4f5f8;
  --border-radius: 10px;
  --padding-start: 10px;
}

.error-box {
  background-color: rgba(var(--ion-color-danger-rgb), 0.1);
  border: 1px solid var(--ion-color-danger);
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 20px;
  text-align: center;
}

.submit-btn {
  --border-radius: 10px;
  height: 50px;
  font-weight: 600;
  font-size: 1.1rem;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>