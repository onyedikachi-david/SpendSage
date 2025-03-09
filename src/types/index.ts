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
  account: string
  description: string
  isExpense: boolean
  tags?: string[]
  subcategory?: string
}

export interface Category extends DocBase {
  type: 'category'
  name: string
  color: string
  icon: string
  parent: string | null
  subcategories?: string[]
}

export interface Account extends DocBase {
  type: 'account'
  name: string
  initialBalance: number
  icon: string
  color: string
}

export interface Budget extends DocBase {
  type: 'budget'
  category: string
  amount: number
  period: string // Format: YYYY-MM
}

export type DocumentTypes = Transaction | Category | Account | Budget 