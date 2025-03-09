import { useFireproof } from 'use-fireproof'
import { fireproof } from '@fireproof/core'
import type { Transaction, Category, Account, Budget } from '@/types'
import { DocBase } from 'use-fireproof'
import { format } from 'date-fns'

// Initialize the database
export const db = fireproof('spendsage')

// React hooks for data access
export function useCategories() {
  const { useLiveQuery } = useFireproof(db)
  const result = useLiveQuery('type', { 
    key: 'category',
    includeDocs: true,
    descending: true
  })
  console.log('Categories query result:', result);
  return { docs: result.docs as Category[] }
}

export function useAccounts() {
  const { useLiveQuery } = useFireproof(db)
  const result = useLiveQuery('type', { 
    key: 'account',
    includeDocs: true,
    descending: true
  })
  console.log('Accounts query result:', result);
  return { docs: result.docs as Account[] }
}

export function useTransactions() {
  const { useLiveQuery } = useFireproof(db)
  const result = useLiveQuery('type', { 
    key: 'transaction',
    includeDocs: true,
    descending: true 
  })
  console.log('Transactions query result:', result);
  return { docs: result.docs as Transaction[] }
}

export function useTransactionsByDateRange(startDate: Date, endDate: Date) {
  const { useLiveQuery } = useFireproof(db)
  const result = useLiveQuery(
    (doc: Transaction) => doc.type === 'transaction' ? [doc.type, new Date(doc.date).getTime()] : null,
    {
      range: [
        ['transaction', startDate.getTime()],
        ['transaction', endDate.getTime()]
      ],
      includeDocs: true
    }
  )
  console.log('Transactions by date range query result:', result);
  return { docs: result.docs as Transaction[] }
}

export function useTransactionsByCategory(category: string) {
  const { useLiveQuery } = useFireproof(db)
  const result = useLiveQuery(
    (doc: Transaction) => doc.type === 'transaction' ? [doc.category, new Date(doc.date).getTime()] : null,
    { 
      key: [category],
      includeDocs: true,
      descending: true 
    }
  )
  console.log('Transactions by category query result:', result);
  return { docs: result.docs as Transaction[] }
}

export function useTransactionsByAccount(account: string) {
  const { useLiveQuery } = useFireproof(db)
  const result = useLiveQuery(
    (doc: Transaction) => doc.type === 'transaction' ? [doc.account, new Date(doc.date).getTime()] : null,
    { 
      key: [account],
      includeDocs: true,
      descending: true 
    }
  )
  console.log('Transactions by account query result:', result);
  return { docs: result.docs as Transaction[] }
}

export function useBudgets() {
  const { useLiveQuery } = useFireproof(db)
  const result = useLiveQuery('type', { 
    key: 'budget',
    includeDocs: true,
    descending: true
  })
  console.log('Budgets query result:', result);
  return { docs: result.docs as Budget[] }
}

export function useBudgetsByPeriod(period: string) {
  const { useLiveQuery } = useFireproof(db)
  const result = useLiveQuery(
    (doc: Budget) => doc.type === 'budget' ? [doc.period] : null,
    { 
      key: [period],
      includeDocs: true
    }
  )
  console.log('Budgets by period query result:', result);
  return { docs: result.docs as Budget[] }
}

// Helper function to generate IDs
export function generateId(type: string): string {
  return `${type}:${new Date().toISOString()}`
}

// Helper function to remove undefined values from an object
function removeUndefined<T>(obj: T): T {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.filter(item => item !== undefined)
              .map(item => removeUndefined(item)) as T;
  }

  const result = {} as T;
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key as keyof T] = typeof value === 'object' 
        ? removeUndefined(value)
        : value;
    }
  }
  return result;
}

// Document manipulation functions
export async function addDocument<T extends DocBase>(
  data: Omit<T, '_id' | 'createdAt' | 'updatedAt'> & { type: string }
): Promise<T> {
  const now = new Date().toISOString()
  const { type, ...rest } = data
  
  // Remove any undefined values before storing
  const cleanData = removeUndefined(rest);
  
  const doc = {
    _id: generateId(type),
    type,
    ...cleanData,
    createdAt: now,
    updatedAt: now,
  }
  
  console.log('Adding document:', doc);
  const result = await db.put(doc)
  console.log('Add document result:', result);
  return { ...doc, _id: result.id } as unknown as T
}

