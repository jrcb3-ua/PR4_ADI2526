import { defineStore } from 'pinia'
import { pb } from '../backend/config/pb'

// Tipos mínimos para evitar never[]
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
    // --------------------  LOGIN  --------------------
    async login(email: string, password: string): Promise<void> {
      try {
        this.loading = true
        this.error = null

        const authData = await pb
          .collection('users')
          .authWithPassword(email, password)

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

        const userRecetas = this.recetasDelUsuario

        for (const receta of userRecetas) {
          await pb.collection('recetas').delete(receta.id)
        }

        await pb.collection('users').delete(this.user.id)

        pb.authStore.clear()
        this.user = null
        this.recetas = this.recetas.filter(r => !userRecetas.includes(r))
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

        const updatedUser = await pb
          .collection('users')
          .update(this.user.id, profileData)

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

        const recetas = await pb.collection('recetas').getFullList({
          sort: '-created',
          expand: 'autors'
        })

        this.recetas = recetas as Receta[]
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
        this.recetaActual = await pb
          .collection('recetas')
          .getOne(id, { expand: 'autors' }) as Receta
      } catch (err) {
        console.error('Error al cargar receta:', err)
      } finally {
        this.loading = false
      }
    },

    // --------------------  CARGAR TODOS LOS COMENTARIOS  --------------------
    async getFullComentarios(): Promise<Comentario[]> {
      try {
        this.loading = true
        this.error = null

        const comentarios = await pb.collection('comentarios').getFullList({
          sort: '-created',
          expand: 'usuario,receta'
        })

        this.comentarios = comentarios as Comentario[]
        return this.comentarios
      } catch (err) {
        console.error('Error cargando comentarios:', err)
        this.error = 'Error al cargar comentarios'
        throw err
      } finally {
        this.loading = false
      }
    },

    // --------------------  COMENTARIOS POR RECETA  --------------------
    async getComentariosPorReceta(recetaId: string): Promise<Comentario[]> {
      try {
        this.loading = true
        this.error = null

        const comentarios = await pb.collection('comentarios').getFullList({
          filter: `receta = "${recetaId}"`,
          sort: '-created',
          expand: 'usuario'
        })

        this.comentarios = [
          ...this.comentarios.filter(c => c.receta !== recetaId),
          ...(comentarios as Comentario[])
        ]

        return comentarios as Comentario[]
      } catch (err) {
        console.error('Error cargando comentarios de receta:', err)
        this.error = 'Error al cargar comentarios'
        throw err
      } finally {
        this.loading = false
      }
    },

    // --------------------  AGREGAR COMENTARIO  --------------------
    async addComentario(recetaId: string, contenido: string): Promise<Comentario> {
      try {
        this.loading = true
        this.error = null

        if (!this.user) throw new Error('Usuario no autenticado')

        const nuevo = await pb.collection('comentarios').create({
          contenido,
          receta: recetaId,
          user: this.user.id
        })

        const comentarioExpandido = await pb
          .collection('comentarios')
          .getOne(nuevo.id, { expand: 'usuario' })

        this.comentarios.unshift(comentarioExpandido as Comentario)
        return comentarioExpandido as Comentario
      } catch (err) {
        console.error('Error agregando comentario:', err)
        this.error = 'No se pudo agregar el comentario'
        throw err
      } finally {
        this.loading = false
      }
    },

    // --------------------  ACTUALIZAR COMENTARIO  --------------------
    async updateComentario(id: string, contenido: string): Promise<void> {
      const updated = await pb.collection('comentarios').update(id, { contenido })
      const index = this.comentarios.findIndex(c => c.id === id)
      if (index !== -1) {
        this.comentarios[index] = {
          ...this.comentarios[index],
          ...(updated as Comentario)
        }
      }
    },

    // --------------------  ELIMINAR COMENTARIO  --------------------
    async deleteComentario(id: string): Promise<void> {
      try {
        await pb.collection('comentarios').delete(id)
        this.comentarios = this.comentarios.filter(c => c.id !== id)
      } catch (err) {
        console.error('Error eliminando comentario:', err)
        this.error = 'No se pudo eliminar el comentario'
        throw err
      }
    },

    // --------------------  CREAR RECETA  --------------------
    async addReceta(data: Record<string, any>): Promise<void> {
      try {
        this.loading = true
        this.error = null

        if (!this.user) throw new Error('Usuario no autenticado')

        const nueva = await pb.collection('recetas').create({
          ...data,
          autors: [this.user.id]
        })

        this.recetas.unshift(nueva as Receta)
      } catch (err) {
        console.error('Error al crear receta:', err)
        this.error = 'No se pudo crear la receta'
      } finally {
        this.loading = false
      }
    },

    // --------------------  ACTUALIZAR RECETA  --------------------
    async updateReceta(id: string, fields: Record<string, any>): Promise<void> {
      const updated = await pb.collection('recetas').update(id, fields)
      const index = this.recetas.findIndex(r => r.id === id)
      if (index !== -1) this.recetas[index] = updated as Receta
    },

    // --------------------  BORRAR RECETA  --------------------
    async deleteReceta(id: string): Promise<void> {
      try {
        await pb.collection('recetas').delete(id)
        this.recetas = this.recetas.filter(r => r.id !== id)
      } catch (err) {
        console.error('Error borrando receta:', err)
        this.error = 'No se pudo borrar la receta'
      }
    }
  }
})
