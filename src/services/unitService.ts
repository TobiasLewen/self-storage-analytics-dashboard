import { units, getUnitSizeMetrics } from '../data/mockData'
import type { Unit, UnitSizeMetrics } from '../data/types'

export const unitService = {
  getUnits(): Promise<Unit[]> {
    // Simulate network delay for better loading state testing
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(units)
      }, 100)
    })
  },

  getUnitById(id: string): Promise<Unit> {
    // Simulate network delay for better loading state testing
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const unit = units.find(u => u.id === id)
        if (!unit) {
          reject(new Error(`Unit with id ${id} not found`))
        } else {
          resolve(unit)
        }
      }, 100)
    })
  },

  getUnitMetrics(): Promise<UnitSizeMetrics[]> {
    // Simulate network delay for better loading state testing
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getUnitSizeMetrics())
      }, 100)
    })
  },
}
