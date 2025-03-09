"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useTransactions, useCategories, useAccounts } from "@/lib/store"
import { format, isWithinInterval, startOfYear, endOfYear } from "date-fns"
import { CalendarIcon, Download } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import type { Transaction, Category, Account } from "@/types"

// Report types
const REPORT_TYPES = [
  { label: "Income Statement", value: "income-statement" },
  { label: "Expense Report", value: "expense-report" },
  { label: "Category Analysis", value: "category-analysis" },
  { label: "Account Summary", value: "account-summary" },
  { label: "Tax Report", value: "tax-report" },
]

// Chart colors
const COLORS = [
  "#2196F3", // Blue
  "#4CAF50", // Green
  "#FFC107", // Yellow
  "#F44336", // Red
  "#9C27B0", // Purple
  "#FF9800", // Orange
]

export default function Reports() {
  const { docs: rawTransactions = [] } = useTransactions()
  const transactions = rawTransactions as unknown as Transaction[]
  const { docs: rawCategories = [] } = useCategories()
  const categories = rawCategories as unknown as Category[]
  const { docs: rawAccounts = [] } = useAccounts()
  const accounts = rawAccounts as unknown as Account[]

  // State
  const [reportType, setReportType] = useState("income-statement")
  const [startDate, setStartDate] = useState(startOfYear(new Date()))
  const [endDate, setEndDate] = useState(endOfYear(new Date()))
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())

  // Filter transactions by date range
  const filteredTransactions = transactions.filter((t) =>
    isWithinInterval(new Date(t.date), { start: startDate, end: endDate })
  )

  // Calculate totals
  const totalIncome = filteredTransactions
    .filter((t) => !t.isExpense)
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = filteredTransactions
    .filter((t) => t.isExpense)
    .reduce((sum, t) => sum + t.amount, 0)

  const netIncome = totalIncome - totalExpenses

  // Get spending by category
  const spendingByCategory = filteredTransactions
    .filter((t) => t.isExpense)
    .reduce((acc, t) => {
      if (!acc[t.category]) acc[t.category] = 0
      acc[t.category] += t.amount
      return acc
    }, {} as Record<string, number>)

  // Prepare chart data
  const categoryChartData = Object.entries(spendingByCategory)
    .map(([name, value]) => ({
      name,
      value,
      color: categories.find((c) => c.name === name)?.color || COLORS[0],
    }))
    .sort((a, b) => b.value - a.value)

  // Get monthly data
  const getMonthlyData = () => {
    const monthlyData: Record<string, { income: number; expenses: number }> = {}
    
    filteredTransactions.forEach((t) => {
      const month = format(new Date(t.date), "MMM yyyy")
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expenses: 0 }
      }
      if (t.isExpense) {
        monthlyData[month].expenses += t.amount
      } else {
        monthlyData[month].income += t.amount
      }
    })

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      ...data,
    }))
  }

  // Generate tax report data
  const getTaxReport = () => {
    const year = parseInt(selectedYear)
    const taxYear = {
      start: startOfYear(new Date(year, 0)),
      end: endOfYear(new Date(year, 0)),
    }

    const taxTransactions = transactions.filter((t) =>
      isWithinInterval(new Date(t.date), taxYear)
    )

    const income = taxTransactions
      .filter((t) => !t.isExpense)
      .reduce((sum, t) => sum + t.amount, 0)

    const deductions = taxTransactions
      .filter((t) => t.isExpense && t.tags?.includes("tax-deductible"))
      .reduce((sum, t) => sum + t.amount, 0)

    return { income, deductions, taxableIncome: income - deductions }
  }

  // Handle report export
  const handleExport = () => {
    interface ReportData {
      period?: string
      income?: number
      expenses?: number
      netIncome?: number
      transactions?: Transaction[]
      categories?: Record<string, number>
      deductions?: number
      taxableIncome?: number
    }

    let reportData: ReportData = {}

    switch (reportType) {
      case "income-statement":
        reportData = {
          period: `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`,
          income: totalIncome,
          expenses: totalExpenses,
          netIncome: netIncome,
          transactions: filteredTransactions,
        }
        break
      case "tax-report":
        reportData = getTaxReport()
        break
      default:
        reportData = {
          transactions: filteredTransactions,
          categories: spendingByCategory,
        }
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${reportType}-${format(new Date(), "yyyy-MM-dd")}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">
            Generate and analyze financial reports
          </p>
        </div>
        <Button onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="flex gap-4">
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select report type" />
          </SelectTrigger>
          <SelectContent>
            {REPORT_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {reportType !== "tax-report" ? (
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {format(startDate, "MMM d, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => date && setStartDate(date)}
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {format(endDate, "MMM d, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => date && setEndDate(date)}
                />
              </PopoverContent>
            </Popover>
          </div>
        ) : (
          <Select
            value={selectedYear}
            onValueChange={setSelectedYear}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => (
                <SelectItem
                  key={i}
                  value={(new Date().getFullYear() - i).toString()}
                >
                  {new Date().getFullYear() - i}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {reportType === "income-statement" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total Income</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${totalIncome.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Total Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  ${totalExpenses.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Net Income</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    netIncome >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  ${netIncome.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Overview</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getMonthlyData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) =>
                      new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(value)
                    }
                  />
                  <Bar dataKey="income" name="Income" fill="#4CAF50" />
                  <Bar dataKey="expenses" name="Expenses" fill="#F44336" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {reportType === "expense-report" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Expense Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    label={(entry) => `${entry.name} (${((entry.value / totalExpenses) * 100).toFixed(1)}%)`}
                  >
                    {categoryChartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) =>
                      new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(value)
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expense Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>% of Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryChartData.map((category) => (
                    <TableRow key={category.name}>
                      <TableCell>{category.name}</TableCell>
                      <TableCell>
                        ${category.value.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {((category.value / totalExpenses) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {reportType === "tax-report" && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total Income</CardTitle>
                <CardDescription>Gross income for {selectedYear}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${getTaxReport().income.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Deductions</CardTitle>
                <CardDescription>Tax-deductible expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${getTaxReport().deductions.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Taxable Income</CardTitle>
                <CardDescription>Income subject to tax</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${getTaxReport().taxableIncome.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Tax Deductible Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions
                    .filter(
                      (t) =>
                        t.isExpense &&
                        t.tags?.includes("tax-deductible") &&
                        new Date(t.date).getFullYear() === parseInt(selectedYear)
                    )
                    .map((transaction) => (
                      <TableRow key={transaction._id}>
                        <TableCell>
                          {format(new Date(transaction.date), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>{transaction.category}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {reportType === "account-summary" && (
        <div className="space-y-6">
          {accounts.map((account) => {
            const accountTransactions = filteredTransactions.filter(
              (t) => t.account === account.name
            )
            const accountIncome = accountTransactions
              .filter((t) => !t.isExpense)
              .reduce((sum, t) => sum + t.amount, 0)
            const accountExpenses = accountTransactions
              .filter((t) => t.isExpense)
              .reduce((sum, t) => sum + t.amount, 0)
            const currentBalance = account.initialBalance + accountIncome - accountExpenses

            return (
              <Card key={account._id}>
                <CardHeader>
                  <CardTitle>{account.name}</CardTitle>
                  <CardDescription>
                    Current Balance: ${currentBalance.toFixed(2)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <div className="text-sm font-medium">Income</div>
                        <div className="text-2xl font-bold text-green-600">
                          ${accountIncome.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Expenses</div>
                        <div className="text-2xl font-bold text-red-600">
                          ${accountExpenses.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {accountTransactions
                          .sort(
                            (a, b) =>
                              new Date(b.date).getTime() -
                              new Date(a.date).getTime()
                          )
                          .slice(0, 5)
                          .map((transaction) => (
                            <TableRow key={transaction._id}>
                              <TableCell>
                                {format(
                                  new Date(transaction.date),
                                  "MMM d, yyyy"
                                )}
                              </TableCell>
                              <TableCell>{transaction.category}</TableCell>
                              <TableCell>{transaction.description}</TableCell>
                              <TableCell
                                className={
                                  transaction.isExpense
                                    ? "text-red-600"
                                    : "text-green-600"
                                }
                              >
                                {transaction.isExpense ? "-" : "+"}$
                                {transaction.amount.toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
} 