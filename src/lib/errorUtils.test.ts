import { describe, it, expect } from 'vitest'
import { parseError } from './errorUtils'
import { ApiError } from '@/services/api'

describe('parseError', () => {
  it('handles 401 unauthorized error', () => {
    const error = new ApiError('Unauthorized', 401)
    const result = parseError(error)

    expect(result.title).toBe('Authentication Required')
    expect(result.message).toBe('Please log in to continue.')
    expect(result.isAuthError).toBe(true)
    expect(result.statusCode).toBe(401)
  })

  it('handles 403 forbidden error', () => {
    const error = new ApiError('Forbidden', 403)
    const result = parseError(error)

    expect(result.title).toBe('Access Denied')
    expect(result.message).toBe('You do not have permission to perform this action.')
    expect(result.isAuthError).toBe(true)
    expect(result.statusCode).toBe(403)
  })

  it('handles 404 not found error', () => {
    const error = new ApiError('Not Found', 404)
    const result = parseError(error)

    expect(result.title).toBe('Not Found')
    expect(result.message).toBe('The requested resource could not be found.')
    expect(result.isAuthError).toBe(false)
    expect(result.statusCode).toBe(404)
  })

  it('handles 422 validation error with message', () => {
    const error = new ApiError('Validation Error', 422, { message: 'Email is invalid' })
    const result = parseError(error)

    expect(result.title).toBe('Validation Error')
    expect(result.message).toBe('Email is invalid')
    expect(result.statusCode).toBe(422)
  })

  it('handles 422 validation error with errors array', () => {
    const error = new ApiError('Validation Error', 422, {
      errors: ['Email is required', 'Password is too short'],
    })
    const result = parseError(error)

    expect(result.title).toBe('Validation Error')
    expect(result.message).toBe('Email is required, Password is too short')
  })

  it('handles 500 server error', () => {
    const error = new ApiError('Internal Server Error', 500)
    const result = parseError(error)

    expect(result.title).toBe('Server Error')
    expect(result.message).toBe('Something went wrong on our end. Please try again later.')
    expect(result.statusCode).toBe(500)
  })

  it('handles network error (Failed to fetch)', () => {
    const error = new TypeError('Failed to fetch')
    const result = parseError(error)

    expect(result.title).toBe('Connection Error')
    expect(result.message).toBe('Unable to connect to the server. Please check your internet connection.')
    expect(result.isNetworkError).toBe(true)
  })

  it('handles generic Error', () => {
    const error = new Error('Something went wrong')
    const result = parseError(error)

    expect(result.title).toBe('Error')
    expect(result.message).toBe('Something went wrong')
  })

  it('handles unknown error types', () => {
    const error = 'Some string error'
    const result = parseError(error)

    expect(result.title).toBe('Unknown Error')
    expect(result.message).toBe('An unexpected error occurred. Please try again.')
  })

  it('handles null error', () => {
    const result = parseError(null)

    expect(result.title).toBe('Unknown Error')
    expect(result.message).toBe('An unexpected error occurred. Please try again.')
  })

  it('extracts error message from data.error', () => {
    const error = new ApiError('Bad Request', 400, { error: 'Custom error message' })
    const result = parseError(error)

    expect(result.message).toBe('Custom error message')
  })
})
