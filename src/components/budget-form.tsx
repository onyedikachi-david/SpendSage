"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addBudget } from "@/lib/store"
import { useCategories } from "@/lib/store"
import { format } from "date-fns"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Category } from "@/types"

interface BudgetFormProps {
  onComplete?: () => void
  presetCategory?: string
}

export default function BudgetForm({ onComplete, presetCategory }: BudgetFormProps) {
  const { docs: categories } = useCategories()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    category: presetCategory || "",
    amount: "",
    period: format(new Date(), "yyyy-MM"),
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await addBudget({
        ...formData,
        amount: parseFloat(formData.amount),
        type: 'budget'
      })
      onComplete?.()
    } catch (error) {
      console.error('Failed to save budget:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        {presetCategory ? (
          <Input id="category" value={presetCategory} disabled />
        ) : (
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
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Monthly Budget Amount</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Budget"}
      </Button>
    </form>
  )
} 