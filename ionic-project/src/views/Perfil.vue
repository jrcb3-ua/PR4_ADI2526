<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonGrid,
  IonRow,
  IonCol,
  IonSearchbar,
  IonAvatar,
  IonText,
  IonBadge
} from '@ionic/vue'
import {
  createOutline,
  trashOutline,
  saveOutline,
  closeOutline,
  arrowBackOutline,
  personOutline,
  mailOutline,
  addCircleOutline,
  logOutOutline,
  alertCircleOutline
} from 'ionicons/icons'

import SiteHeader from '@/components/SiteHeader.vue'
import SiteFooter from '@/components/SiteFooter.vue'

const router = useRouter()
const store = useAppStore()

const showRecipes = ref(false)
const searchTerm = ref('')
const editingRecipe = ref(null)
const editingProfile = ref(false)

const editForm = ref({
  titulo: '',
  descripcion: '',
  ingredientes: '',
  preparacion: ''
})

const profileForm = ref({
  name: '',
  email: ''
})

onMounted(async () => {
  await loadUserRecipes()
  if (store.user) {
    profileForm.value.name = store.user.name || ''
    profileForm.value.email = store.user.email || ''
  }
})

function showUserRecipes() {
  showRecipes.value = true
}

function showUserData() {
  showRecipes.value = false
}

async function loadUserRecipes() {
  try {
    if (!store.isAuthenticated) return
    if (store.recetas.length === 0) {
      await store.loadRecetas()
    }
    // No asignamos a una ref local, usamos el computed directamente
  } catch (error) {
    console.error("Error cargando recetas:", error)
  }
}

const recetas = computed(() => store.recetasDelUsuario)

const filteredRecetas = computed(() => {
  if (!searchTerm.value?.trim()) return recetas.value
  const term = searchTerm.value.toLowerCase()

  return recetas.value.filter(r =>
    r.titulo?.toLowerCase().includes(term) ||
    r.descripcion?.toLowerCase().includes(term)
  )
})

async function handleDeleteReceta(id) {
  // Usamos confirm nativo del navegador, en ionic se podría usar alertController
  if (confirm("¿Estás seguro de que quieres eliminar esta receta?")) {
    await store.deleteReceta(id)
  }
}

function startEdit(receta) {
  editingRecipe.value = receta.id
  editForm.value = { ...receta }
}

function cancelEdit() {
  editingRecipe.value = null
  editForm.value = { titulo: '', descripcion: '', ingredientes: '', preparacion: '' }
}

async function saveEdit() {
  try {
    await store.updateReceta(editingRecipe.value, {
      titulo: editForm.value.titulo,
      descripcion: editForm.value.descripcion,
      ingredientes: editForm.value.ingredientes,
      preparacion: editForm.value.preparacion
    })
    cancelEdit()
  } catch (error) {
    console.error("Error actualizando receta:", error)
    alert("Error al actualizar la receta")
  }
}

function startEditProfile() {
  editingProfile.value = true
  profileForm.value.name = store.user?.name || ''
  profileForm.value.email = store.user?.email || ''
}

function cancelEditProfile() {
  editingProfile.value = false
  profileForm.value.name = store.user?.name || ''
  profileForm.value.email = store.user?.email || ''
}

async function saveProfile() {
  try {
    if (!store.user) return
    await store.updateProfile(profileForm.value)
    editingProfile.value = false
  } catch (error) {
    console.error("Error actualizando perfil:", error)
    alert("Error al actualizar el perfil")
  }
}

async function handleDeleteAccount() {
  const confirmDelete = confirm(
    "⚠️ ¿Estás SEGURO de eliminar tu cuenta?\nSe borrarán todas tus recetas permanentemente."
  )

  if (confirmDelete) {
    try {
      await store.deleteAccount()
      router.push('/')
    } catch (error) {
      console.error("Error eliminando cuenta:", error)
      alert("Error al eliminar la cuenta")
    }
  }
}

function goToNewRecipe() {
  router.push('/nueva-receta')
}
</script>

