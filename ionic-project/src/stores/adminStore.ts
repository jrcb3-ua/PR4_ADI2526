import { defineStore } from 'pinia'
import { pb } from '../backend/config/pb'

// Tipado mínimo del usuario (puedes ampliarlo)
interface AdminUser {
  id: string
  admin?: boolean
  [key: string]: any
}

export const useAdminStore = defineStore('adminStore', {
  state: () => ({
    users: [] as AdminUser[],
    loading: false,
    error: null as string | null
  }),

  getters: {
    // Usuarios no admin
    regularUsers: (state) =>
      state.users.filter(user => !user.admin),

    // Usuarios admin
    adminUsers: (state) =>
      state.users.filter(user => user.admin),

    // Contadores
    totalUsers: (state) => state.users.length,

    // ⚠️ En Pinia los getters NO se acceden desde state
    totalRegularUsers(): number {
      return this.regularUsers.length
    },

    totalAdminUsers(): number {
      return this.adminUsers.length
    }
  },

  actions: {
    // --------------------  CARGAR TODOS LOS USUARIOS  --------------------
    async getUsers(): Promise<AdminUser[]> {
      try {
        this.loading = true
        this.error = null

        const users = await pb.collection('users').getFullList()

        this.users = users as AdminUser[]
        return this.users
      } catch (err) {
        console.error('Error cargando usuarios:', err)
        this.error = 'Error al cargar los usuarios'
        throw err
      } finally {
        this.loading = false
      }
    },

    // --------------------  ACTUALIZAR ROL DE USUARIO  --------------------
    async updateUserRole(userId: string, isAdmin: boolean): Promise<AdminUser> {
      try {
        this.loading = true
        this.error = null

        const updatedUser = await pb.collection('users').update(userId, {
          admin: isAdmin
        })

        const index = this.users.findIndex(user => user.id === userId)
        if (index !== -1) {
          this.users[index] = updatedUser as AdminUser
        }

        return updatedUser as AdminUser
      } catch (err) {
        console.error('Error actualizando rol de usuario:', err)
        this.error = 'Error al actualizar el rol del usuario'
        throw err
      } finally {
        this.loading = false
      }
    },

    // --------------------  ELIMINAR USUARIO  --------------------
    async deleteUser(userId: string): Promise<void> {
      try {
        this.loading = true
        this.error = null

        await pb.collection('users').delete(userId)

        this.users = this.users.filter(user => user.id !== userId)
      } catch (err) {
        console.error('Error eliminando usuario:', err)
        this.error = 'Error al eliminar el usuario'
        throw err
      } finally {
        this.loading = false
      }
    },

    // --------------------  PROMOVER A ADMIN  --------------------
    async promoteToAdmin(userId: string) {
      return this.updateUserRole(userId, true)
    },

    // --------------------  QUITAR ADMIN  --------------------
    async demoteFromAdmin(userId: string) {
      return this.updateUserRole(userId, false)
    },

    // --------------------  LIMPIAR ERROR  --------------------
    clearError() {
      this.error = null
    }
  }
})
