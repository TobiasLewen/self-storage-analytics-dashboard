import { customers, getCustomerSegments } from '../data/mockData'
import type { Customer, CustomerSegment } from '../data/types'

export const customerService = {
  getCustomers(): Promise<Customer[]> {
    return Promise.resolve(customers)
  },

  getCustomerById(id: string): Promise<Customer> {
    const customer = customers.find(c => c.id === id)
    if (!customer) {
      return Promise.reject(new Error(`Customer with id ${id} not found`))
    }
    return Promise.resolve(customer)
  },

  getCustomerSegments(): Promise<CustomerSegment[]> {
    return Promise.resolve(getCustomerSegments())
  },
}
