import { ApiError } from '@/services/api'

export interface ParsedError {
  title: string
  message: string
  isNetworkError: boolean
  isAuthError: boolean
  statusCode?: number
}

export function parseError(error: unknown): ParsedError {
  if (error instanceof ApiError) {
    const isAuthError = error.status === 401 || error.status === 403

    if (error.status === 401) {
      return {
        title: 'Authentication Required',
        message: 'Please log in to continue.',
        isNetworkError: false,
        isAuthError: true,
        statusCode: error.status,
      }
    }

    if (error.status === 403) {
      return {
        title: 'Access Denied',
        message: 'You do not have permission to perform this action.',
        isNetworkError: false,
        isAuthError: true,
        statusCode: error.status,
      }
    }

    if (error.status === 404) {
      return {
        title: 'Not Found',
        message: 'The requested resource could not be found.',
        isNetworkError: false,
        isAuthError: false,
        statusCode: error.status,
      }
    }

    if (error.status === 422) {
      return {
        title: 'Validation Error',
        message: getValidationMessage(error.data) || 'Please check your input and try again.',
        isNetworkError: false,
        isAuthError: false,
        statusCode: error.status,
      }
    }

    if (error.status >= 500) {
      return {
        title: 'Server Error',
        message: 'Something went wrong on our end. Please try again later.',
        isNetworkError: false,
        isAuthError: false,
        statusCode: error.status,
      }
    }

    return {
      title: 'Request Failed',
      message: getErrorMessage(error.data) || error.message,
      isNetworkError: false,
      isAuthError: isAuthError,
      statusCode: error.status,
    }
  }

  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return {
      title: 'Connection Error',
      message: 'Unable to connect to the server. Please check your internet connection.',
      isNetworkError: true,
      isAuthError: false,
    }
  }

  if (error instanceof Error) {
    return {
      title: 'Error',
      message: error.message,
      isNetworkError: false,
      isAuthError: false,
    }
  }

  return {
    title: 'Unknown Error',
    message: 'An unexpected error occurred. Please try again.',
    isNetworkError: false,
    isAuthError: false,
  }
}

function getErrorMessage(data: unknown): string | null {
  if (!data) return null

  if (typeof data === 'string') return data

  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>
    if (typeof obj.message === 'string') return obj.message
    if (typeof obj.error === 'string') return obj.error
  }

  return null
}

function getValidationMessage(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null

  const obj = data as Record<string, unknown>

  if (Array.isArray(obj.errors)) {
    return obj.errors.map((e) => (typeof e === 'string' ? e : String(e))).join(', ')
  }

  if (typeof obj.errors === 'object' && obj.errors !== null) {
    const errors = obj.errors as Record<string, string[]>
    return Object.values(errors).flat().join(', ')
  }

  return getErrorMessage(data)
}
