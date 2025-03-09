import { parse } from 'papaparse'
import type { Transaction, Category, Account, Budget } from '@/types'
import { addTransaction, addCategory, addAccount, addBudget } from '@/lib/store'

type DocumentType = 'transaction' | 'category' | 'account' | 'budget'

interface CSVImportResult {
  successful: number
  failed: number
  errors: string[]
}

type CSVRow = Record<string, string>

// Validate and transform CSV data based on document type
const validateAndTransform = (
  data: CSVRow,
  type: DocumentType
): Omit<Transaction, '_id' | 'createdAt' | 'updatedAt'> | 
   Omit<Category, '_id' | 'createdAt' | 'updatedAt'> | 
   Omit<Account, '_id' | 'createdAt' | 'updatedAt'> | 
   Omit<Budget, '_id' | 'createdAt' | 'updatedAt'> | null => {
  try {
    switch (type) {
      case 'transaction': {
        const transaction: Omit<Transaction, '_id' | 'createdAt' | 'updatedAt'> = {
          type: 'transaction',
          date: new Date(data.date).toISOString(),
          amount: parseFloat(data.amount),
          category: data.category,
          account: data.account,
          description: data.description || '',
          isExpense: data.isExpense === 'true',
          tags: data.tags ? data.tags.split(',').map((t: string) => t.trim()) : undefined,
          subcategory: data.subcategory || undefined,
        }
        return transaction
      }
      case 'category': {
        const category: Omit<Category, '_id' | 'createdAt' | 'updatedAt'> = {
          type: 'category',
          name: data.name,
          color: data.color || '#2196F3',
          icon: data.icon || 'folder',
          parent: null,
        }
        return category
      }
      case 'account': {
        const account: Omit<Account, '_id' | 'createdAt' | 'updatedAt'> = {
          type: 'account',
          name: data.name,
          initialBalance: parseFloat(data.initialBalance || '0'),
          icon: data.icon || 'bank',
          color: data.color || '#2196F3',
        }
        return account
      }
      case 'budget': {
        const budget: Omit<Budget, '_id' | 'createdAt' | 'updatedAt'> = {
          type: 'budget',
          category: data.category,
          amount: parseFloat(data.amount),
          period: data.period,
        }
        return budget
      }
      default:
        return null
    }
  } catch {
    return null
  }
}

// Import CSV data
export const importCSV = async (
  file: File,
  type: DocumentType
): Promise<CSVImportResult> => {
  return new Promise((resolve, reject) => {
    const result: CSVImportResult = {
      successful: 0,
      failed: 0,
      errors: [],
    }

    parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async ({ data }) => {
        try {
          for (const row of data) {
            const transformedData = validateAndTransform(row, type)
            
            if (!transformedData) {
              result.failed++
              result.errors.push(`Failed to validate row: ${JSON.stringify(row)}`)
              continue
            }

            try {
              switch (type) {
                case 'transaction':
                  await addTransaction(transformedData as Omit<Transaction, '_id' | 'createdAt' | 'updatedAt'>)
                  break
                case 'category':
                  await addCategory(transformedData as Omit<Category, '_id' | 'createdAt' | 'updatedAt'>)
                  break
                case 'account':
                  await addAccount(transformedData as Omit<Account, '_id' | 'createdAt' | 'updatedAt'>)
                  break
                case 'budget':
                  await addBudget(transformedData as Omit<Budget, '_id' | 'createdAt' | 'updatedAt'>)
                  break
              }
              result.successful++
            } catch {
              result.failed++
              result.errors.push(`Failed to import row: ${JSON.stringify(row)}`)
            }
          }
          resolve(result)
        } catch {
          reject(new Error('Failed to process CSV file'))
        }
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV file: ${error}`))
      },
    })
  })
}

// Generate sample CSV content for each type
export const generateSampleCSV = (type: DocumentType): string => {
  switch (type) {
    case 'transaction':
      return 'date,amount,category,account,description,isExpense,tags,subcategory\n' +
        '2024-03-15,45.67,Food,Checking,Grocery shopping,true,"essential,groceries",Groceries\n' +
        '2024-03-16,1200.00,Salary,Savings,Monthly salary,false,"income,salary",\n' +
        '2024-03-17,89.99,Shopping,Credit Card,New shoes,true,"clothing",Shoes'

    case 'category':
      return 'name,color,icon\n' +
        'Food,#4CAF50,utensils\n' +
        'Transport,#2196F3,car\n' +
        'Shopping,#9C27B0,shopping-bag'

    case 'account':
      return 'name,initialBalance,icon,color\n' +
        'Checking,1000,bank,#2196F3\n' +
        'Savings,5000,piggy-bank,#4CAF50\n' +
        'Credit Card,0,credit-card,#F44336'

    case 'budget':
      return 'category,amount,period\n' +
        'Food,500,2024-03\n' +
        'Transport,300,2024-03\n' +
        'Shopping,400,2024-03'

    default:
      return ''
  }
} 