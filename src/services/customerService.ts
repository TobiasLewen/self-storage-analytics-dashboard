import { api } from './api'
import type { Customer, CustomerSegment } from '../data/types'

export const customerService = {
  getCustomers(): Promise<Customer[]> {
    return api.get<Customer[]>('/customers')
  },

  getCustomerById(id: string): Promise<Customer> {
    return api.get<Customer>(`/customers/${id}`)
  },

  getCustomerSegments(): Promise<CustomerSegment[]> {
    return api.get<CustomerSegment[]>('/customers/segments')
  },
}
