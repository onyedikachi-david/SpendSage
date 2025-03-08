"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTransactions, updateTransaction, deleteDocument } from "@/lib/store"
import TransactionForm from "@/components/transaction-form"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Download, Plus, Search, Trash } from "lucide-react"
import { useState, useEffect } from "react"
import { format } from "date-fns"
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
import { toast } from "sonner"
import type { Transaction } from "@/types"

export default function Transactions() {
  const { docs: rawTransactions = [] } = useTransactions()
  const transactions = rawTransactions as unknown as Transaction[]
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set())
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  })

  // Update filtered transactions when transactions, search, or date range changes
  useEffect(() => {
    if (!transactions) return

    const filtered = transactions.filter((transaction: Transaction) => {
      // Text search
      const matchesSearch = 
        transaction.description.toLowerCase().includes(search.toLowerCase()) ||
        transaction.category.toLowerCase().includes(search.toLowerCase()) ||
        transaction.amount.toString().includes(search)

      // Date range
      const date = new Date(transaction.date)
      const afterStart = !dateRange.start || date >= new Date(dateRange.start)
      const beforeEnd = !dateRange.end || date <= new Date(dateRange.end)

      return matchesSearch && afterStart && beforeEnd
    })

    // Sort transactions by date (newest first)
    const sorted = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    setFilteredTransactions(sorted)
  }, [transactions, search, dateRange])

  // Export transactions as CSV
  const exportTransactions = () => {
    const headers = "Date,Description,Category,Subcategory,Amount,Type,Account,Tags\n"
    const csvContent = filteredTransactions
      .map(
        (t) =>
          `${t.date},${t.description},${t.category},${t.subcategory || ''},${t.amount},${t.isExpense ? "Expense" : "Income"},${t.account},${t.tags?.join(';') || ''}`
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

  // Batch operations
  const handleSelectAll = () => {
    if (selectedTransactions.size === filteredTransactions.length) {
      setSelectedTransactions(new Set())
    } else {
      setSelectedTransactions(new Set(filteredTransactions.map(t => t._id)))
    }
  }

  const handleSelect = (id: string) => {
    const newSelected = new Set(selectedTransactions)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedTransactions(newSelected)
  }

  const handleBatchDelete = async () => {
    if (!selectedTransactions.size) return

    try {
      await Promise.all(Array.from(selectedTransactions).map(id => deleteDocument(id)))
      setSelectedTransactions(new Set())
      toast.success("Selected transactions deleted")
    } catch (error) {
      console.error('Failed to delete transactions:', error)
      toast.error("Failed to delete transactions")
    }
  }

  const handleBatchUpdateCategory = async (category: string) => {
    if (!selectedTransactions.size) return

    try {
      await Promise.all(
        Array.from(selectedTransactions).map(id => 
          updateTransaction(id, { category })
        )
      )
      setSelectedTransactions(new Set())
      toast.success("Selected transactions updated")
    } catch (error) {
      console.error('Failed to update transactions:', error)
      toast.error("Failed to update transactions")
    }
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
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative col-span-2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                placeholder="Start date"
              />
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                placeholder="End date"
              />
            </div>

            {selectedTransactions.size > 0 && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                <span className="text-sm text-muted-foreground">
                  {selectedTransactions.size} selected
                </span>
                <Select onValueChange={handleBatchUpdateCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Update category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="destructive" size="sm" onClick={handleBatchDelete}>
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={selectedTransactions.size === filteredTransactions.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedTransactions.has(transaction._id)}
                          onCheckedChange={() => handleSelect(transaction._id)}
                        />
                      </TableCell>
                      <TableCell>{format(new Date(transaction.date), "MMM d, yyyy")}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{transaction.category}</span>
                          {transaction.subcategory && (
                            <span className="text-sm text-muted-foreground">
                              {transaction.subcategory}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{transaction.account}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {transaction.tags?.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className={`text-right ${transaction.isExpense ? 'text-red-500' : 'text-green-500'}`}>
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(transaction.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 