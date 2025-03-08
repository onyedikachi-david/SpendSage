import { DocBase } from 'use-fireproof'

export interface BaseDocument {
  _id: string
  type: string
  createdAt: string
  updatedAt: string
}

export interface Transaction extends DocBase {
  type: 'transaction'
  date: string
  amount: number
  category: string
  subcategory?: string
  account: string
  description: string
  tags?: string[]
  isExpense: boolean
  createdAt: string
  updatedAt: string
}

export interface Category extends DocBase {
  type: 'category'
  name: string
  color: string
  icon: string
  parent: string | null
  subcategories?: string[]
  createdAt: string
  updatedAt: string
}

export interface Account extends DocBase {
  type: 'account'
  name: string
  initialBalance: number
  icon: string
  color: string
  createdAt: string
  updatedAt: string
}

export interface Budget extends DocBase {
  type: 'budget'
  category: string
  amount: number
  period: string // Format: YYYY-MM
  createdAt: string
  updatedAt: string
}

export type DocumentTypes = Transaction | Category | Account | Budget 