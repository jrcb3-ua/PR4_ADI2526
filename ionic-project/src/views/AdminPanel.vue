<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import { useAdminStore } from '@/stores/adminStore'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonText,
  IonBadge,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonButton,
  IonRefresher,
  IonRefresherContent
} from '@ionic/vue'
import {
  peopleOutline,
  shieldCheckmarkOutline,
  personOutline,
  trashOutline,
  keyOutline,
  refreshOutline
} from 'ionicons/icons'

// Importar Footer si lo deseas
import SiteFooter from '@/components/SiteFooter.vue'

const router = useRouter()
const appStore = useAppStore()
const adminStore = useAdminStore()

const isLoading = ref(true)
const error = ref('')

const isAdmin = computed(() => appStore.user?.admin === true)

onMounted(async () => {
  if (!isAdmin.value) {
    router.push('/')
    return
  }
  await loadUsers()
})

async function loadUsers(event = null) {
  try {
    isLoading.value = true
    error.value = ''
    await adminStore.getUsers()
  } catch (err) {
    console.error('Error cargando usuarios:', err)
    error.value = adminStore.error || 'Error al cargar los usuarios'
  } finally {
    isLoading.value = false
    // Si viene de un "Pull to refresh", completarlo
    if (event) event.target.complete()
  }
}

async function handleToggleAdmin(user) {
  // Evitar auto-quitarse permisos
  if (user.id === appStore.user?.id) return

  try {
    if (user.admin) {
      await adminStore.demoteFromAdmin(user.id)
    } else {
      await adminStore.promoteToAdmin(user.id)
    }
  } catch (err) {
    console.error('Error actualizando usuario:', err)
  }
}

async function handleDeleteUser(user) {
  // Evitar auto-borrarse
  if (user.id === appStore.user?.id) return

  if (!confirm(`¿Eliminar a ${user.name}? Esta acción es irreversible.`)) return

  try {
    await adminStore.deleteUser(user.id)
  } catch (err) {
    console.error('Error eliminando usuario:', err)
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('es-ES')
}
</script>

<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar color="dark">
        <ion-buttons slot="start">
          <ion-back-button default-href="/perfil"></ion-back-button>
        </ion-buttons>
        <ion-title>Panel Admin</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="loadUsers()">
            <ion-icon slot="icon-only" :icon="refreshOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content color="light">

      <ion-refresher slot="fixed" @ionRefresh="loadUsers($event)">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>

      <ion-grid class="stats-container">
        <ion-row>
          <ion-col size="4">
            <ion-card class="stat-card">
              <ion-card-content class="ion-text-center">
                <ion-icon :icon="peopleOutline" color="primary" class="stat-icon"></ion-icon>
                <h2>{{ adminStore.totalUsers }}</h2>
                <p>Total</p>
              </ion-card-content>
            </ion-card>
          </ion-col>
          <ion-col size="4">
            <ion-card class="stat-card">
              <ion-card-content class="ion-text-center">
                <ion-icon :icon="shieldCheckmarkOutline" color="success" class="stat-icon"></ion-icon>
                <h2>{{ adminStore.totalAdminUsers }}</h2>
                <p>Admins</p>
              </ion-card-content>
            </ion-card>
          </ion-col>
          <ion-col size="4">
            <ion-card class="stat-card">
              <ion-card-content class="ion-text-center">
                <ion-icon :icon="personOutline" color="medium" class="stat-icon"></ion-icon>
                <h2>{{ adminStore.totalRegularUsers }}</h2>
                <p>Users</p>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>

      <div class="users-section">
        <ion-list-header>
          <ion-label>Gestión de Usuarios</ion-label>
        </ion-list-header>

        <div v-if="error" class="ion-padding ion-text-center">
          <ion-text color="danger">{{ error }}</ion-text>
        </div>

        <div v-if="isLoading" class="ion-text-center ion-padding">
          <ion-text color="medium">Cargando datos...</ion-text>
        </div>

        <ion-list inset="true">
          <ion-item-sliding
            v-for="user in adminStore.users"
            :key="user.id"
            :disabled="user.id === appStore.user?.id"
          >

            <ion-item>
              <ion-icon
                :icon="user.admin ? shieldCheckmarkOutline : personOutline"
                slot="start"
                :color="user.admin ? 'success' : 'medium'"
              ></ion-icon>

              <ion-label>
                <h2>{{ user.name || 'Sin nombre' }}</h2>
                <p>{{ user.email }}</p>
                <p class="date-text">Registro: {{ formatDate(user.created) }}</p>
              </ion-label>

              <ion-badge slot="end" :color="user.admin ? 'success' : 'light'">
                {{ user.admin ? 'Admin' : 'User' }}
              </ion-badge>
            </ion-item>

            <ion-item-options side="end">
              <ion-item-option color="warning" @click="handleToggleAdmin(user)">
                <ion-icon slot="top" :icon="keyOutline"></ion-icon>
                {{ user.admin ? 'Quitar' : 'Hacer Admin' }}
              </ion-item-option>

              <ion-item-option color="danger" @click="handleDeleteUser(user)">
                <ion-icon slot="top" :icon="trashOutline"></ion-icon>
                Borrar
              </ion-item-option>
            </ion-item-options>

          </ion-item-sliding>
        </ion-list>

        <div class="ion-text-center ion-padding">
          <ion-text color="medium" class="help-text">
            <small>← Desliza un usuario a la izquierda para ver opciones</small>
          </ion-text>
        </div>

      </div>

    </ion-content>
    <SiteFooter />
  </ion-page>
</template>

<style scoped>
.stat-card {
  margin: 0;
  box-shadow: none;
  border: 1px solid #e0e0e0;
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 5px;
}

.stat-card h2 {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
}

.stat-card p {
  font-size: 0.8rem;
  margin: 0;
  color: var(--ion-color-medium);
}

.date-text {
  font-size: 0.75rem;
  color: var(--ion-color-medium-shade);
}

.help-text {
  font-style: italic;
  opacity: 0.7;
}

/* Ajuste para que la lista no pegue con los bordes en desktop */
ion-list {
  margin-top: 10px;
}
</style>