<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonContent,
  IonImg,
  IonAvatar,
  IonIcon,
  IonText,
  IonChip,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonList,
  IonItem,
  IonButton,
  IonTextarea,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent
} from '@ionic/vue'
import {
  timeOutline,
  personCircleOutline,
  calendarOutline,
  send,
  chatbubbleOutline
} from 'ionicons/icons'

// Importamos el footer si lo quieres, aunque en detalles a veces sobra
import SiteFooter from '@/components/SiteFooter.vue'

const route = useRoute()
const appStore = useAppStore()

const receta = ref(null)
const loading = ref(true)
const selectedSegment = ref('detalles') // Controla qué pestaña se ve

const comentarios = ref([])
const nuevoComentario = ref('')
const enviando = ref(false)

const usuarioLogueado = computed(() => appStore.isAuthenticated)

// --- LÓGICA DE CARGA (Igual que antes) ---
async function cargarComentarios() {
  try {
    await appStore.getComentariosPorReceta(route.params.id)
    comentarios.value = appStore.comentariosDeReceta(route.params.id)
  } catch (err) {
    console.error("Error cargando comentarios:", err)
  }
}

async function enviarComentario() {
  if (!nuevoComentario.value.trim()) return
  enviando.value = true
  try {
    await appStore.addComentario(route.params.id, nuevoComentario.value.trim())
    nuevoComentario.value = ''
    await cargarComentarios()
  } catch (err) {
    console.error("Error enviando comentario:", err)
  } finally {
    enviando.value = false
  }
}

function obtenerNombreAutor(comentario) {
  if (comentario.expand?.user) {
    return comentario.expand.user.name ||
           comentario.expand.user.username ||
           'Usuario anónimo'
  }
  return 'Usuario anónimo'
}

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