export async function updateDocument<T extends DocBase>(
  id: string,
  data: Partial<Omit<T, '_id' | 'type' | 'createdAt' | 'updatedAt'>>
): Promise<T> {
  const doc = await db.get(id) as T
  if (!doc) throw new Error('Document not found')
  
  // Remove any undefined values before updating
  const cleanData = removeUndefined(data);
  
  const updated = {
    ...doc,
    ...cleanData,
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

export const updateCategory = (id: string, data: Partial<Omit<Category, '_id' | 'type' | 'createdAt' | 'updatedAt'>>) =>
  updateDocument<Category>(id, data)

export const deleteCategory = (id: string) =>
  deleteDocument(id)

export const addAccount = (data: Omit<Account, '_id' | 'type' | 'createdAt' | 'updatedAt'>) =>
  addDocument<Account>({ ...data, type: 'account' })

export const updateAccount = (id: string, data: Partial<Omit<Account, '_id' | 'type' | 'createdAt' | 'updatedAt'>>) =>
  updateDocument<Account>(id, data)

export const deleteAccount = (id: string) =>
  deleteDocument(id)

export const addBudget = (data: Omit<Budget, '_id' | 'type' | 'createdAt' | 'updatedAt'>) =>
  addDocument<Budget>({ ...data, type: 'budget' })

export const updateBudget = (id: string, data: Partial<Omit<Budget, '_id' | 'type' | 'createdAt' | 'updatedAt'>>) =>
  updateDocument<Budget>(id, data)

export const deleteBudget = (id: string) =>
  deleteDocument(id)

// Function to clear all data from the database
export async function clearDatabase(): Promise<boolean> {
  try {
    console.log('Starting database clear...');
    const allDocs = await db.allDocs();
    console.log('Found documents to delete:', allDocs.rows.length);
    
    // Delete all documents in batches to avoid overwhelming the database
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < allDocs.rows.length; i += batchSize) {
      const batch = allDocs.rows.slice(i, i + batchSize);
      batches.push(batch);
    }
    
    for (const batch of batches) {
      await Promise.all(batch.map(async (row) => {
        try {
          const doc = await db.get(row.key);
          if (doc) {
            await db.del(doc._id);
          }
        } catch (error) {
          console.warn(`Failed to delete document ${row.key}:`, error);
        }
      }));
    }
    
    // Verify deletion
    const remainingDocs = await db.allDocs();
    if (remainingDocs.rows.length > 0) {
      console.warn('Some documents could not be deleted:', remainingDocs.rows.length);
    }
    
    console.log('Database cleared successfully');
    return true;
  } catch (error) {
    console.error('Failed to clear database:', error);
    return false;
  }
}

// Test function to populate database with sample data
export async function populateTestData() {
  try {
    console.log('Starting to populate test data...');

    // Check for existing data and clear if necessary
    const existingDocs = await db.allDocs();
    if (existingDocs.rows.length > 0) {
      console.log('Found existing data, clearing first...');
      await clearDatabase();
      
      // Wait a moment for the database to stabilize
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Add categories with proper error handling
    const categories = [
      { name: 'Food', color: '#4CAF50', icon: 'utensils', parent: null },
      { name: 'Transport', color: '#2196F3', icon: 'car', parent: null },
      { name: 'Shopping', color: '#9C27B0', icon: 'shopping-bag', parent: null },
    ]

    console.log('Adding categories:', categories);
    for (const category of categories) {
      try {
        const result = await addCategory(category);
        console.log('Added category:', result);
      } catch (error) {
        console.error('Failed to add category:', category, error);
      }
    }

    // Add accounts with proper error handling
    const accounts = [
      { name: 'Checking', initialBalance: 1000, icon: 'bank', color: '#2196F3' },
      { name: 'Savings', initialBalance: 5000, icon: 'piggy-bank', color: '#4CAF50' },
      { name: 'Credit Card', initialBalance: 0, icon: 'credit-card', color: '#F44336' },
    ]

    console.log('Adding accounts:', accounts);
    for (const account of accounts) {
      try {
        const result = await addAccount(account);
        console.log('Added account:', result);
      } catch (error) {
        console.error('Failed to add account:', account, error);
      }
    }

    // Add transactions with proper error handling
    const transactions = [
      {
        type: 'transaction' as const,
        date: new Date().toISOString(),
        amount: 45.67,
        category: 'Food',
        account: 'Checking',
        description: 'Grocery shopping',
        isExpense: true,
        tags: ['essential', 'groceries'],
        subcategory: 'Groceries',
      },
      {
        type: 'transaction' as const,
        date: new Date().toISOString(),
        amount: 1200.00,
        category: 'Salary',
        account: 'Savings',
        description: 'Monthly salary',
        isExpense: false,
        tags: ['income', 'salary'],
      },
      {
        type: 'transaction' as const,
        date: new Date().toISOString(),
        amount: 89.99,
        category: 'Shopping',
        account: 'Credit Card',
        description: 'New shoes',
        isExpense: true,
        tags: ['clothing'],
        subcategory: 'Shoes',
      },
    ]

    console.log('Adding transactions:', transactions);
    for (const transaction of transactions) {
      try {
        const result = await addTransaction(transaction);
        console.log('Added transaction:', result);
      } catch (error) {
        console.error('Failed to add transaction:', transaction, error);
      }
    }

    // Add budgets with proper error handling
    const budgets = [
      { category: 'Food', amount: 500, period: format(new Date(), 'yyyy-MM') },
      { category: 'Transport', amount: 300, period: format(new Date(), 'yyyy-MM') },
      { category: 'Shopping', amount: 400, period: format(new Date(), 'yyyy-MM') },
    ]

    console.log('Adding budgets:', budgets);
    for (const budget of budgets) {
      try {
        const result = await addBudget(budget);
        console.log('Added budget:', result);
      } catch (error) {
        console.error('Failed to add budget:', budget, error);
      }
    }

    // Verify data was added
    const allDocs = await db.allDocs();
    console.log('All documents in database:', allDocs);

    return allDocs.rows.length > 0;
  } catch (error) {
    console.error('Failed to populate test data:', error);
    return false;
  }
}

// Import data types
type ImportCategory = Omit<Category, '_id' | 'type' | 'createdAt' | 'updatedAt'>;
type ImportAccount = Omit<Account, '_id' | 'type' | 'createdAt' | 'updatedAt'>;
type ImportTransaction = Omit<Transaction, '_id' | 'type' | 'createdAt' | 'updatedAt'>;
type ImportBudget = Omit<Budget, '_id' | 'type' | 'createdAt' | 'updatedAt'>;

type ValidationError = {
  row: number;
  field: string;
  value: unknown;
  message: string;
}

type ImportResult = {
  success: boolean;
  errors: ValidationError[];
  imported: {
    categories: number;
    accounts: number;
    transactions: number;
    budgets: number;
  };
}

function validateCategory(data: unknown, rowIndex: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const category = data as Partial<ImportCategory>;
  
  if (!category.name?.trim()) {
    errors.push({
      row: rowIndex,
      field: 'name',
      value: category.name,
      message: 'Category name is required'
    });
  }

  if (category.color && !/^#[0-9A-F]{6}$/i.test(category.color)) {
    errors.push({
      row: rowIndex,
      field: 'color',
      value: category.color,
      message: 'Invalid color format. Must be a valid hex color (e.g. #FF0000)'
    });
  }

  return errors;
}

function validateAccount(data: unknown, rowIndex: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const account = data as Partial<ImportAccount>;
  
  if (!account.name?.trim()) {
    errors.push({
      row: rowIndex,
      field: 'name',
      value: account.name,
      message: 'Account name is required'
    });
  }

  if (typeof account.initialBalance !== 'number') {
    errors.push({
      row: rowIndex,
      field: 'initialBalance',
      value: account.initialBalance,
      message: 'Initial balance must be a number'
    });
  }

  return errors;
}

function validateTransaction(data: unknown, rowIndex: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const transaction = data as Partial<ImportTransaction>;
  
  if (!transaction.date) {
    errors.push({
      row: rowIndex,
      field: 'date',
      value: transaction.date,
      message: 'Date is required'
    });
  } else {
    const timestamp = new Date(transaction.date).getTime();
    if (isNaN(timestamp)) {
      errors.push({
        row: rowIndex,
        field: 'date',
        value: transaction.date,
        message: 'Invalid date format'
      });
    }
  }

  if (typeof transaction.amount !== 'number' || isNaN(transaction.amount)) {
    errors.push({
      row: rowIndex,
      field: 'amount',
      value: transaction.amount,
      message: 'Amount must be a valid number'
    });
  }

  if (!transaction.category?.trim()) {
    errors.push({
      row: rowIndex,
      field: 'category',
      value: transaction.category,
      message: 'Category is required'
    });
  }

  if (!transaction.account?.trim()) {
    errors.push({
      row: rowIndex,
      field: 'account',
      value: transaction.account,
      message: 'Account is required'
    });
  }

  if (typeof transaction.isExpense !== 'boolean') {
    errors.push({
      row: rowIndex,
      field: 'isExpense',
      value: transaction.isExpense,
      message: 'isExpense must be true or false'
    });
  }

  return errors;
}

function validateBudget(data: unknown, rowIndex: number): ValidationError[] {
  const errors: ValidationError[] = [];
  const budget = data as Partial<ImportBudget>;
  
  if (!budget.category?.trim()) {
    errors.push({
      row: rowIndex,
      field: 'category',
      value: budget.category,
      message: 'Category is required'
    });
  }

  if (typeof budget.amount !== 'number' || isNaN(budget.amount)) {
    errors.push({
      row: rowIndex,
      field: 'amount',
      value: budget.amount,
      message: 'Amount must be a valid number'
    });
  }

  if (!budget.period?.trim()) {
    errors.push({
      row: rowIndex,
      field: 'period',
      value: budget.period,
      message: 'Period is required (format: YYYY-MM)'
    });
  } else if (!/^\d{4}-\d{2}$/.test(budget.period)) {
    errors.push({
      row: rowIndex,
      field: 'period',
      value: budget.period,
      message: 'Invalid period format. Must be YYYY-MM'
    });
  }

  return errors;
}

export async function importData(data: {
  categories?: unknown[],
  accounts?: unknown[],
  transactions?: unknown[],
  budgets?: unknown[]
}): Promise<ImportResult> {
  const result: ImportResult = {
    success: true,
    errors: [],
    imported: {
      categories: 0,
      accounts: 0,
      transactions: 0,
      budgets: 0
    }
  };

  try {
    // Validate all data first
    if (data.categories) {
      data.categories.forEach((category, index) => {
        result.errors.push(...validateCategory(category, index));
      });
    }

    if (data.accounts) {
      data.accounts.forEach((account, index) => {
        result.errors.push(...validateAccount(account, index));
      });
    }

    if (data.transactions) {
      data.transactions.forEach((transaction, index) => {
        result.errors.push(...validateTransaction(transaction, index));
      });
    }

    if (data.budgets) {
      data.budgets.forEach((budget, index) => {
        result.errors.push(...validateBudget(budget, index));
      });
    }

    // If there are any validation errors, return early
    if (result.errors.length > 0) {
      result.success = false;
      return result;
    }

    // Import categories
    if (data.categories) {
      for (const category of data.categories) {
        await addCategory(category as ImportCategory);
        result.imported.categories++;
      }
    }

    // Import accounts
    if (data.accounts) {
      for (const account of data.accounts) {
        await addAccount(account as ImportAccount);
        result.imported.accounts++;
      }
    }

    // Import transactions
    if (data.transactions) {
      for (const rawTransaction of data.transactions) {
        const transaction = rawTransaction as Record<string, unknown>;
        // Ensure transaction has the correct type
        const processedTransaction = {
          ...(transaction as ImportTransaction),
          type: 'transaction' as const,
          // Convert date string to ISO string if needed
          date: new Date(String(transaction.date)).toISOString(),
          // Ensure tags is an array
          tags: Array.isArray(transaction.tags) ? transaction.tags : 
                transaction.tags ? String(transaction.tags).split(',').map(t => t.trim()) : []
        };
        await addTransaction(processedTransaction);
        result.imported.transactions++;
      }
    }

    // Import budgets
    if (data.budgets) {
      for (const budget of data.budgets) {
        await addBudget(budget as ImportBudget);
        result.imported.budgets++;
      }
    }

    return result;
  } catch (error) {
    console.error('Error importing data:', error);
    result.success = false;
    result.errors.push({
      row: -1,
      field: 'general',
      value: null,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
    return result;
  }
} 