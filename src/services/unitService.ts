import { units, getUnitSizeMetrics } from '../data/mockData'
import type { Unit, UnitSizeMetrics } from '../data/types'

export const unitService = {
  getUnits(): Promise<Unit[]> {
    return Promise.resolve(units)
  },

  getUnitById(id: string): Promise<Unit> {
    const unit = units.find(u => u.id === id)
    if (!unit) {
      return Promise.reject(new Error(`Unit with id ${id} not found`))
    }
    return Promise.resolve(unit)
  },

  getUnitMetrics(): Promise<UnitSizeMetrics[]> {
    return Promise.resolve(getUnitSizeMetrics())
  },
}
