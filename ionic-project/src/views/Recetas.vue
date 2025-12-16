<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import {
  IonPage,
  IonContent,
  IonSearchbar,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonText,
  IonBadge
} from '@ionic/vue'
import { calendarOutline, personCircleOutline, arrowForward, searchOutline } from 'ionicons/icons'
import { useAppStore } from '@/stores/appStore'

import SiteHeader from '@/components/SiteHeader.vue'
import SiteFooter from '@/components/SiteFooter.vue'

const app = useAppStore()
const searchTerm = ref('')

// --- ✨ LÓGICA DE REALTIME ✨ ---

onMounted(async () => {
  try {
    await app.loadRecetas()
  } catch (error) {
    console.error("Error cargando recetas:", error)
  }
})

onUnmounted(() => {
  app.unsubscribeFromRealtime()
})

// Lógica de Autor
function getAutorNombre(receta) {
  const autorId = Array.isArray(receta.autors) ? receta.autors[0] : receta.autors

  if (autorId === app.user?.id) {
    return app.user?.name || app.user?.username || "Tú"
  }

  if (receta.expand?.autors) {
    const autor = Array.isArray(receta.expand.autors)
      ? receta.expand.autors[0]
      : receta.expand.autors
    return autor?.name || autor?.username || autor?.email || "Anónimo"
  }

  return "Anónimo"
}

// Lógica de filtrado
const filteredRecetas = computed(() => {
  if (!searchTerm.value?.trim()) return app.recetas

  const term = searchTerm.value.toLowerCase().trim()

  return app.recetas.filter(receta =>
    receta.titulo?.toLowerCase().includes(term) ||
    receta.descripcion?.toLowerCase().includes(term) ||
    receta.ingredientes?.toLowerCase().includes(term) ||
    receta.preparacion?.toLowerCase().includes(term)
  )
})
</script>

<template>
  <ion-page>
    <SiteHeader />

    <ion-content :fullscreen="true" class="ion-padding-top">

      <div class="header-section ion-padding-horizontal">
        <h1 class="page-title">Todas las recetas</h1>

        <ion-searchbar
          v-model="searchTerm"
          :animated="true"
          placeholder="Buscar ingredientes, título..."
          :search-icon="searchOutline"
          show-clear-button="focus"
        ></ion-searchbar>

        <ion-text color="medium" v-if="searchTerm" class="results-text">
          <p class="ion-no-margin">
            {{ filteredRecetas.length }}
            {{ filteredRecetas.length === 1 ? 'receta encontrada' : 'recetas encontradas' }}
          </p>
        </ion-text>
      </div>

      <div v-if="app.loading && !searchTerm" class="empty-state ion-text-center ion-padding">
        <h3>⏳ Cargando recetas...</h3>
        <p>Un momento, estamos conectando.</p>
      </div>
      <div v-else-if="filteredRecetas.length === 0" class="empty-state ion-text-center ion-padding">
         <div v-if="searchTerm">
            <h3>🤷‍♂️ Ups...</h3>
            <p>No encontramos recetas para "{{ searchTerm }}"</p>
         </div>
         <div v-else>
            <h3>¡No hay recetas!</h3>
            <p>Sé el primero en crear una.</p>
         </div>
      </div>

      <ion-grid v-else>
        <ion-row>
          <ion-col
            size="12"
            size-md="6"
            v-for="receta in filteredRecetas"
            :key="receta.id"
          >
            <ion-card class="recipe-card">

              <div class="card-img-wrapper" @click="$router.push(`/receta/${receta.id}`)">
                <img
                  :src="receta.image || '/assets/img/default-recipe.jpg'"
                  :alt="receta.titulo"
                />
                <ion-badge color="warning" class="category-badge">
                  {{ receta.categoria || 'General' }}
                </ion-badge>
              </div>

              <ion-card-header>
                <div class="meta-info">
                  <ion-icon :icon="personCircleOutline"></ion-icon>
                  <span>{{ getAutorNombre(receta) }}</span>
                  <span class="dot">•</span>
                  <span>{{ new Date(receta.created).toLocaleDateString() }}</span>
                </div>
                <ion-card-title class="ion-margin-top">{{ receta.titulo }}</ion-card-title>
              </ion-card-header>

              <ion-card-content>
                <p class="description-truncate">
                  {{ receta.descripcion }}
                </p>

                <ion-button
                  fill="outline"
                  expand="block"
                  class="ion-margin-top"
                  :router-link="`/receta/${receta.id}`"
                >
                  Ver Receta
                  <ion-icon slot="end" :icon="arrowForward"></ion-icon>
                </ion-button>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>

      <SiteFooter />
    </ion-content>
  </ion-page>
</template>

<style scoped>
.page-title {
  font-weight: 800;
  font-size: 1.8rem;
  margin-bottom: 10px;
  padding-left: 5px;
  color: var(--ion-text-color);
}

.results-text {
  font-size: 0.9rem;
  margin-left: 10px;
  margin-bottom: 10px;
  display: block;
}

/* Tarjetas */
.recipe-card {
  border-radius: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  background: var(--ion-card-background, #fff);
}

.card-img-wrapper {
  position: relative;
  height: 200px;
  overflow: hidden;
  cursor: pointer;
}

.card-img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.category-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 6px 10px;
  font-size: 0.8rem;
  border-radius: 8px;
}

/* Metadatos */
.meta-info {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  color: var(--ion-color-medium);
  gap: 5px;
}

.dot {
  margin: 0 2px;
}

/* Truncar descripción larga */
.description-truncate {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: var(--ion-color-medium);
}

.empty-state {
  margin-top: 50px;
  color: var(--ion-color-medium);
}
</style>