import { FormEvent } from "react"
import { format } from "date-fns"
import { useFireproof } from 'use-fireproof'
import { db } from '@/lib/store'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Transaction } from "@/types"

export default function Dashboard() {
  const { useLiveQuery } = useFireproof(undefined, db)
  
  // Query all transactions
  const { docs: transactions } = useLiveQuery<Transaction>('date', {
    descending: true
  })

  // Calculate totals
  const totalIncome = transactions.reduce((acc, tx) => {
    return acc + (!tx.isExpense ? tx.amount : 0)
  }, 0)

  const totalExpenses = transactions.reduce((acc, tx) => {
    return acc + (tx.isExpense ? tx.amount : 0)
  }, 0)

  const categories = [...new Set(transactions.map(tx => tx.category))].length

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    
    const data = {
      date: formData.get('date') as string,
      amount: formData.get('amount') as string,
      category: formData.get('category') as string,
      account: formData.get('account') as string,
      description: formData.get('description') as string,
      isExpense: formData.get('expense') === 'on'
    }

    try {
      await db.put({
        type: 'transaction',
        date: format(new Date(data.date), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
        amount: parseFloat(data.amount),
        category: data.category,
        account: data.account,
        description: data.description,
        isExpense: data.isExpense,
      })
      form.reset()
    } catch (error) {
      console.error("Failed to add transaction:", error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm">
          Welcome to SpendSage!
        </p>
        <p className="text-sm text-gray-500">
          Get started by adding your first transaction, setting up accounts, and creating budget categories. All your data is stored locally and syncs automatically when you're online.
        </p>
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-semibold">Dashboard</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Total Balance</h3>
              <svg className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-semibold">$0.00</div>
              <div className="text-xs text-gray-500">Current balance across all accounts</div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Income</h3>
              <svg className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5l7 7-7 7M5 12h14" />
              </svg>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-semibold text-green-500">${totalIncome.toFixed(2)}</div>
              <div className="text-xs text-gray-500">Total income</div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Expenses</h3>
              <svg className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 19l-7-7 7-7M5 12h14" />
              </svg>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-semibold text-red-500">${totalExpenses.toFixed(2)}</div>
              <div className="text-xs text-gray-500">Total expenses</div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Categories</h3>
              <svg className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-semibold">{categories}</div>
              <div className="text-xs text-gray-500">Distinct spending categories</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="mb-4 text-base font-semibold">Spending Overview</h3>
          <div className="flex h-[300px] items-center justify-center rounded-lg border">
            <p className="text-sm text-gray-500">No expense data to display</p>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-base font-semibold">Quick Entry</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-sm font-normal text-gray-900">Date</Label>
              <Input 
                type="date" 
                name="date"
                className="mt-1.5 h-9 rounded-md border border-gray-200 px-3 py-1 text-sm"
                defaultValue={format(new Date(), 'yyyy-MM-dd')} 
              />
            </div>

            <div>
              <Label className="text-sm font-normal text-gray-900">Amount</Label>
              <Input 
                type="text" 
                name="amount"
                className="mt-1.5 h-9 rounded-md border border-gray-200 px-3 py-1 text-sm"
                placeholder="0.00" 
              />
            </div>

            <div>
              <Label className="text-sm font-normal text-gray-900">Category</Label>
              <Select name="category">
                <SelectTrigger className="mt-1.5 h-9 rounded-md border border-gray-200 px-3 py-1 text-sm">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="food">Food</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-normal text-gray-900">Account</Label>
              <Select name="account">
                <SelectTrigger className="mt-1.5 h-9 rounded-md border border-gray-200 px-3 py-1 text-sm">
                  <SelectValue placeholder="Select an account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Checking</SelectItem>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="credit">Credit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-normal text-gray-900">Description</Label>
              <Textarea 
                name="description"
                className="mt-1.5 min-h-[80px] rounded-md border border-gray-200 px-3 py-2 text-sm"
                placeholder="Transaction details" 
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Switch name="expense" className="h-5 w-9" />
                <Label className="text-sm font-normal text-gray-900">
                  Expense (money out)
                </Label>
              </div>
              <Button 
                type="submit"
                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Add Transaction
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-base font-semibold">Recent Transactions</h3>
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Date</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Description</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Category</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Account</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-500">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-4 text-center text-sm text-gray-500">
                    No transactions found. Add one to get started!
                  </td>
                </tr>
              ) : (
                transactions.slice(0, 5).map((tx) => (
                  <tr key={tx._id} className="border-b last:border-0">
                    <td className="px-4 py-2 text-sm">{format(new Date(tx.date), 'MMM d, yyyy')}</td>
                    <td className="px-4 py-2 text-sm">{tx.description}</td>
                    <td className="px-4 py-2 text-sm">{tx.category}</td>
                    <td className="px-4 py-2 text-sm">{tx.account}</td>
                    <td className={`px-4 py-2 text-right text-sm ${tx.isExpense ? 'text-red-500' : 'text-green-500'}`}>
                      {tx.isExpense ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 