"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useBudgets, useTransactions, useCategories, addBudget } from "@/lib/store"
import { format, startOfMonth, endOfMonth, subMonths, isSameMonth } from "date-fns"
import { Button } from "@/components/ui/button"
import { Plus, AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import type { Transaction, Budget, Category } from "@/types"

export default function Budgets() {
  const { docs: rawBudgets = [] } = useBudgets()
  const budgets = rawBudgets as unknown as Budget[]
  const { docs: rawTransactions = [] } = useTransactions()
  const transactions = rawTransactions as unknown as Transaction[]
  const { docs: rawCategories = [] } = useCategories()
  const categories = rawCategories as unknown as Category[]
  
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"))
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [newBudget, setNewBudget] = useState({
    category: "",
    amount: "",
  })

  // Get available months for selection (last 12 months)
  const availableMonths = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i)
    return format(date, "yyyy-MM")
  })

  // Get current month's budgets
  const currentBudgets = budgets.filter((budget) => budget.period === selectedMonth)

  // Calculate spending by category for selected month
  const getSpendingByCategory = () => {
    const monthStart = startOfMonth(new Date(selectedMonth))
    const monthEnd = endOfMonth(new Date(selectedMonth))

    const spending: Record<string, number> = {}
    transactions
      .filter((t) => {
        const date = new Date(t.date)
        return t.isExpense && date >= monthStart && date <= monthEnd
      })
      .forEach((t) => {
        if (!spending[t.category]) spending[t.category] = 0
        spending[t.category] += t.amount
      })
    return spending
  }

  // Get budget recommendations based on historical spending
  const getBudgetRecommendations = () => {
    const recommendations: Record<string, number> = {}
    const last3Months = Array.from({ length: 3 }, (_, i) => subMonths(new Date(), i))

    // Calculate average monthly spending per category
    categories.forEach((category) => {
      let totalSpending = 0
      let monthsWithSpending = 0

      last3Months.forEach((month) => {
        const monthlySpending = transactions
          .filter((t) => 
            t.isExpense && 
            t.category === category.name && 
            isSameMonth(new Date(t.date), month)
          )
          .reduce((sum, t) => sum + t.amount, 0)

        if (monthlySpending > 0) {
          totalSpending += monthlySpending
          monthsWithSpending++
        }
      })

      if (monthsWithSpending > 0) {
        recommendations[category.name] = Math.ceil(totalSpending / monthsWithSpending)
      }
    })

    return recommendations
  }

  const spendingByCategory = getSpendingByCategory()
  const budgetRecommendations = getBudgetRecommendations()

  // Handle budget creation
  const handleCreateBudget = async () => {
    if (!newBudget.category || !newBudget.amount || isNaN(parseFloat(newBudget.amount))) {
      toast.error("Please fill in all fields correctly")
      return
    }

    try {
      await addBudget({
        category: newBudget.category,
        amount: parseFloat(newBudget.amount),
        period: selectedMonth,
      })
      setOpenAddDialog(false)
      setNewBudget({ category: "", amount: "" })
      toast.success("Budget created successfully")
    } catch (error) {
      console.error("Failed to create budget:", error)
      toast.error("Failed to create budget")
    }
  }

  // Get categories without budgets
  const categoriesWithoutBudget = categories
    .filter((category) => !currentBudgets.some((budget) => budget.category === category.name))
    .sort((a, b) => {
      // Sort by whether they have recommendations first, then by name
      const aHasRec = budgetRecommendations[a.name] !== undefined
      const bHasRec = budgetRecommendations[b.name] !== undefined
      if (aHasRec !== bHasRec) return bHasRec ? 1 : -1
      return a.name.localeCompare(b.name)
    })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Budgets</h2>
          <p className="text-muted-foreground">
            Manage and track your monthly spending limits
          </p>
          </div>
        <div className="flex gap-4">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.map((month) => (
                <SelectItem key={month} value={month}>
                  {format(new Date(month), "MMMM yyyy")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
            <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
              <DialogTrigger asChild>
              <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Budget
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Budget</DialogTitle>
                <DialogDescription>
                  Set a spending limit for a category in {format(new Date(selectedMonth), "MMMM yyyy")}
                </DialogDescription>
                </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Select
                    value={newBudget.category}
                    onValueChange={(value) => setNewBudget((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesWithoutBudget.map((category) => (
                        <SelectItem key={category.name} value={category.name}>
                          {category.name}
                          {budgetRecommendations[category.name] && (
                            <span className="ml-2 text-sm text-muted-foreground">
                              (Recommended: ${budgetRecommendations[category.name].toFixed(0)})
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={newBudget.amount}
                    onChange={(e) => setNewBudget((prev) => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
                <Button onClick={handleCreateBudget} className="w-full">
                  Create Budget
                </Button>
              </div>
              </DialogContent>
            </Dialog>
          </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {currentBudgets.map((budget) => {
          const spent = spendingByCategory[budget.category] || 0
          const remaining = budget.amount - spent
          const progress = Math.min((spent / budget.amount) * 100, 100)
          const isOverBudget = spent > budget.amount

          return (
            <Card key={budget._id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {budget.category}
                </CardTitle>
                {isOverBudget && (
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                )}
        </CardHeader>
        <CardContent>
                <div className="text-2xl font-bold">
                  ${spent.toFixed(2)}
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    of ${budget.amount.toFixed(2)}
                  </span>
            </div>
                <Progress
                  value={progress}
                  className={`mt-2 ${isOverBudget ? "bg-destructive" : ""}`}
                />
                <p className={`mt-2 text-sm ${isOverBudget ? "text-destructive" : "text-muted-foreground"}`}>
                  {isOverBudget
                    ? `$${Math.abs(remaining).toFixed(2)} over budget`
                    : `$${remaining.toFixed(2)} remaining`}
                </p>
              </CardContent>
            </Card>
          )
        })}
                    </div>

      {categoriesWithoutBudget.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Budget Recommendations</CardTitle>
            <CardDescription>
              Based on your average spending in the last 3 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categoriesWithoutBudget.map((category) => {
                const recommendation = budgetRecommendations[category.name]
                if (!recommendation) return null

                const currentSpending = spendingByCategory[category.name] || 0
                return (
                  <div key={category.name} className="flex items-center justify-between space-x-4">
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Currently spent: ${currentSpending.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        ${recommendation.toFixed(0)}
                      </p>
                      <p className="text-sm text-muted-foreground">recommended</p>
                    </div>
                  </div>
                )
              })}
            </div>
        </CardContent>
      </Card>
      )}
    </div>
  )
} 