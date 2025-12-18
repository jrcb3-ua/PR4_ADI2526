<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/appStore'
import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle,
  IonContent, IonChip, IonSegment, IonSegmentButton, IonLabel, IonList,
  IonItem, IonAvatar, IonIcon, IonText, IonTextarea, IonButton,
  IonCard, IonCardContent, alertController, toastController
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

// Comentarios reactivos
const comentarios = computed(() => appStore.comentariosDeReceta(route.params.id))
const usuarioLogueado = computed(() => appStore.isAuthenticated)
const currentUserId = computed(() => appStore.user?.id)

// --- FUNCIONES DE PERMISOS ---

// 1. ¿Ha sido editado? (Si fecha update es distinta a created)
function haSidoEditado(comentario) {
  return comentario.updated !== comentario.created
}

// 2. ¿Puedo borrar? (Soy autor del comentario O dueño de la receta)
function puedeBorrar(comentario) {
  if (!appStore.user) return false

  const soyAutorComentario = comentario.user === appStore.user.id

  // Verificamos si soy dueño de la receta (autors puede ser array o string)
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

// 3. ¿Puedo editar? (Solo si soy el autor del comentario)
function puedeEditar(comentario) {
  if (!appStore.user) return false
  return comentario.user === appStore.user.id
}

// --- ACCIONES ---

async function manejarBorrado(comentarioId) {
  const alert = await alertController.create({
    header: 'Confirmar',
    message: '¿Estás seguro de querer borrar este comentario?',
    buttons: [
      { text: 'Cancelar', role: 'cancel' },
      {
        text: 'Borrar',
        role: 'destructive',
        handler: async () => {
          try {
            await appStore.deleteComentario(comentarioId)
          } catch (e) {
            console.error(e)
          }
        }
      }
    ]
  })
  await alert.present()
}

async function manejarEdicion(comentario) {
  const alert = await alertController.create({
    header: 'Editar comentario',
    inputs: [
      {
        name: 'contenido',
        type: 'textarea',
        placeholder: 'Tu comentario...',
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
              console.error(e)
            }
          }
        }
      }
    ]
  })
  await alert.present()
}

// --- RESTO DE FUNCIONES (Igual que tenías) ---
function obtenerNombreAutor(comentario) {
  if (appStore.user && comentario.user === appStore.user.id) {
    return 'Tú' // Muestra "Tú" si eres tú
  }
  if (comentario.expand?.user) {
    return comentario.expand.user.name || comentario.expand.user.username || 'Usuario'
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
    console.error(err)
  } finally {
    enviando.value = false
  }
}

onMounted(async () => {
  try {
    if (appStore.recetas.length === 0) await appStore.loadRecetas()

    receta.value = appStore.recetas.find(r => r.id === route.params.id)
    if (!receta.value) {
      await appStore.loadReceta(route.params.id)
      receta.value = appStore.recetaActual
    }

    // Resolver nombre autor receta para la cabecera
    if (receta.value) {
       const autorExpand = Array.isArray(receta.value.expand?.autors)
          ? receta.value.expand.autors[0]
          : receta.value.expand?.autors
       receta.value.autorNombre = autorExpand?.name || 'Anónimo'
    }

    await appStore.getComentariosPorReceta(route.params.id)
  } catch (error) { console.error(error) } finally { loading.value = false }
})
</script>