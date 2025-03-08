import { useFireproof } from 'use-fireproof'
import { fireproof } from '@fireproof/core'
import type { Transaction, Category, Account, Budget } from '@/types'
import { DocBase } from 'use-fireproof'

// Initialize the database
export const db = fireproof('spendsage')

// Map functions for queries
const byType = (doc: DocBase & { type: string }) => {
  if (doc.type) {
    return [[doc.type]]
  }
  return []
}

const byTypeAndDate = (doc: DocBase & { type: string; date?: string }) => {
  if (doc.type === 'transaction' && doc.date) {
    return [[doc.type, new Date(doc.date).getTime()]]
  }
  return [[doc.type]]
}

const byCategory = (doc: DocBase & { type: string; category?: string; date?: string }) => {
  if (doc.type === 'transaction' && doc.category && doc.date) {
    return [[doc.category, new Date(doc.date).getTime()]]
  }
  return []
}

const byAccount = (doc: DocBase & { type: string; account?: string; date?: string }) => {
  if (doc.type === 'transaction' && doc.account && doc.date) {
    return [[doc.account, new Date(doc.date).getTime()]]
  }
  return []
}

// React hooks for data access
export function useTransactions() {
  const { useLiveQuery } = useFireproof(db)
  return useLiveQuery(byTypeAndDate, { key: ['transaction'], descending: true })
}

export function useTransactionsByDateRange(startDate: Date, endDate: Date) {
  const { useLiveQuery } = useFireproof(db)
  return useLiveQuery(byTypeAndDate, {
    range: [
      ['transaction', startDate.getTime()],
      ['transaction', endDate.getTime()]
    ]
  })
}

export function useTransactionsByCategory(category: string) {
  const { useLiveQuery } = useFireproof(db)
  return useLiveQuery(byCategory, { key: [category], descending: true })
}

export function useTransactionsByAccount(account: string) {
  const { useLiveQuery } = useFireproof(db)
  return useLiveQuery(byAccount, { key: [account], descending: true })
}

export function useCategories() {
  const { useLiveQuery } = useFireproof(db)
  return useLiveQuery(byType, { key: ['category'] })
}

export function useAccounts() {
  const { useLiveQuery } = useFireproof(db)
  return useLiveQuery(byType, { key: ['account'] })
}

export function useBudgets() {
  const { useLiveQuery } = useFireproof(db)
  return useLiveQuery(byType, { key: ['budget'] })
}

// Helper function to generate IDs
export function generateId(type: string): string {
  return `${type}:${new Date().toISOString()}`
}

// Document manipulation functions
export async function addDocument<T extends DocBase>(
  data: Omit<T, '_id' | 'createdAt' | 'updatedAt'> & { type: string }
): Promise<T> {
  const now = new Date().toISOString()
  const doc = {
    _id: generateId(data.type),
    ...data,
    createdAt: now,
    updatedAt: now,
  }
  const result = await db.put(doc)
  return { ...doc, _id: result.id } as unknown as T
}

export async function updateDocument<T extends DocBase>(
  id: string,
  data: Partial<Omit<T, '_id' | 'type' | 'createdAt' | 'updatedAt'>>
): Promise<T> {
  const doc = await db.get(id) as T
  if (!doc) throw new Error('Document not found')
  
  const updated = {
    ...doc,
    ...data,
    updatedAt: new Date().toISOString(),
  } as T
  const result = await db.put(updated)
  return { ...updated, _id: result.id } as T
}

export async function deleteDocument(id: string): Promise<void> {
  const doc = await db.get(id)
  if (!doc) throw new Error('Document not found')
  await db.del(doc._id)
}

// Typed helper functions
export const addTransaction = (data: Omit<Transaction, '_id' | 'createdAt' | 'updatedAt'>) => 
  addDocument<Transaction>({ ...data, type: 'transaction' })

export const updateTransaction = (id: string, data: Partial<Omit<Transaction, '_id' | 'type' | 'createdAt' | 'updatedAt'>>) =>
  updateDocument<Transaction>(id, data)

export const addCategory = (data: Omit<Category, '_id' | 'type' | 'createdAt' | 'updatedAt'>) =>
  addDocument<Category>({ ...data, type: 'category' })

export const addAccount = (data: Omit<Account, '_id' | 'type' | 'createdAt' | 'updatedAt'>) =>
  addDocument<Account>({ ...data, type: 'account' })

export const addBudget = (data: Omit<Budget, '_id' | 'type' | 'createdAt' | 'updatedAt'>) =>
  addDocument<Budget>({ ...data, type: 'budget' })

export const updateAccount = (id: string, data: Partial<Account>) =>
  updateDocument<Account>(id, data)

export const deleteAccount = (id: string) =>
  deleteDocument(id)

export const updateCategory = (id: string, data: Partial<Category>) =>
  updateDocument<Category>(id, data)

export const deleteCategory = (id: string) =>
  deleteDocument(id) 