onMounted(async () => {
  try {
    if (appStore.recetas.length === 0) await appStore.loadRecetas()

    receta.value = appStore.recetas.find(r => r.id === route.params.id)

    if (!receta.value) {
      await appStore.loadReceta(route.params.id)
      receta.value = appStore.recetaActual
    }

    // Resolver nombre del autor
    if (receta.value) {
      const autorExpand = Array.isArray(receta.value.expand?.autors)
        ? receta.value.expand.autors[0]
        : receta.value.expand?.autors

      receta.value.autorNombre = autorExpand?.name || 'Anónimo'
    }

    await cargarComentarios()
  } catch (error) {
    console.error("Error:", error)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <ion-page>
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/recetas" text=""></ion-back-button>
        </ion-buttons>
        <ion-title>{{ receta?.titulo || 'Detalle' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">

      <div v-if="loading" class="ion-padding ion-text-center">
        <h3>Cargando receta...</h3>
      </div>

      <div v-else-if="receta">

        <div class="hero-image">
          <img :src="receta.image || '/assets/img/default-recipe.jpg'" />
          <div class="hero-overlay">
            <ion-chip color="warning">
              {{ receta.categoria || 'General' }}
            </ion-chip>
          </div>
        </div>

        <div class="ion-padding">
          <h1 class="recipe-title">{{ receta.titulo }}</h1>

          <div class="meta-row">
            <div class="meta-item">
              <ion-icon :icon="personCircleOutline"></ion-icon>
              {{ receta.autorNombre }}
            </div>
            <div class="meta-item">
              <ion-icon :icon="calendarOutline"></ion-icon>
              {{ new Date(receta.created).toLocaleDateString() }}
            </div>
          </div>
        </div>

        <ion-segment v-model="selectedSegment" mode="ios" class="ion-padding-horizontal">
          <ion-segment-button value="detalles">
            <ion-label>Detalles</ion-label>
          </ion-segment-button>
          <ion-segment-button value="ingredientes">
            <ion-label>Ingred.</ion-label>
          </ion-segment-button>
          <ion-segment-button value="preparacion">
            <ion-label>Pasos</ion-label>
          </ion-segment-button>
        </ion-segment>

        <div class="segment-content ion-padding">

          <div v-if="selectedSegment === 'detalles'" class="animate-fade-in">
            <p class="description-text">{{ receta.descripcion }}</p>

            <div class="comments-section ion-margin-top">
              <h3>
                <ion-icon :icon="chatbubbleOutline"></ion-icon>
                Comentarios ({{ comentarios.length }})
              </h3>

              <ion-list lines="none">
                <ion-item v-for="c in comentarios" :key="c.id" class="comment-item">
                  <ion-avatar slot="start" class="comment-avatar">
                    <img :src="`https://ui-avatars.com/api/?name=${obtenerNombreAutor(c)}&background=random`" />
                  </ion-avatar>
                  <ion-label class="ion-text-wrap">
                    <h3>
                      {{ obtenerNombreAutor(c) }}
                      <span class="comment-date">{{ formatearFecha(c.created) }}</span>
                    </h3>
                    <p>{{ c.contenido }}</p>
                  </ion-label>
                </ion-item>
              </ion-list>

              <div v-if="usuarioLogueado" class="comment-box">
                <ion-textarea
                  v-model="nuevoComentario"
                  placeholder="Escribe tu opinión..."
                  rows="2"
                  class="custom-textarea"
                ></ion-textarea>
                <ion-button
                  expand="block"
                  size="small"
                  class="ion-margin-top"
                  :disabled="enviando || !nuevoComentario.trim()"
                  @click="enviarComentario"
                >
                  <ion-icon slot="start" :icon="send"></ion-icon>
                  Enviar
                </ion-button>
              </div>
              <div v-else class="ion-text-center ion-padding">
                <ion-text color="medium">
                  <small>Inicia sesión para comentar</small>
                </ion-text>
              </div>
            </div>
          </div>

          <div v-if="selectedSegment === 'ingredientes'" class="animate-fade-in">
            <ion-list>
              <ion-item v-for="(ing, index) in receta.ingredientes?.split(',')" :key="index">
                <div slot="start" class="bullet-point">•</div>
                <ion-label class="ion-text-wrap">{{ ing.trim() }}</ion-label>
              </ion-item>
            </ion-list>
          </div>

          <div v-if="selectedSegment === 'preparacion'" class="animate-fade-in">
            <ion-card class="prep-card">
              <ion-card-content class="prep-text">
                {{ receta.preparacion }}
              </ion-card-content>
            </ion-card>
          </div>

        </div>

      </div>
      <div v-else class="ion-padding ion-text-center">
        <h2>Receta no encontrada 😢</h2>
        <ion-button router-link="/recetas">Volver al listado</ion-button>
      </div>

    </ion-content>
  </ion-page>
</template>

<style scoped>
.hero-image {
  position: relative;
  height: 250px;
  width: 100%;
}

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  bottom: 10px;
  left: 10px;
}

.recipe-title {
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 5px;
}

.meta-row {
  display: flex;
  gap: 15px;
  color: var(--ion-color-medium);
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.description-text {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--ion-text-color);
}

.bullet-point {
  color: var(--ion-color-primary);
  font-size: 1.5rem;
  margin-right: 5px;
}

.prep-card {
  margin: 0;
  background-color: var(--ion-color-light);
  box-shadow: none;
}

.prep-text {
  font-size: 1rem;
  line-height: 1.8;
  white-space: pre-line; /* Respeta saltos de línea */
}

/* Comentarios */
.comment-item {
  --padding-start: 0;
  margin-bottom: 10px;
}

.comment-avatar {
  width: 40px;
  height: 40px;
}

.comment-date {
  font-size: 0.7rem;
  color: var(--ion-color-medium);
  margin-left: 5px;
  font-weight: normal;
}

.custom-textarea {
  --background: #f4f5f8;
  --padding-start: 10px;
  border-radius: 8px;
  margin-top: 10px;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>