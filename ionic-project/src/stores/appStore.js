import { defineStore } from 'pinia'
import { pb } from '@/backend/config/pb'
import { toastController } from '@ionic/vue'
import { wifi } from 'ionicons/icons'

export const useAppStore = defineStore('appStore', {
  state: () => ({
    user: pb.authStore.model,   // Usuario autenticado
    recetas: [],                // Todas las recetas de PocketBase
    recetaActual: null,
    comentarios: [],           // Todos los comentarios
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: state => !!state.user,

    recetasDelUsuario: (state) => {
      if (!state.user) return []
      return state.recetas.filter(r => r.autors?.includes(state.user.id))
    },

    // Nuevo getter para comentarios de una receta específica
    comentariosDeReceta: (state) => (recetaId) => {
      return state.comentarios.filter(c => c.receta === recetaId)
    },

    // Getter para contar comentarios por receta
    contarComentariosPorReceta: (state) => (recetaId) => {
      return state.comentarios.filter(c => c.receta === recetaId).length
    }
  },

  actions: {
    // --------------------  LOGIN  --------------------
    async login(email, password) {
      try {
        this.loading = true
        this.error = null

        const authData = await pb.collection('users')
          .authWithPassword(email, password)

        this.user = authData.record
      } catch (err) {
        console.error("Error login:", err)
        this.error = "Credenciales incorrectas"
        throw err
      } finally {
        this.loading = false
      }
    },

    // --------------------  LOGOUT  --------------------
    logout() {
      pb.authStore.clear()
      this.user = null // si no da error al hacer login de nuevo
    },

    // --------------------  REGISTRO  --------------------
    async register(data) {
      try {
        this.loading = true
        this.error = null
        await pb.collection("users").create(data)
      } catch (err) {
        console.error("Error registro:", err)
        this.error = "No se pudo registrar el usuario"
        throw err
      } finally {
        this.loading = false
      }
    },
      async deleteAccount() {
      try {
        this.loading = true
        this.error = null

        if (!this.user) {
          throw new Error("Usuario no autenticado")
        }

        // Primero eliminar todas las recetas del usuario
        const userRecetas = this.recetasDelUsuario
        for (const receta of userRecetas) {
          await pb.collection('recetas').delete(receta.id)
        }

        // Luego eliminar el usuario
        await pb.collection('users').delete(this.user.id)
        
        // Limpiar sesión y estado
        pb.authStore.clear()
        this.user = null
        this.recetas = this.recetas.filter(r => !userRecetas.includes(r))
        
      } catch (err) {
        console.error("Error eliminando cuenta:", err)
        this.error = "No se pudo eliminar la cuenta"
        throw err
      } finally {
        this.loading = false
      }
    },
      async updateProfile(profileData) {
      try {
        this.loading = true
        this.error = null

        if (!this.user) {
          throw new Error("Usuario no autenticado")
        }

        // Actualizar en PocketBase
        const updatedUser = await pb.collection('users').update(this.user.id, profileData)
        
        // Actualizar en el store local
        this.user = { ...this.user, ...updatedUser }
        
        return updatedUser
      } catch (err) {
        console.error("Error actualizando perfil:", err)
        this.error = "No se pudo actualizar el perfil"
        throw err
      } finally {
        this.loading = false
      }
    },
    // --------------------  CARGAR TODAS LAS RECETAS  --------------------
    async loadRecetas() {
      try {
        this.loading = true
        this.error = null

        this.recetas = await pb.collection("recetas").getFullList({
          sort: "-created",
          expand: "autors"
        })

      } catch (err) {
        console.error("Error cargando recetas:", err)
        this.error = "Error al cargar recetas"
      } finally {
        this.loading = false
      }
    },

    // --------------------  CARGAR UNA RECETA  --------------------
    async loadReceta(id) {
      try {
        this.loading = true
        this.recetaActual = await pb
          .collection("recetas")
          .getOne(id, { expand: "autors" })
      } catch (err) {
        console.error("Error al cargar receta:", err)
      } finally {
        this.loading = false
      }
    },

    // --------------------  CARGAR TODOS LOS COMENTARIOS  --------------------
    async getFullComentarios() {
      try {
        this.loading = true
        this.error = null

        this.comentarios = await pb.collection("comentarios").getFullList({
          sort: "-created",
          expand: "usuario,receta"  // Expande las relaciones con usuario y receta
        })

        return this.comentarios
      } catch (err) {
        console.error("Error cargando comentarios:", err)
        this.error = "Error al cargar comentarios"
        throw err
      } finally {
        this.loading = false
      }
    },

    // --------------------  CARGAR COMENTARIOS DE UNA RECETA  --------------------
    async getComentariosPorReceta(recetaId) {
        try {
          this.loading = true
          this.error = null

          const comentarios = await pb.collection("comentarios").getFullList({
            filter: `receta = "${recetaId}"`,
            sort: "-created",
            expand: "user"  // Asegúrate de que sea "usuario" (singular)
          })

          // Actualizamos el estado con los nuevos comentarios
          this.comentarios = [
            ...this.comentarios.filter(c => c.receta !== recetaId),
            ...comentarios
          ]

          return comentarios
        } catch (err) {
          console.error("Error cargando comentarios de receta:", err)
          this.error = "Error al cargar comentarios"
          throw err
        } finally {
          this.loading = false
        }
      },

      // --------------------  AGREGAR COMENTARIO  --------------------
      async addComentario(recetaId, contenido) {
        try {
          this.loading = true
          this.error = null

          if (!this.user) {
            throw new Error("Usuario no autenticado")
          }

          const nuevoComentario = await pb.collection("comentarios").create({
            contenido: contenido,
            receta: recetaId,
            user: this.user.id  // Asegúrate de que el campo se llame "usuario"
          })

          // Expande el comentario para obtener los datos del usuario
          const comentarioExpandido = await pb.collection("comentarios").getOne(nuevoComentario.id, {
            expand: "usuario"  // Asegúrate de que sea "usuario"
          })

          // Agrega el comentario al estado
          this.comentarios.unshift(comentarioExpandido)

          return comentarioExpandido
        } catch (err) {
          console.error("Error agregando comentario:", err)
          this.error = "No se pudo agregar el comentario"
          throw err
        } finally {
          this.loading = false
        }
      },

    // --------------------  ACTUALIZAR COMENTARIO  --------------------
    async updateComentario(id, contenido) {
      try {
        const updated = await pb.collection("comentarios").update(id, {
          contenido: contenido
        })

        // Actualiza en el estado local
        const index = this.comentarios.findIndex(c => c.id === id)
        if (index !== -1) {
          this.comentarios[index] = { ...this.comentarios[index], ...updated }
        }

        return updated
      } catch (err) {
        console.error("Error actualizando comentario:", err)
        throw err
      }
    },

    // --------------------  ELIMINAR COMENTARIO  --------------------
    async deleteComentario(id) {
      try {
        await pb.collection("comentarios").delete(id)
        this.comentarios = this.comentarios.filter(c => c.id !== id)
      } catch (err) {
        console.error("Error eliminando comentario:", err)
        this.error = "No se pudo eliminar el comentario"
        throw err
      }
    },

    // --------------------  CREAR RECETA  --------------------
    async addReceta(data) {
      try {
        this.loading = true
        this.error = null

        const nueva = await pb.collection("recetas").create({
          ...data,
          autors: [this.user.id]
        })

        this.recetas.unshift(nueva)

      } catch (err) {
        console.error("Error al crear receta:", err)
        this.error = "No se pudo crear la receta"
      } finally {
        this.loading = false
      }
    },

    // --------------------  ACTUALIZAR RECETA  --------------------
    async updateReceta(id, fields) {
      try {
        const updated = await pb.collection("recetas").update(id, fields)
        const index = this.recetas.findIndex(r => r.id === id)
        if (index !== -1) this.recetas[index] = updated
      } catch (err) {
        console.error("Error actualizando receta:", err)
      }
    },

    // --------------------  BORRAR RECETA  --------------------
    async deleteReceta(id) {
      try {
        await pb.collection("recetas").delete(id)
        this.recetas = this.recetas.filter(r => r.id !== id)
      } catch (err) {
        console.error("Error borrando receta:", err)
        this.error = "No se pudo borrar la receta"
      }
    },
    async subscribeToRealtime() {
          console.log('conectando al canal Realtime -> Recetas...');

          // Nos suscribimos a CUALQUIER cambio ('*') en la colección 'recetas'
          pb.collection('recetas').subscribe('*', async (e) => {
            console.log('Evento Realtime:', e.action, e.record);

            // CASO 1: SE CREA UNA RECETA
            if (e.action === 'create') {
              // La añadimos al principio de la lista local
              this.recetas.unshift(e.record);
              this.presentToast('Nueva receta añadida en tiempo real', 'success');
            }

            // CASO 2: SE ACTUALIZA UNA RECETA
            if (e.action === 'update') {
              const index = this.recetas.findIndex(r => r.id === e.record.id);
              if (index !== -1) {
                // Actualizamos los datos manteniendo lo que ya teníamos (por si había expands)
                this.recetas[index] = { ...this.recetas[index], ...e.record };
                this.presentToast(`Receta "${e.record.titulo}" actualizada`, 'warning');
              }
            }

            // CASO 3: SE BORRA UNA RECETA
            if (e.action === 'delete') {
              this.recetas = this.recetas.filter(r => r.id !== e.record.id);
              this.presentToast('Una receta ha sido eliminada', 'danger');
            }
          });
        },

        // ✨ NUEVO: Dejar de escuchar (importante para no saturar)
        unsubscribeFromRealtime() {
          console.log('Desconectando Realtime...');
          pb.collection('recetas').unsubscribe();
        },

        // ✨ NUEVO: Helper para mostrar notificaciones bonitas
        async presentToast(message, color) {
          const toast = await toastController.create({
            message: message,
            duration: 3000,
            color: color,
            position: 'top', // Arriba para que se vea bien en el video
            icon: wifi
          });
          await toast.present();
        }
  }
})