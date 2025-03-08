import { FormEvent, useState } from "react"
import { format } from "date-fns"
import { addTransaction, useTransactions } from '@/lib/store'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Transaction } from "@/types"
import { toast } from "sonner"

export default function Dashboard() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    amount: '',
    category: '',
    account: '',
    description: '',
    isExpense: true
  })
  
  // Query all transactions using the hook from store
  const { docs: transactions } = useTransactions() as unknown as { docs: Transaction[] }

  // Calculate totals
  const totalIncome = transactions.reduce((acc, tx) => {
    return acc + (!tx.isExpense ? Number(tx.amount) : 0)
  }, 0)

  const totalExpenses = transactions.reduce((acc, tx) => {
    return acc + (tx.isExpense ? Number(tx.amount) : 0)
  }, 0)

  const categories = [...new Set(transactions.map(tx => tx.category))].length

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.amount || isNaN(parseFloat(formData.amount))) {
      toast.error("Please enter a valid amount")
      return
    }
    if (!formData.category) {
      toast.error("Please select a category")
      return
    }
    if (!formData.account) {
      toast.error("Please select an account")
      return
    }

    setIsSubmitting(true)
    
    try {
      await addTransaction({
        type: 'transaction',
        date: format(new Date(formData.date), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
        amount: parseFloat(formData.amount),
        category: formData.category,
        account: formData.account,
        description: formData.description || '',
        isExpense: formData.isExpense,
      })
      
      // Reset form
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        amount: '',
        category: '',
        account: '',
        description: '',
        isExpense: true
      })
      
      toast.success("Transaction added successfully")
    } catch (error) {
      console.error("Failed to add transaction:", error)
      toast.error("Failed to add transaction. Please try again.")
    } finally {
      setIsSubmitting(false)
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
              <div className="text-2xl font-semibold">${(totalIncome - totalExpenses).toFixed(2)}</div>
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
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="mt-1.5 h-9 rounded-md border border-gray-200 px-3 py-1 text-sm"
              />
            </div>

            <div>
              <Label className="text-sm font-normal text-gray-900">Amount</Label>
              <Input 
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="mt-1.5 h-9 rounded-md border border-gray-200 px-3 py-1 text-sm"
                placeholder="0.00" 
              />
            </div>

            <div>
              <Label className="text-sm font-normal text-gray-900">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
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
              <Select value={formData.account} onValueChange={(value) => setFormData(prev => ({ ...prev, account: value }))}>
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
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1.5 min-h-[80px] rounded-md border border-gray-200 px-3 py-2 text-sm"
                placeholder="Transaction details" 
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Switch 
                  checked={formData.isExpense}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isExpense: checked }))}
                  className="h-5 w-9" 
                />
                <Label className="text-sm font-normal text-gray-900">
                  Expense (money out)
                </Label>
              </div>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isSubmitting ? 'Adding...' : 'Add Transaction'}
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