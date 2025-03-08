import { useEffect, useState } from 'react'
import { db } from '@/lib/store'
import type { Transaction, Category, Account, Budget } from '@/types'

type QueryKey = [string, ...any[]]

export function useTransactions(startDate?: Date, endDate?: Date) {
  const [docs, setDocs] = useState<Transaction[]>([])

  useEffect(() => {
    const loadData = async () => {
      const query = startDate && endDate
        ? {
            range: [
              ['transaction', startDate.getTime()] as QueryKey,
              ['transaction', endDate.getTime()] as QueryKey
            ]
          }
        : { key: ['transaction'] as QueryKey }

      const result = await db.query('by_type_and_date', query)
      setDocs(result.rows.map(row => row.doc as Transaction))
    }

    loadData()

    // Set up live updates
    const unsubscribe = db.subscribe(() => {
      loadData()
    })

    return () => {
      unsubscribe()
    }
  }, [startDate, endDate])

  return { docs }
}

export function useCategories() {
  const [docs, setDocs] = useState<Category[]>([])

  useEffect(() => {
    const loadData = async () => {
      const result = await db.query('by_type_and_date', { key: ['category'] as QueryKey })
      setDocs(result.rows.map(row => row.doc as Category))
    }

    loadData()

    // Set up live updates
    const unsubscribe = db.subscribe(() => {
      loadData()
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return { docs }
}

export function useAccounts() {
  const [docs, setDocs] = useState<Account[]>([])

  useEffect(() => {
    const loadData = async () => {
      const result = await db.query('by_type_and_date', { key: ['account'] as QueryKey })
      setDocs(result.rows.map(row => row.doc as Account))
    }

    loadData()

    // Set up live updates
    const unsubscribe = db.subscribe(() => {
      loadData()
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return { docs }
}

export function useBudgets() {
  const [docs, setDocs] = useState<Budget[]>([])

  useEffect(() => {
    const loadData = async () => {
      const result = await db.query('by_type_and_date', { key: ['budget'] as QueryKey })
      setDocs(result.rows.map(row => row.doc as Budget))
    }

    loadData()

    // Set up live updates
    const unsubscribe = db.subscribe(() => {
      loadData()
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return { docs }
} 