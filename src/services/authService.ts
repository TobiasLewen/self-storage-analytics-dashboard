import { api } from './api'
import type { AuthResponse, LoginCredentials, User } from '@/data/types'

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/login', credentials, { skipAuth: true })
  },

  async logout(): Promise<void> {
    return api.post('/auth/logout')
  },

  async getCurrentUser(): Promise<User> {
    return api.get<User>('/auth/me')
  },
}
