<script setup>
import { ref } from 'vue'
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
  IonList,
  IonItem,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonText,
  IonLabel
} from '@ionic/vue'
import {
  createOutline,
  imageOutline,
  listOutline,
  restaurantOutline,
  pricetagOutline
} from 'ionicons/icons'

const router = useRouter()
const store = useAppStore()

const form = ref({
  titulo: '',
  descripcion: '',
  ingredientes: '',
  preparacion: '',
  categoria: '',
  image: ''
})

const categorias = ref([
  'carne', 'pescado', 'vegetariano', 'vegano',
  'postre', 'ensalada', 'sopa', 'pasta', 'arroz', 'otros'
])

const isLoading = ref(false)
const error = ref('')

async function handleSubmit() {
  if (!form.value.titulo.trim()) {
    error.value = 'El título es obligatorio'
    return
  }

  if (!form.value.ingredientes.trim()) {
    error.value = 'Los ingredientes son obligatorios'
    return
  }

  if (!store.isAuthenticated) {
    error.value = 'Debes iniciar sesión para crear una receta'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    await store.addReceta({
      titulo: form.value.titulo,
      descripcion: form.value.descripcion,
      ingredientes: form.value.ingredientes,
      preparacion: form.value.preparacion,
      categoria: form.value.categoria,
      image: form.value.image
    })

    // Feedback visual simple y redirección
    router.push('/perfil')
  } catch (err) {
    console.error('Error creando receta:', err)
    error.value = store.error || 'Error al crear la receta.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/perfil" text=""></ion-back-button>
        </ion-buttons>
        <ion-title>Nueva Receta</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">

      <div class="form-container animate-fade-in">

        <div class="ion-text-center ion-margin-bottom">
          <h1 class="page-title">Comparte tu plato</h1>
          <p class="page-subtitle">Rellena los detalles de tu nueva creación</p>
        </div>

        <div v-if="error" class="error-box">
          <ion-text color="danger">
            <p>{{ error }}</p>
          </ion-text>
        </div>

        <form @submit.prevent="handleSubmit">
          <ion-list lines="none">

            <ion-item class="custom-input ion-margin-bottom">
              <ion-icon slot="start" :icon="createOutline" color="primary"></ion-icon>
              <ion-input
                label="Título de la receta *"
                label-placement="floating"
                v-model="form.titulo"
                required
                placeholder="Ej: Tortilla de patatas"
                :disabled="isLoading"
              ></ion-input>
            </ion-item>

            <ion-item class="custom-input ion-margin-bottom">
              <ion-icon slot="start" :icon="imageOutline" color="primary"></ion-icon>
              <ion-input
                label="URL de la imagen"
                label-placement="floating"
                v-model="form.image"
                type="url"
                placeholder="https://ejemplo.com/foto.jpg"
                :disabled="isLoading"
              ></ion-input>
            </ion-item>

            <ion-item class="custom-input ion-margin-bottom">
              <ion-icon slot="start" :icon="pricetagOutline" color="primary"></ion-icon>
              <ion-select
                label="Categoría"
                label-placement="floating"
                v-model="form.categoria"
                placeholder="Selecciona una"
                interface="action-sheet"
              >
                <ion-select-option v-for="cat in categorias" :key="cat" :value="cat">
                  {{ cat.charAt(0).toUpperCase() + cat.slice(1) }}
                </ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item class="custom-input ion-margin-bottom">
              <ion-icon slot="start" :icon="listOutline" color="primary"></ion-icon>
              <ion-textarea
                label="Descripción breve"
                label-placement="floating"
                v-model="form.descripcion"
                rows="3"
                :auto-grow="true"
                placeholder="Describe tu plato en pocas palabras..."
                :disabled="isLoading"
              ></ion-textarea>
            </ion-item>

            <ion-item class="custom-input ion-margin-bottom">
              <ion-icon slot="start" :icon="restaurantOutline" color="primary"></ion-icon>
              <ion-textarea
                label="Ingredientes *"
                label-placement="floating"
                v-model="form.ingredientes"
                rows="5"
                required
                :auto-grow="true"
                placeholder="Lista los ingredientes separados por comas..."
                :disabled="isLoading"
              ></ion-textarea>
            </ion-item>
            <div class="helper-text">Separa cada ingrediente con una coma</div>

            <ion-item class="custom-input ion-margin-bottom">
              <ion-textarea
                label="Pasos de Preparación"
                label-placement="floating"
                v-model="form.preparacion"
                rows="8"
                :auto-grow="true"
                placeholder="Explica paso a paso cómo cocinarlo..."
                :disabled="isLoading"
              ></ion-textarea>
            </ion-item>

          </ion-list>

          <div class="ion-padding-top">
            <ion-button
              expand="block"
              type="submit"
              class="submit-btn"
              :disabled="isLoading"
            >
              {{ isLoading ? 'Publicando...' : 'Crear Receta' }}
            </ion-button>
          </div>
        </form>

      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.page-title {
  font-weight: 700;
  color: var(--ion-text-color);
  margin-bottom: 5px;
}

.page-subtitle {
  color: var(--ion-color-medium);
  margin-top: 0;
}

.custom-input {
  --background: #f4f5f8;
  --border-radius: 12px;
  --padding-start: 10px;
}

.helper-text {
  font-size: 0.8rem;
  color: var(--ion-color-medium);
  margin: -10px 0 15px 15px; /* Ajuste visual debajo del input */
}

.error-box {
  background: rgba(var(--ion-color-danger-rgb), 0.1);
  border: 1px solid var(--ion-color-danger);
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 20px;
  text-align: center;
}

.submit-btn {
  height: 50px;
  font-weight: 600;
  font-size: 1.1rem;
  --border-radius: 12px;
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>