import { customers, getCustomerSegments } from '../data/mockData'
import type { Customer, CustomerSegment } from '../data/types'

export const customerService = {
  getCustomers(): Promise<Customer[]> {
    // Simulate network delay for better loading state testing
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(customers)
      }, 100)
    })
  },

  getCustomerById(id: string): Promise<Customer> {
    // Simulate network delay for better loading state testing
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const customer = customers.find(c => c.id === id)
        if (!customer) {
          reject(new Error(`Customer with id ${id} not found`))
        } else {
          resolve(customer)
        }
      }, 100)
    })
  },

  getCustomerSegments(): Promise<CustomerSegment[]> {
    // Simulate network delay for better loading state testing
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getCustomerSegments())
      }, 100)
    })
  },
}
