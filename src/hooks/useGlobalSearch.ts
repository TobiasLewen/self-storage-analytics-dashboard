import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCustomers } from './useCustomers'
import { useUnits } from './useUnits'

export interface SearchResult {
  id: string
  title: string
  description: string
  type: 'page' | 'customer' | 'unit'
  icon: string
  action: () => void
}

export function useGlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const navigate = useNavigate()
  
  const { customers } = useCustomers()
  const { units } = useUnits()

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const searchQuery = query.toLowerCase()
    const newResults: SearchResult[] = []

    // Search pages
    const pages = [
      {
        id: 'executive',
        title: 'Executive Overview',
        description: 'Dashboard Übersicht und KPIs',
        path: '/',
        icon: '📊',
      },
      {
        id: 'units',
        title: 'Unit Performance',
        description: 'Einheiten-Leistungsanalyse',
        path: '/units',
        icon: '📦',
      },
      {
        id: 'customers',
        title: 'Customer Analytics',
        description: 'Kundenanalyse und Segmentierung',
        path: '/customers',
        icon: '👥',
      },
      {
        id: 'forecast',
        title: 'Forecast',
        description: 'Umsatzprognosen',
        path: '/forecast',
        icon: '📈',
      },
      {
        id: 'settings',
        title: 'Settings',
        description: 'Anwendungseinstellungen',
        path: '/settings',
        icon: '⚙️',
      },
    ]

    pages.forEach((page) => {
      if (
        page.title.toLowerCase().includes(searchQuery) ||
        page.description.toLowerCase().includes(searchQuery)
      ) {
        newResults.push({
          id: page.id,
          title: page.title,
          description: page.description,
          type: 'page',
          icon: page.icon,
          action: () => navigate(page.path),
        })
      }
    })

    // Search customers
    if (customers) {
      customers
        .filter(
          (customer) =>
            customer.name.toLowerCase().includes(searchQuery) ||
            customer.id.toLowerCase().includes(searchQuery)
        )
        .slice(0, 5)
        .forEach((customer) => {
          newResults.push({
            id: customer.id,
            title: customer.name,
            description: `${customer.type === 'business' ? 'Geschäftskunde' : 'Privatkunde'} • ${customer.unitIds.length} Einheit(en)`,
            type: 'customer',
            icon: customer.type === 'business' ? '🏢' : '👤',
            action: () => navigate('/customers'),
          })
        })
    }

    // Search units
    if (units) {
      units
        .filter(
          (unit) =>
            unit.id.toLowerCase().includes(searchQuery) ||
            unit.size.toLowerCase().includes(searchQuery)
        )
        .slice(0, 5)
        .forEach((unit) => {
          newResults.push({
            id: unit.id,
            title: `Einheit ${unit.id}`,
            description: `${unit.size} • ${unit.isOccupied ? 'Belegt' : 'Verfügbar'} • €${unit.pricePerMonth}/Monat`,
            type: 'unit',
            icon: unit.isOccupied ? '🔒' : '🔓',
            action: () => navigate('/units'),
          })
        })
    }

    setResults(newResults)
  }, [query, customers, units, navigate])

  return {
    query,
    setQuery,
    results,
  }
}
