"use client"

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Reports from "./reports"
import { MoneyTree } from "./visualizations/MoneyTree"
import { DatePicker } from "./ui/date-picker"

export default function Dashboard() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date(),
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

  const netSavings = totalIncome - totalExpenses
  const savingsGoal = 10000 // Example goal - this could be made configurable in settings

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
        date: formData.date.toISOString(),
        amount: parseFloat(formData.amount),
        category: formData.category,
        account: formData.account,
        description: formData.description || '',
        isExpense: formData.isExpense,
      })
      
      // Reset form
      setFormData({
        date: new Date(),
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
    <div className="space-y-6 p-4 md:p-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left column */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-2">Welcome to SpendSage!</h2>
            <p className="text-sm text-gray-500">
              Track your finances, achieve your goals, and watch your money tree grow. All your data is stored locally and syncs automatically when you're online.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold mb-4">Your Financial Forest 🌳</h3>
            <MoneyTree savings={netSavings} goal={savingsGoal} />
            <div className="mt-4 text-center">
              <p className="text-xs md:text-sm text-gray-600">
                Watch your tree grow as you save! Set a goal in settings to get started.
              </p>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="rounded-lg border p-3 md:p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs md:text-sm font-medium">Total Balance</h3>
                <span className="text-xl md:text-2xl">💰</span>
              </div>
              <div className="mt-2">
                <div className="text-lg md:text-2xl font-semibold">${(totalIncome - totalExpenses).toFixed(2)}</div>
                <div className="text-xs text-gray-500">Current balance</div>
              </div>
            </div>

            <div className="rounded-lg border p-3 md:p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs md:text-sm font-medium">Net Savings</h3>
                <span className="text-xl md:text-2xl">🎯</span>
              </div>
              <div className="mt-2">
                <div className="text-lg md:text-2xl font-semibold text-green-500">${netSavings.toFixed(2)}</div>
                <div className="text-xs text-gray-500">Total savings</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4 md:p-6">
            <Tabs defaultValue="quick-entry" className="space-y-4">
              <TabsList className="w-full grid grid-cols-3 h-auto">
                <TabsTrigger value="quick-entry" className="flex-1 text-xs md:text-sm py-2">
                  <span className="mr-1 md:mr-2">⚡</span> <span className="hidden md:inline">Quick</span> Entry
                </TabsTrigger>
                <TabsTrigger value="overview" className="flex-1 text-xs md:text-sm py-2">
                  <span className="mr-1 md:mr-2">📋</span> Overview
                </TabsTrigger>
                <TabsTrigger value="reports" className="flex-1 text-xs md:text-sm py-2">
                  <span className="mr-1 md:mr-2">📊</span> Reports
                </TabsTrigger>
              </TabsList>

              <TabsContent value="quick-entry">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label className="text-sm font-normal">Date</Label>
                    <DatePicker 
                      date={formData.date}
                      onSelect={(date) => setFormData(prev => ({ ...prev, date: date || new Date() }))}
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-normal">Amount</Label>
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
                    <Label className="text-sm font-normal">Category</Label>
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
                    <Label className="text-sm font-normal">Account</Label>
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
                    <Label className="text-sm font-normal">Description</Label>
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
                      <Label className="text-sm font-normal">
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
              </TabsContent>

              <TabsContent value="overview">
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <h3 className="text-base font-semibold mb-3">Recent Activity</h3>
                    {transactions.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No transactions yet. Add one to get started!
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {transactions.slice(0, 5).map((tx) => (
                          <div key={tx._id} className="flex items-center justify-between py-2 border-b last:border-0">
                            <div>
                              <p className="text-sm font-medium">{tx.description || tx.category}</p>
                              <p className="text-xs text-gray-500">{format(new Date(tx.date), 'MMM d, yyyy')}</p>
                            </div>
                            <div className={`text-sm font-medium ${tx.isExpense ? 'text-red-500' : 'text-green-500'}`}>
                              {tx.isExpense ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reports">
                <Reports />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
} 