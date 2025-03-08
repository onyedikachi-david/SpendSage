"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useBudgets, useTransactions } from "@/lib/store"
import { format, startOfMonth, endOfMonth } from "date-fns"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import BudgetForm from "./budget-form"

export default function Budgets() {
  const { docs: budgets = [] } = useBudgets()
  const { docs: transactions = [] } = useTransactions()
  const [openAddDialog, setOpenAddDialog] = useState(false)

  // Get current month
  const today = new Date()
  const currentMonthStr = format(today, "yyyy-MM")

  // Filter transactions for current month
  const currentMonthStart = startOfMonth(today)
  const currentMonthEnd = endOfMonth(today)
  const currentMonthTransactions = transactions.filter((t) => {
    const date = new Date(t.date)
    return date >= currentMonthStart && date <= currentMonthEnd && t.isExpense
  })

  // Calculate spending by category
  const spendingByCategory = currentMonthTransactions.reduce(
    (acc, transaction) => {
      const { category, amount } = transaction
      if (!acc[category]) {
        acc[category] = 0
      }
      acc[category] += amount
      return acc
    },
    {} as Record<string, number>,
  )

  // Get current month's budgets
  const currentBudgets = budgets.filter((budget) => budget.period === currentMonthStr)

  // Combine with spending data
  const budgetData = currentBudgets.map((budget) => {
    const spent = spendingByCategory[budget.category] || 0
    const percentage = (spent / budget.amount) * 100

    return {
      ...budget,
      spent,
      percentage: Math.min(percentage, 100) || 0, // Ensure percentage is never NaN
    }
  })

  // Categories with spending but no budget
  const categoriesWithoutBudget = Object.keys(spendingByCategory).filter(
    (category) => !currentBudgets.some((budget) => budget.category === category),
  )

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center">
          <div className="space-y-1.5">
            <CardTitle>Budget for {format(today, "MMMM yyyy")}</CardTitle>
            <CardDescription>Track your spending against monthly budget goals</CardDescription>
          </div>
          <div className="ml-auto">
            <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Budget
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Budget</DialogTitle>
                  <DialogDescription>Set a budget limit for a category</DialogDescription>
                </DialogHeader>
                <BudgetForm onComplete={() => setOpenAddDialog(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {budgetData.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No budgets set for this month. Add one to get started!
            </div>
          ) : (
            <div className="space-y-8">
              {budgetData.map((budget) => (
                <div key={budget._id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{budget.category}</div>
                    <div className="text-sm text-muted-foreground">
                      ${budget.spent.toFixed(2)} / ${budget.amount.toFixed(2)}
                    </div>
                  </div>
                  <Progress value={budget.percentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <div>
                      {budget.percentage < 50 && "On track"}
                      {budget.percentage >= 50 && budget.percentage < 90 && "Approaching limit"}
                      {budget.percentage >= 90 && "At limit"}
                    </div>
                    <div>{budget.percentage.toFixed(0)}%</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {categoriesWithoutBudget.length > 0 && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-sm font-medium mb-4">Categories without budgets</h3>
              <div className="space-y-4">
                {categoriesWithoutBudget.map((category) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="font-medium">{category}</div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        ${spendingByCategory[category].toFixed(2)} spent
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Set Budget
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create Budget for {category}</DialogTitle>
                            <DialogDescription>Set a monthly budget limit for this category</DialogDescription>
                          </DialogHeader>
                          <BudgetForm presetCategory={category} />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 