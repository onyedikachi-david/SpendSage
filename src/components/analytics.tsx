"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTransactions, useCategories, useBudgets } from "@/lib/store"
import { format, subDays, subMonths, isSameMonth, isWithinInterval } from "date-fns"
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Bar,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import type { Transaction, Category, Budget } from "@/types"
import { CashFlowWaterfall } from "./visualizations/CashFlowWaterfall"
import { SavingsGrowth } from "./visualizations/SavingsGrowth"
import { BudgetRadar } from "./visualizations/BudgetRadar"

// Chart colors
const COLORS = [
  "#2196F3", // Blue
  "#4CAF50", // Green
  "#FFC107", // Yellow
  "#F44336", // Red
  "#9C27B0", // Purple
  "#FF9800", // Orange
  "#795548", // Brown
  "#607D8B", // Blue Grey
]

export default function Analytics() {
  const { docs: rawTransactions = [] } = useTransactions()
  const transactions = rawTransactions as unknown as Transaction[]
  const { docs: rawCategories = [] } = useCategories()
  const categories = rawCategories as unknown as Category[]
  const { docs: rawBudgets = [] } = useBudgets()
  const budgets = rawBudgets as unknown as Budget[]
  
  const [timeframe, setTimeframe] = useState<"30days" | "90days" | "6months" | "1year">("30days")
  const [comparisonType, setComparisonType] = useState<"mom" | "yoy">("mom")

  // Get date range based on timeframe
  const getDateRange = () => {
    const today = new Date()
    switch (timeframe) {
      case "30days":
        return { start: subDays(today, 30), end: today }
      case "90days":
        return { start: subDays(today, 90), end: today }
      case "6months":
        return { start: subMonths(today, 6), end: today }
      case "1year":
        return { start: subMonths(today, 12), end: today }
    }
  }

  const dateRange = getDateRange()
  
  // Filter transactions for the selected time period
  const filteredTransactions = transactions.filter(t => {
    const date = new Date(t.date)
    return isWithinInterval(date, { start: dateRange.start, end: dateRange.end })
  })

  // Get monthly spending data
  const getMonthlyData = () => {
    const monthlyData: Record<string, { expenses: number; income: number }> = {}
    const months = Array.from({ length: 13 }, (_, i) => subMonths(new Date(), i))

    // Initialize all months
    months.forEach(date => {
      const monthKey = format(date, "MMM yyyy")
      monthlyData[monthKey] = { expenses: 0, income: 0 }
    })

    // Aggregate transaction data
    transactions.forEach(transaction => {
      const date = new Date(transaction.date)
      if (date >= subMonths(new Date(), 12)) {
        const monthKey = format(date, "MMM yyyy")
        if (transaction.isExpense) {
          monthlyData[monthKey].expenses += transaction.amount
        } else {
          monthlyData[monthKey].income += transaction.amount
        }
      }
    })

    // Convert to array and reverse for chronological order
    return Object.entries(monthlyData)
      .map(([name, data]) => ({ name, ...data }))
      .reverse()
  }

  // Get spending by category
  const getCategoryData = () => {
    const categoryData: Record<string, number> = {}
    
    filteredTransactions
      .filter(t => t.isExpense)
      .forEach(transaction => {
        if (!categoryData[transaction.category]) {
          categoryData[transaction.category] = 0
        }
        categoryData[transaction.category] += transaction.amount
      })

    return Object.entries(categoryData)
      .map(([name, value]) => ({
        name,
        value,
        color: categories.find(c => c.name === name)?.color || COLORS[0]
      }))
      .sort((a, b) => b.value - a.value)
  }

  // Get month-over-month or year-over-year comparison
  const getComparisonData = () => {
    const currentMonth = new Date()
    const previousMonth = subMonths(currentMonth, 1)
    const previousYear = subMonths(currentMonth, 12)

    const compareWith = comparisonType === "mom" ? previousMonth : previousYear

    const currentMonthData = transactions
      .filter(t => t.isExpense && isSameMonth(new Date(t.date), currentMonth))
      .reduce((acc, t) => acc + t.amount, 0)

    const previousData = transactions
      .filter(t => t.isExpense && isSameMonth(new Date(t.date), compareWith))
      .reduce((acc, t) => acc + t.amount, 0)

    const percentageChange = previousData ? ((currentMonthData - previousData) / previousData) * 100 : 0

    return {
      current: currentMonthData,
      previous: previousData,
      change: percentageChange
    }
  }

  // Get daily spending trend
  const getDailyTrend = () => {
    const dailyData: Record<string, number> = {}
    const days = Array.from({ length: 30 }, (_, i) => subDays(new Date(), i))

    // Initialize all days
    days.forEach(date => {
      dailyData[format(date, "MMM d")] = 0
    })

    // Aggregate daily spending
    filteredTransactions
      .filter(t => t.isExpense)
      .forEach(transaction => {
        const date = new Date(transaction.date)
        if (date >= subDays(new Date(), 30)) {
          const dayKey = format(date, "MMM d")
          dailyData[dayKey] += transaction.amount
        }
      })

    // Convert to array and reverse for chronological order
    return Object.entries(dailyData)
      .map(([date, amount]) => ({ date, amount }))
      .reverse()
  }

  const monthlyData = getMonthlyData()
  const categoryData = getCategoryData()
  const comparisonData = getComparisonData()
  const dailyTrend = getDailyTrend()

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <Select value={timeframe} onValueChange={(value: "30days" | "90days" | "6months" | "1year") => setTimeframe(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
            <SelectItem value="6months">Last 6 Months</SelectItem>
            <SelectItem value="1year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                filteredTransactions
                  .filter(t => t.isExpense)
                  .reduce((sum, t) => sum + t.amount, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {comparisonType === "mom" ? "vs. Last Month" : "vs. Last Year"}:{" "}
              <span className={comparisonData.change > 0 ? "text-red-500" : "text-green-500"}>
                {comparisonData.change > 0 ? "+" : ""}
                {comparisonData.change.toFixed(1)}%
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                filteredTransactions
                  .filter(t => !t.isExpense)
                  .reduce((sum, t) => sum + t.amount, 0)
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categoryData[0]?.name || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {categoryData[0] ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(categoryData[0].value) : "No data"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Daily Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
                filteredTransactions
                  .filter(t => t.isExpense)
                  .reduce((sum, t) => sum + t.amount, 0) / dailyTrend.length
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <CashFlowWaterfall transactions={filteredTransactions} />
      <SavingsGrowth transactions={filteredTransactions} timeframe={timeframe} />
      <BudgetRadar 
        transactions={filteredTransactions}
        categories={categories}
        budgets={budgets}
      />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Income vs. Expenses</CardTitle>
              <CardDescription>Monthly comparison of income and expenses</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => 
                      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
                    }
                  />
                  <Bar dataKey="income" name="Income" fill="#4CAF50" />
                  <Bar dataKey="expenses" name="Expenses" fill="#F44336" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
              <CardDescription>Distribution of expenses across categories</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    label={(entry) => `${entry.name} (${((entry.value / categoryData.reduce((sum, c) => sum + c.value, 0)) * 100).toFixed(1)}%)`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={entry.name} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) =>
                      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
                    }
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Spending Trend</CardTitle>
              <CardDescription>Daily expense pattern over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) =>
                      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#2196F3"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <div className="flex justify-end mb-4">
            <Select value={comparisonType} onValueChange={(value: "mom" | "yoy") => setComparisonType(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select comparison" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mom">Month over Month</SelectItem>
                <SelectItem value="yoy">Year over Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>
                {comparisonType === "mom" ? "Month over Month" : "Year over Year"} Comparison
              </CardTitle>
              <CardDescription>
                Comparing current spending with {comparisonType === "mom" ? "last month" : "last year"}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  {
                    name: "Current",
                    amount: comparisonData.current
                  },
                  {
                    name: comparisonType === "mom" ? "Last Month" : "Last Year",
                    amount: comparisonData.previous
                  }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) =>
                      new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
                    }
                  />
                  <Bar dataKey="amount" fill="#2196F3" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 