<template>
  <ion-page>
    <SiteHeader />

    <ion-content :fullscreen="true" class="ion-padding">

      <div v-if="!showRecipes" class="animate-fade-in">

        <div class="ion-text-center ion-margin-bottom">
          <ion-avatar class="profile-avatar">
            <img src="https://ionicframework.com/docs/img/demos/avatar.svg" alt="Avatar" />
          </ion-avatar>
          <h1 class="welcome-title">Hola, {{ store.user?.name || 'Usuario' }}</h1>
        </div>

        <ion-card>
          <ion-card-header>
            <ion-card-title>Mis Datos</ion-card-title>
          </ion-card-header>

          <ion-card-content>
            <div v-if="editingProfile">
              <ion-item class="ion-margin-bottom">
                <ion-label position="stacked">Nombre</ion-label>
                <ion-input v-model="profileForm.name" placeholder="Tu nombre"></ion-input>
                <ion-icon slot="start" :icon="personOutline"></ion-icon>
              </ion-item>

              <ion-item class="ion-margin-bottom disabled-item">
                <ion-label position="stacked">Email (No editable)</ion-label>
                <ion-input v-model="profileForm.email" readonly></ion-input>
                <ion-icon slot="start" :icon="mailOutline"></ion-icon>
              </ion-item>

              <ion-grid>
                <ion-row>
                  <ion-col>
                    <ion-button expand="block" @click="saveProfile">
                      <ion-icon slot="start" :icon="saveOutline"></ion-icon>
                      Guardar
                    </ion-button>
                  </ion-col>
                  <ion-col>
                    <ion-button expand="block" color="medium" fill="outline" @click="cancelEditProfile">
                      Cancelar
                    </ion-button>
                  </ion-col>
                </ion-row>
              </ion-grid>
            </div>

            <div v-else>
              <ion-item lines="none">
                <ion-icon slot="start" :icon="personOutline" color="primary"></ion-icon>
                <ion-label>
                  <h3>Nombre</h3>
                  <p>{{ store.user?.name || 'Sin nombre' }}</p>
                </ion-label>
              </ion-item>

              <ion-item lines="none">
                <ion-icon slot="start" :icon="mailOutline" color="primary"></ion-icon>
                <ion-label>
                  <h3>Email</h3>
                  <p>{{ store.user?.email }}</p>
                </ion-label>
              </ion-item>

              <div class="ion-padding-top">
                <ion-button expand="block" fill="outline" @click="startEditProfile" class="ion-margin-bottom">
                  <ion-icon slot="start" :icon="createOutline"></ion-icon>
                  Editar Perfil
                </ion-button>

                <ion-button expand="block" @click="showUserRecipes" class="ion-margin-bottom">
                  Ver Mis Recetas ({{ recetas.length }})
                </ion-button>

                <ion-button expand="block" color="danger" fill="clear" @click="handleDeleteAccount">
                  <ion-icon slot="start" :icon="alertCircleOutline"></ion-icon>
                  Eliminar Cuenta
                </ion-button>
              </div>
            </div>
          </ion-card-content>
        </ion-card>
      </div>

      <div v-else class="animate-fade-in">

        <ion-grid>
          <ion-row class="ion-align-items-center">
            <ion-col size="auto">
              <ion-button fill="clear" @click="showUserData">
                <ion-icon slot="icon-only" :icon="arrowBackOutline"></ion-icon>
              </ion-button>
            </ion-col>
            <ion-col>
              <h2 class="ion-no-margin section-title">Gestionar Recetas</h2>
            </ion-col>
          </ion-row>
        </ion-grid>

        <ion-searchbar
          v-model="searchTerm"
          placeholder="Buscar en mis recetas..."
          animated
          class="ion-margin-bottom"
        ></ion-searchbar>

        <ion-button expand="block" class="ion-margin-bottom" @click="goToNewRecipe">
          <ion-icon slot="start" :icon="addCircleOutline"></ion-icon>
          Crear Nueva Receta
        </ion-button>

        <div v-if="filteredRecetas.length === 0" class="ion-text-center ion-padding">
          <ion-text color="medium">
            <p v-if="searchTerm">No hay coincidencias.</p>
            <p v-else>No tienes recetas. ¡Crea la primera!</p>
          </ion-text>
        </div>

        <div v-else>
          <ion-card v-for="receta in filteredRecetas" :key="receta.id" class="recipe-manage-card">

            <div v-if="editingRecipe === receta.id">
              <ion-card-header>
                <ion-card-title>Editando Receta</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-item>
                  <ion-label position="stacked">Título</ion-label>
                  <ion-input v-model="editForm.titulo"></ion-input>
                </ion-item>

                <ion-item>
                  <ion-label position="stacked">Descripción</ion-label>
                  <ion-textarea v-model="editForm.descripcion" rows="3"></ion-textarea>
                </ion-item>

                <ion-item>
                  <ion-label position="stacked">Ingredientes</ion-label>
                  <ion-textarea v-model="editForm.ingredientes" rows="4"></ion-textarea>
                </ion-item>

                <ion-item>
                  <ion-label position="stacked">Preparación</ion-label>
                  <ion-textarea v-model="editForm.preparacion" rows="5"></ion-textarea>
                </ion-item>

                <div class="ion-margin-top ion-text-right">
                   <ion-button color="medium" fill="clear" @click="cancelEdit">Cancelar</ion-button>
                   <ion-button @click="saveEdit">Guardar</ion-button>
                </div>
              </ion-card-content>
            </div>

            <div v-else>
              <ion-card-header>
                <ion-card-title>{{ receta.titulo }}</ion-card-title>
                <ion-badge color="secondary" v-if="receta.categoria">{{ receta.categoria }}</ion-badge>
              </ion-card-header>

              <ion-card-content>
                <p class="desc-preview">{{ receta.descripcion }}</p>

                <ion-grid class="ion-no-padding ion-margin-top">
                  <ion-row>
                    <ion-col>
                      <ion-button expand="block" fill="outline" size="small" @click="startEdit(receta)">
                        <ion-icon slot="start" :icon="createOutline"></ion-icon>
                        Editar
                      </ion-button>
                    </ion-col>
                    <ion-col>
                      <ion-button expand="block" color="danger" fill="outline" size="small" @click="handleDeleteReceta(receta.id)">
                        <ion-icon slot="start" :icon="trashOutline"></ion-icon>
                        Borrar
                      </ion-button>
                    </ion-col>
                  </ion-row>
                  <ion-row>
                    <ion-col>
                      <ion-button expand="block" fill="clear" size="small" :router-link="`/receta/${receta.id}`">
                        Ver detalle completo
                      </ion-button>
                    </ion-col>
                  </ion-row>
                </ion-grid>
              </ion-card-content>
            </div>
          </ion-card>
        </div>

      </div>

    </ion-content>
    <SiteFooter />
  </ion-page>
</template>

<style scoped>
.profile-avatar {
  margin: 0 auto 10px;
  width: 80px;
  height: 80px;
}

.welcome-title {
  font-weight: 700;
  color: var(--ion-text-color);
}

.section-title {
  font-weight: 600;
  font-size: 1.4rem;
}

.disabled-item {
  opacity: 0.7;
}

.desc-preview {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 10px;
  color: var(--ion-color-medium);
}

.recipe-manage-card {
  border-radius: 12px;
  margin-bottom: 15px;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>