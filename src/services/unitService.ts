import { api } from './api'
import type { Unit, UnitSizeMetrics } from '../data/types'

export const unitService = {
  getUnits(): Promise<Unit[]> {
    return api.get<Unit[]>('/units')
  },

  getUnitById(id: string): Promise<Unit> {
    return api.get<Unit>(`/units/${id}`)
  },

  getUnitMetrics(): Promise<UnitSizeMetrics[]> {
    return api.get<UnitSizeMetrics[]>('/units/metrics')
  },
}
