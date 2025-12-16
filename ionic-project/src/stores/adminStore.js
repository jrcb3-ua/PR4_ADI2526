import { defineStore } from 'pinia'
import { pb } from '@/backend/config/pb'

export const useAdminStore = defineStore('adminStore', {
  state: () => ({
    users: [],
    loading: false,
    error: null
  }),

  getters: {
    // Getter para usuarios normales (no admin)
    regularUsers: (state) => state.users.filter(user => !user.admin),
    
    // Getter para usuarios administradores
    adminUsers: (state) => state.users.filter(user => user.admin),
    
    // Getter para contar usuarios
    totalUsers: (state) => state.users.length,
    totalRegularUsers: (state) => state.regularUsers.length,
    totalAdminUsers: (state) => state.adminUsers.length
  },

  actions: {
    // --------------------  CARGAR TODOS LOS USUARIOS  --------------------
    async getUsers() {
      try {
        this.loading = true
        this.error = null

        this.users = await pb.collection('users').getFullList({
          sort: '-created'
        })

        return this.users
      } catch (err) {
        console.error("Error cargando usuarios:", err)
        this.error = "Error al cargar los usuarios"
        throw err
      } finally {
        this.loading = false
      }
    },

    // --------------------  ACTUALIZAR ROL DE USUARIO  --------------------
    async updateUserRole(userId, isAdmin) {
      try {
        this.loading = true
        this.error = null

        const updatedUser = await pb.collection('users').update(userId, {
          admin: isAdmin
        })

        // Actualizar en el estado local
        const index = this.users.findIndex(user => user.id === userId)
        if (index !== -1) {
          this.users[index] = updatedUser
        }

        return updatedUser
      } catch (err) {
        console.error("Error actualizando rol de usuario:", err)
        this.error = "Error al actualizar el rol del usuario"
        throw err
      } finally {
        this.loading = false
      }
    },

    // --------------------  ELIMINAR USUARIO  --------------------
    async deleteUser(userId) {
      try {
        this.loading = true
        this.error = null

        await pb.collection('users').delete(userId)

        // Eliminar del estado local
        this.users = this.users.filter(user => user.id !== userId)

      } catch (err) {
        console.error("Error eliminando usuario:", err)
        this.error = "Error al eliminar el usuario"
        throw err
      } finally {
        this.loading = false
      }
    },

    // --------------------  PROMOVER A ADMIN  --------------------
    async promoteToAdmin(userId) {
      return await this.updateUserRole(userId, true)
    },

    // --------------------  QUITAR ADMIN  --------------------
    async demoteFromAdmin(userId) {
      return await this.updateUserRole(userId, false)
    },

    // --------------------  LIMPIAR ERROR  --------------------
    clearError() {
      this.error = null
    }
  }
})