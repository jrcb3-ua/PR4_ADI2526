import { defineStore } from 'pinia'
import { pb } from '../backend/config/pb'
import { toastController } from '@ionic/vue'
import { wifi } from 'ionicons/icons'

// Tipos mínimos
interface User {
  id: string
  [key: string]: any
}

interface Receta {
  id: string
  autors?: string[]
  [key: string]: any
}

interface Comentario {
  id: string
  receta?: string
  contenido?: string
  usuario?: string
  [key: string]: any
}

export const useAppStore = defineStore('appStore', {
  state: () => ({
    user: pb.authStore.model as User | null,
    recetas: [] as Receta[],
    recetaActual: null as Receta | null,
    comentarios: [] as Comentario[],
    loading: false,
    error: null as string | null
  }),

  getters: {
    isAuthenticated: (state): boolean => !!state.user,

    recetasDelUsuario: (state): Receta[] => {
      if (!state.user) return []
      return state.recetas.filter(r =>
        r.autors?.includes(state.user!.id)
      )
    },

    comentariosDeReceta: (state) => {
      return (recetaId: string): Comentario[] => {
        return state.comentarios.filter(c => c.receta === recetaId)
      }
    },

    contarComentariosPorReceta: (state) => {
      return (recetaId: string): number => {
        return state.comentarios.filter(c => c.receta === recetaId).length
      }
    }
  },

  actions: {
    // --------------------  REALTIME (¡LO QUE FALTABA!)  --------------------
    async subscribeToRealtime() {
      // Evitamos duplicar suscripciones
      this.unsubscribeFromRealtime();

      console.log('📡 Conectando al canal de recetas...');

      await pb.collection('recetas').subscribe('*', async (e) => {
        console.log('⚡ Evento Realtime:', e.action);

        if (e.action === 'create') {
          // Traemos la receta completa con autores expandidos
          const newReceta = await pb.collection('recetas').getOne(e.record.id, { expand: 'autors' });
          this.recetas.unshift(newReceta as Receta);
          this.presentToast('¡Nueva receta publicada!', 'success');
        }
        else if (e.action === 'update') {
          const updatedReceta = await pb.collection('recetas').getOne(e.record.id, { expand: 'autors' });
          const index = this.recetas.findIndex(r => r.id === e.record.id);
          if (index !== -1) {
             this.recetas[index] = updatedReceta as Receta;
          }
          this.presentToast('Una receta ha sido actualizada', 'warning');
        }
        else if (e.action === 'delete') {
          this.recetas = this.recetas.filter(r => r.id !== e.record.id);
          this.presentToast('Receta eliminada', 'danger');
        }
      });
    },

    unsubscribeFromRealtime() {
      pb.collection('recetas').unsubscribe();
      console.log('🔕 Desconectado del Realtime');
    },

    async presentToast(message: string, color: string) {
      const toast = await toastController.create({
        message: message,
        duration: 3000,
        color: color,
        position: 'top',
        icon: wifi
      });
      await toast.present();
    },

    // --------------------  LOGIN  --------------------
    async login(email: string, password: string): Promise<void> {
      try {
        this.loading = true
        this.error = null
        const authData = await pb.collection('users').authWithPassword(email, password)
        this.user = authData.record as User
      } catch (err) {
        console.error('Error login:', err)
        this.error = 'Credenciales incorrectas'
        throw err
      } finally {
        this.loading = false
      }
    },

    // --------------------  LOGOUT  --------------------
    logout(): void {
      this.unsubscribeFromRealtime(); // Nos desconectamos al salir
      pb.authStore.clear()
      this.user = null
    },

    // --------------------  REGISTRO  --------------------
    async register(data: Record<string, any>): Promise<void> {
      try {
        this.loading = true
        this.error = null
        await pb.collection('users').create(data)
      } catch (err) {
        console.error('Error registro:', err)
        this.error = 'No se pudo registrar el usuario'
        throw err
      } finally {
        this.loading = false
      }
    },

    // --------------------  ELIMINAR CUENTA  --------------------
    async deleteAccount(): Promise<void> {
      try {
        this.loading = true
        this.error = null
        if (!this.user) throw new Error('Usuario no autenticado')

        // 1. Borrar recetas del usuario
        const userRecetas = this.recetasDelUsuario
        for (const receta of userRecetas) {
          await pb.collection('recetas').delete(receta.id)
        }
        // 2. Borrar usuario
        await pb.collection('users').delete(this.user.id)

        this.logout();
      } catch (err) {
        console.error('Error eliminando cuenta:', err)
        this.error = 'No se pudo eliminar la cuenta'
        throw err
      } finally {
        this.loading = false
      }
    },

    // --------------------  ACTUALIZAR PERFIL  --------------------
    async updateProfile(profileData: Record<string, any>): Promise<User> {
      try {
        this.loading = true
        this.error = null
        if (!this.user) throw new Error('Usuario no autenticado')

        const updatedUser = await pb.collection('users').update(this.user.id, profileData)
        this.user = { ...this.user, ...updatedUser }
        return updatedUser as User
      } catch (err) {
        console.error('Error actualizando perfil:', err)
        this.error = 'No se pudo actualizar el perfil'
        throw err
      } finally {
        this.loading = false
      }
    },

    // --------------------  CARGAR TODAS LAS RECETAS  --------------------
    async loadRecetas(): Promise<void> {
      try {
        this.loading = true
        this.error = null
        const recetas = await pb.collection('recetas').getList(1, 50, {
          sort: '-created',
          expand: 'autors'
        })
        this.recetas = recetas.items as Receta[]
      } catch (err) {
        console.error('Error cargando recetas:', err)
        this.error = 'Error al cargar recetas'
      } finally {
        this.loading = false
      }
    },

    // --------------------  CARGAR UNA RECETA  --------------------
    async loadReceta(id: string): Promise<void> {
      try {
        this.loading = true
        this.recetaActual = await pb.collection('recetas').getOne(id, { expand: 'autors' }) as Receta
      } catch (err) {
        console.error('Error al cargar receta:', err)
      } finally {
        this.loading = false
      }
    },

    // --------------------  COMENTARIOS (Mantenemos tu lógica)  --------------------
    async getFullComentarios(): Promise<Comentario[]> {
      try {
        this.loading = true;
        this.error = null;
        const comentarios = await pb.collection('comentarios').getFullList({
          sort: '-created',
          expand: 'usuario,receta'
        });
        this.comentarios = comentarios as Comentario[];
        return this.comentarios;
      } catch (err) {
        console.error('Error cargando comentarios:', err);
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async getComentariosPorReceta(recetaId: string): Promise<Comentario[]> {
      try {
        this.loading = true
        this.error = null
        const comentarios = await pb.collection('comentarios').getFullList({
          filter: `receta = "${recetaId}"`,
          sort: '-created',
          expand: 'usuario'
        })
        // Actualizamos el estado local mezclando
        this.comentarios = [
          ...this.comentarios.filter(c => c.receta !== recetaId),
          ...(comentarios as Comentario[])
        ]
        return comentarios as Comentario[]
      } catch (err) {
        console.error('Error cargando comentarios de receta:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async addComentario(recetaId: string, contenido: string): Promise<Comentario> {
      try {
        this.loading = true
        if (!this.user) throw new Error('Usuario no autenticado')

        const nuevo = await pb.collection('comentarios').create({
          contenido,
          receta: recetaId,
          user: this.user.id
        })

        const comentarioExpandido = await pb.collection('comentarios').getOne(nuevo.id, { expand: 'usuario' })
        this.comentarios.unshift(comentarioExpandido as Comentario)
        return comentarioExpandido as Comentario
      } catch (err) {
        console.error('Error agregando comentario:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateComentario(id: string, contenido: string): Promise<void> {
      const updated = await pb.collection('comentarios').update(id, { contenido })
      const index = this.comentarios.findIndex(c => c.id === id)
      if (index !== -1) {
        this.comentarios[index] = { ...this.comentarios[index], ...(updated as Comentario) }
      }
    },

    async deleteComentario(id: string): Promise<void> {
      await pb.collection('comentarios').delete(id)
      this.comentarios = this.comentarios.filter(c => c.id !== id)
    },

    // --------------------  CRUD RECETAS (Mantenemos tu lógica)  --------------------
    async addReceta(data: Record<string, any>): Promise<void> {
      try {
        this.loading = true
        if (!this.user) throw new Error('Usuario no autenticado')

        // No añadimos manualmente a this.recetas porque el Realtime
        // se encargará de recibir el evento 'create' y añadirlo
        await pb.collection('recetas').create({
          ...data,
          autors: [this.user.id]
        })
      } catch (err) {
        console.error('Error al crear receta:', err)
        this.error = 'No se pudo crear la receta'
      } finally {
        this.loading = false
      }
    },

    async updateReceta(id: string, fields: Record<string, any>): Promise<void> {
       // El Realtime se encargará de actualizar el estado local
       await pb.collection('recetas').update(id, fields)
    },

    async deleteReceta(id: string): Promise<void> {
       // El Realtime se encargará de eliminarlo del estado local
       await pb.collection('recetas').delete(id)
    }
  }
})