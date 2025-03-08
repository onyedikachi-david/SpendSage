"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTransactions } from "@/lib/store"
import TransactionForm from "./transaction-form"
import TransactionList from "./transaction-list"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Download, Plus, Search } from "lucide-react"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { Transaction } from "@/types"

export default function Transactions() {
  const { docs: transactions } = useTransactions()
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])

  // Update filtered transactions when transactions or search changes
  useEffect(() => {
    if (!transactions) return

    const filtered = transactions.filter(
      (transaction: Transaction) =>
        transaction.description.toLowerCase().includes(search.toLowerCase()) ||
        transaction.category.toLowerCase().includes(search.toLowerCase()) ||
        transaction.amount.toString().includes(search),
    )

    // Sort transactions by date (newest first)
    const sorted = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    setFilteredTransactions(sorted)
  }, [transactions, search])

  // Export transactions as CSV
  const exportTransactions = () => {
    const headers = "Date,Description,Category,Amount,Type,Account\n"
    const csvContent = filteredTransactions
      .map(
        (t) =>
          `${t.date},${t.description},${t.category},${t.amount},${t.isExpense ? "Expense" : "Income"},${t.account}`,
      )
      .join("\n")

    const blob = new Blob([headers + csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "transactions.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Transactions</CardTitle>
              <CardDescription>Manage your financial transactions</CardDescription>
            </div>
            <div className="flex mt-2 sm:mt-0 gap-2">
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Transaction
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Transaction</DialogTitle>
                    <DialogDescription>Enter the details of your transaction below</DialogDescription>
                  </DialogHeader>
                  <TransactionForm onComplete={() => setOpen(false)} />
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm" onClick={exportTransactions}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <TransactionList transactions={filteredTransactions} />
        </CardContent>
      </Card>
    </div>
  )
} 