import { useState, useEffect } from 'react'
import { customerService } from '../services/customerService'
import type { Customer, CustomerSegment } from '../data/types'

interface UseCustomersResult {
  customers: Customer[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

export function useCustomers(): UseCustomersResult {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchCustomers = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await customerService.getCustomers()
      setCustomers(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch customers'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  return { customers, isLoading, error, refetch: fetchCustomers }
}

interface UseCustomerSegmentsResult {
  segments: CustomerSegment[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

export function useCustomerSegments(): UseCustomerSegmentsResult {
  const [segments, setSegments] = useState<CustomerSegment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchSegments = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await customerService.getCustomerSegments()
      setSegments(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch customer segments'))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSegments()
  }, [])

  return { segments, isLoading, error, refetch: fetchSegments }
}
