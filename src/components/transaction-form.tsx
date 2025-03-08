"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addTransaction } from "@/lib/store"
import { useCategories, useAccounts } from "@/lib/store"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Transaction, Category, Account } from "@/types"

interface TransactionFormProps {
  onComplete: () => void
  initialData?: Partial<Transaction>
}

export default function TransactionForm({ onComplete, initialData }: TransactionFormProps) {
  const { docs: categories } = useCategories()
  const { docs: accounts } = useAccounts()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    date: initialData?.date || new Date().toISOString().split('T')[0],
    description: initialData?.description || '',
    amount: initialData?.amount?.toString() || '',
    category: initialData?.category || '',
    account: initialData?.account || '',
    isExpense: initialData?.isExpense ?? true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await addTransaction({
        ...formData,
        amount: parseFloat(formData.amount),
        type: 'transaction'
      })
      onComplete()
    } catch (error) {
      console.error('Failed to save transaction:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData({ ...formData, category: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories?.map((category: Category) => (
              <SelectItem key={category._id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="account">Account</Label>
        <Select
          value={formData.account}
          onValueChange={(value) => setFormData({ ...formData, account: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select account" />
          </SelectTrigger>
          <SelectContent>
            {accounts?.map((account: Account) => (
              <SelectItem key={account._id} value={account.name}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Type</Label>
        <div className="flex gap-4">
          <Button
            type="button"
            variant={formData.isExpense ? "default" : "outline"}
            onClick={() => setFormData({ ...formData, isExpense: true })}
          >
            Expense
          </Button>
          <Button
            type="button"
            variant={!formData.isExpense ? "default" : "outline"}
            onClick={() => setFormData({ ...formData, isExpense: false })}
          >
            Income
          </Button>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Transaction"}
      </Button>
    </form>
  )
} 