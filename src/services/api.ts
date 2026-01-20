const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const TOKEN_KEY = 'auth_token'

export class ApiError extends Error {
  status: number
  data?: unknown

  constructor(message: string, status: number, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  skipAuth?: boolean
}

let onUnauthorized: (() => void) | null = null

export function setOnUnauthorized(callback: () => void): void {
  onUnauthorized = callback
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    if (response.status === 401) {
      clearToken()
      onUnauthorized?.()
    }

    let errorData: unknown
    try {
      errorData = await response.json()
    } catch {
      errorData = await response.text()
    }
    throw new ApiError(
      `HTTP error ${response.status}`,
      response.status,
      errorData
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, headers, skipAuth, ...restOptions } = options

  const token = getToken()
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (!skipAuth && token) {
    requestHeaders['Authorization'] = `Bearer ${token}`
  }

  if (headers) {
    Object.assign(requestHeaders, headers)
  }

  const config: RequestInit = {
    ...restOptions,
    headers: requestHeaders,
  }

  if (body !== undefined) {
    config.body = JSON.stringify(body)
  }

  const url = `${API_BASE_URL}${endpoint}`
  const response = await fetch(url, config)

  return handleResponse<T>(response)
}

export const api = {
  get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'GET' })
  },

  post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'POST', body })
  },

  put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'PUT', body })
  },

  delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'DELETE' })
  },
}
