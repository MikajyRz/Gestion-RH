import { backendClient } from './backend/backendClient'

const BACKOFFICE_AUTH_KEY = 'backoffice_auth'
const BACKOFFICE_USER_KEY = 'backoffice_user'

export const backofficeAuthService = {
  // Connecter l'utilisateur via l'API Spring Boot et la table utilisateurs
  login: async (email, motdepasse) => {
    try {
      const response = await backendClient.post('/api/auth/login', { email, motdepasse })
      localStorage.setItem(BACKOFFICE_AUTH_KEY, 'true')
      localStorage.setItem(BACKOFFICE_USER_KEY, JSON.stringify(response.data))
      return response.data
    } catch (error) {
      throw new Error(error.response?.data || error.message || 'Email ou mot de passe incorrect')
    }
  },

  logout: () => {
    localStorage.removeItem(BACKOFFICE_AUTH_KEY)
    localStorage.removeItem(BACKOFFICE_USER_KEY)
  },

  // Vérifie si connecté ou non
  isAuthenticated: () => {
    return localStorage.getItem(BACKOFFICE_AUTH_KEY) === 'true'
  },

  getUser: () => {
    const userStr = localStorage.getItem(BACKOFFICE_USER_KEY)
    return userStr ? JSON.parse(userStr) : null
  },
}