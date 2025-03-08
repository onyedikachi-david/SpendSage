"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTransactions } from "@/lib/store"
import { format, subDays } from "date-fns"
import { ResponsiveContainer, BarChart, XAxis, YAxis, Bar, Tooltip, CartesianGrid, LineChart, Line } from "recharts"
import CategoryPieChart from "./category-pie-chart"

export default function Analytics() {
  const { docs: transactions = [] } = useTransactions()

  // Filter transactions for different time periods
  const today = new Date()
  const last30Days = transactions.filter((t) => new Date(t.date) >= subDays(today, 30) && new Date(t.date) <= today)
  const last90Days = transactions.filter((t) => new Date(t.date) >= subDays(today, 90) && new Date(t.date) <= today)
  const thisYear = transactions.filter((t) => new Date(t.date).getFullYear() === today.getFullYear())

  // Get monthly data for the current year
  const getMonthlyData = () => {
    const monthlyData: Record<string, { expenses: number; income: number }> = {}

    // Initialize all months
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), i, 1)
      const monthKey = format(date, "MMM")
      monthlyData[monthKey] = { expenses: 0, income: 0 }
    }

    // Aggregate transaction data
    thisYear.forEach((transaction) => {
      const date = new Date(transaction.date)
      const monthKey = format(date, "MMM")

      if (transaction.isExpense) {
        monthlyData[monthKey].expenses += transaction.amount
      } else {
        monthlyData[monthKey].income += transaction.amount
      }
    })

    // Convert to array for charts
    return Object.entries(monthlyData).map(([name, data]) => ({
      name,
      expenses: data.expenses,
      income: data.income,
    }))
  }

  const monthlyData = getMonthlyData()

  // Get daily spending for the last 30 days
  const getDailyData = () => {
    const dailyData: Record<string, number> = {}

    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = subDays(today, i)
      const dayKey = format(date, "MMM d")
      dailyData[dayKey] = 0
    }

    // Aggregate expense data
    last30Days
      .filter((t) => t.isExpense)
      .forEach((transaction) => {
        const date = new Date(transaction.date)
        const dayKey = format(date, "MMM d")

        if (dailyData[dayKey] !== undefined) {
          dailyData[dayKey] += transaction.amount
        }
      })

    // Convert to array for charts
    return Object.entries(dailyData).map(([name, value]) => ({
      name,
      amount: value,
    }))
  }

  const dailyData = getDailyData()

  return (
    <div className="space-y-4">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="spending">Spending</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Yearly Overview</CardTitle>
              <CardDescription>Income vs. Expenses for {today.getFullYear()}</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                  <Bar dataKey="income" name="Income" fill="#22c55e" />
                  <Bar dataKey="expenses" name="Expenses" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Last 30 Days</CardTitle>
                <CardDescription>Spending by category</CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryPieChart transactions={last30Days} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Last 90 Days</CardTitle>
                <CardDescription>Spending by category</CardDescription>
              </CardHeader>
              <CardContent>
                <CategoryPieChart transactions={last90Days} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="spending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Spending</CardTitle>
              <CardDescription>Your expenses for the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                  <Line type="monotone" dataKey="amount" name="Spent" stroke="#ef4444" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>All time spending by category</CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryPieChart transactions={transactions} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>Your spending and income patterns over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                  <Line type="monotone" dataKey="income" name="Income" stroke="#22c55e" />
                  <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 