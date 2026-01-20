import { api } from './api'
import type { AuthResponse, LoginCredentials, User } from '@/data/types'

const USE_MOCK_AUTH = true

const MOCK_USER: User = {
  id: '1',
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'admin',
}

const MOCK_TOKEN = 'mock-jwt-token-for-testing'

const MOCK_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'password123',
}

async function mockDelay(ms: number = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (USE_MOCK_AUTH) {
      await mockDelay()
      if (
        credentials.email === MOCK_CREDENTIALS.email &&
        credentials.password === MOCK_CREDENTIALS.password
      ) {
        return { user: MOCK_USER, token: MOCK_TOKEN }
      }
      throw new Error('Invalid email or password')
    }
    return api.post<AuthResponse>('/auth/login', credentials, { skipAuth: true })
  },

  async logout(): Promise<void> {
    if (USE_MOCK_AUTH) {
      await mockDelay(200)
      return
    }
    return api.post('/auth/logout')
  },

  async getCurrentUser(): Promise<User> {
    if (USE_MOCK_AUTH) {
      await mockDelay(300)
      return MOCK_USER
    }
    return api.get<User>('/auth/me')
  },
}
