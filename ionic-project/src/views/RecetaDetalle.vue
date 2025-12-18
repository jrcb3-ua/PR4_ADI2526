<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle,
  IonContent, IonChip, IonSegment, IonSegmentButton, IonLabel, IonList,
  IonItem, IonAvatar, IonIcon, IonText, IonTextarea, IonButton,
  IonCard, IonCardContent, alertController
} from '@ionic/vue'
import {
  personCircleOutline, calendarOutline, chatbubbleOutline, send,
  trashOutline, createOutline
} from 'ionicons/icons'

const route = useRoute()
const appStore = useAppStore()

const receta = ref(null)
const loading = ref(true)
const selectedSegment = ref('detalles')
const nuevoComentario = ref('')
const enviando = ref(false)

// 1. CAMBIO IMPORTANTE: Usamos computed para que la lista reaccione a cambios (ediciones/borrados)
const comentarios = computed(() => appStore.comentariosDeReceta(route.params.id))
const usuarioLogueado = computed(() => appStore.isAuthenticated)

// --- FUNCIONES DE PERMISOS ---

// Verificar si el comentario ha sido editado
function haSidoEditado(comentario) {
  return comentario.created !== comentario.updated
}

// Permiso para BORRAR: Dueño del comentario O Dueño de la receta
function puedeBorrar(comentario) {
  if (!appStore.user) return false

  const soyAutorComentario = comentario.user === appStore.user.id

  // Verificamos si soy dueño de la receta (autors suele ser un array)
  let soyDuenoReceta = false
  if (receta.value?.autors) {
    if (Array.isArray(receta.value.autors)) {
      soyDuenoReceta = receta.value.autors.includes(appStore.user.id)
    } else {
      soyDuenoReceta = receta.value.autors === appStore.user.id
    }
  }

  return soyAutorComentario || soyDuenoReceta
}

// Permiso para EDITAR: Solo el autor del comentario
function puedeEditar(comentario) {
  if (!appStore.user) return false
  return comentario.user === appStore.user.id
}

// --- MANEJADORES DE ACCIÓN ---

// Alerta para editar
async function manejarEdicion(comentario) {
  const alert = await alertController.create({
    header: 'Editar comentario',
    inputs: [
      {
        name: 'contenido',
        type: 'textarea',
        placeholder: 'Escribe tu corrección...',
        value: comentario.contenido
      }
    ],
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Guardar',
        handler: async (data) => {
          if (data.contenido && data.contenido.trim() !== '') {
            try {
              await appStore.updateComentario(comentario.id, data.contenido)
            } catch (e) {
              console.error("Error al editar:", e)
            }
          }
        }
      }
    ]
  })
  await alert.present()
}

// Alerta para borrar
async function manejarBorrado(comentarioId) {
  const alert = await alertController.create({
    header: 'Confirmar eliminación',
    message: '¿Estás seguro? Esta acción no se puede deshacer.',
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Borrar',
        role: 'destructive', // Pone el texto en rojo en iOS
        handler: async () => {
          try {
            await appStore.deleteComentario(comentarioId)
          } catch (e) {
            console.error("Error al borrar:", e)
          }
        }
      }
    ]
  })
  await alert.present()
}

// --- LÓGICA DE DATOS (Autor y Envío) ---

function obtenerNombreAutor(comentario) {
  // Si soy yo
  if (appStore.user && comentario.user === appStore.user.id) {
    return appStore.user.name || 'Tú'
  }
  // Si es otro (expand)
  if (comentario.expand?.user) {
    return comentario.expand.user.name || comentario.expand.user.username || 'Usuario anónimo'
  }
  return 'Usuario anónimo'
}

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

async function enviarComentario() {
  if (!nuevoComentario.value.trim()) return
  enviando.value = true
  try {
    await appStore.addComentario(route.params.id, nuevoComentario.value.trim())
    nuevoComentario.value = ''
  } catch (err) {
    console.error("Error enviando comentario:", err)
  } finally {
    enviando.value = false
  }
}

// --- ON MOUNTED ---
onMounted(async () => {
  try {
    if (appStore.recetas.length === 0) await appStore.loadRecetas()

    receta.value = appStore.recetas.find(r => r.id === route.params.id)

    if (!receta.value) {
      await appStore.loadReceta(route.params.id)
      receta.value = appStore.recetaActual
    }

    if (receta.value) {
      const autorExpand = Array.isArray(receta.value.expand?.autors)
        ? receta.value.expand.autors[0]
        : receta.value.expand?.autors

      receta.value.autorNombre = autorExpand?.name || 'Anónimo'
    }

    // Cargamos comentarios (la variable 'comentarios' se actualiza sola gracias a computed)
    await appStore.getComentariosPorReceta(route.params.id)
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
                    <img :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(obtenerNombreAutor(c))}&background=random`" />
                  </ion-avatar>

                  <ion-label class="ion-text-wrap comment-content">
                    <div class="comment-header-row">
                      <h3>
                        {{ obtenerNombreAutor(c) }}
                        <span class="comment-date">{{ formatearFecha(c.created) }}</span>
                      </h3>
                    </div>

                    <p>{{ c.contenido }}</p>

                    <div v-if="haSidoEditado(c)" class="edited-label">
                      (editado)
                    </div>
                  </ion-label>

                  <div slot="end" class="action-buttons">
                    <ion-button
                      fill="clear"
                      size="small"
                      color="medium"
                      v-if="puedeEditar(c)"
                      @click="manejarEdicion(c)"
                    >
                      <ion-icon slot="icon-only" :icon="createOutline"></ion-icon>
                    </ion-button>

                    <ion-button
                      fill="clear"
                      size="small"
                      color="danger"
                      v-if="puedeBorrar(c)"
                      @click="manejarBorrado(c.id)"
                    >
                      <ion-icon slot="icon-only" :icon="trashOutline"></ion-icon>
                    </ion-button>
                  </div>

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
  white-space: pre-line;
}

/* Comentarios */
.comment-item {
  --padding-start: 0;
  margin-bottom: 10px;
  --inner-padding-end: 0; /* Ajuste para botones */
}

.comment-avatar {
  width: 40px;
  height: 40px;
  margin-top: 8px; /* Alinear visualmente */
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

/* ESTILOS NUEVOS PARA EDICIÓN Y BOTONES */
.edited-label {
  font-size: 0.7rem;
  color: var(--ion-color-medium);
  font-style: italic;
  margin-top: 4px;
}

.action-buttons {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  margin-left: 5px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>