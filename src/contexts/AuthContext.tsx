import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { LoginCredentials, User } from '@/data/types'
import { authService } from '@/services/authService'
import { clearToken, getToken, setOnUnauthorized, setToken } from '@/services/api'

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  useEffect(() => {
    setOnUnauthorized(logout)
  }, [logout])

  useEffect(() => {
    async function validateToken() {
      const token = getToken()
      if (!token) {
        setIsLoading(false)
        return
      }

      try {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
      } catch {
        clearToken()
      } finally {
        setIsLoading(false)
      }
    }

    validateToken()
  }, [])

  const login = async (credentials: LoginCredentials): Promise<void> => {
    const response = await authService.login(credentials)
    setToken(response.token)
    setUser(response.user)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
