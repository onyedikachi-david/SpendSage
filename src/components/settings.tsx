"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAccounts, useCategories } from "@/lib/store"
import { db, deleteAccount, deleteCategory } from "@/lib/store"
import { useState } from "react"
import AccountForm from "./account-form"
import CategoryForm from "./category-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Download, Plus, Trash, Upload } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function Settings() {
  const { docs: accounts } = useAccounts()
  const { docs: categories } = useCategories()
  const [openAccountDialog, setOpenAccountDialog] = useState(false)
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false)

  // Export all data
  const handleExport = async () => {
    const allDocs = await db.allDocs()
    const blob = new Blob([JSON.stringify(allDocs, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "finance-tracker-export.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Import data
  const handleImport = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = async (event) => {
          try {
            const data = JSON.parse(event.target?.result as string)
            for (const doc of data) {
              await db.put(doc)
            }
            alert("Data imported successfully")
          } catch (error) {
            console.error("Import error:", error)
            alert("Error importing data. Please check the file format.")
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  // Handle deleting an account
  const handleDeleteAccount = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this account? This action cannot be undone.")) {
      try {
        await deleteAccount(id)
      } catch (error) {
        console.error("Failed to delete account:", error)
      }
    }
  }

  // Handle deleting a category
  const handleDeleteCategory = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      try {
        await deleteCategory(id)
      } catch (error) {
        console.error("Failed to delete category:", error)
      }
    }
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center">
              <div className="space-y-1.5">
                <CardTitle>Financial Accounts</CardTitle>
                <CardDescription>Manage your accounts like cash, bank accounts, and credit cards</CardDescription>
              </div>
              <div className="ml-auto">
                <Dialog open={openAccountDialog} onOpenChange={setOpenAccountDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Account</DialogTitle>
                      <DialogDescription>Add a new financial account to track</DialogDescription>
                    </DialogHeader>
                    <AccountForm onComplete={() => setOpenAccountDialog(false)} />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {accounts.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No accounts set up. Add an account to get started!
                </div>
              ) : (
                <div className="space-y-4">
                  {accounts.map((account) => (
                    <div key={account._id} className="flex items-center justify-between border p-4 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: account.color }}
                        >
                          <span className="text-white text-xs">{account.name.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="font-medium">{account.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Initial balance: ${account.initialBalance.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Account</DialogTitle>
                              <DialogDescription>Make changes to your account</DialogDescription>
                            </DialogHeader>
                            <AccountForm account={account} />
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAccount(account._id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center">
              <div className="space-y-1.5">
                <CardTitle>Expense Categories</CardTitle>
                <CardDescription>Manage your expense and income categories</CardDescription>
              </div>
              <div className="ml-auto">
                <Dialog open={openCategoryDialog} onOpenChange={setOpenCategoryDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Category</DialogTitle>
                      <DialogDescription>Add a new category for transactions</DialogDescription>
                    </DialogHeader>
                    <CategoryForm onComplete={() => setOpenCategoryDialog(false)} />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No categories set up. Add a category to get started!
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {categories.map((category) => (
                    <div key={category._id} className="flex items-center justify-between border p-4 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: category.color }}
                        >
                          <span className="text-white text-xs">{category.name.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="font-medium">{category.name}</div>
                          {category.parent && (
                            <Badge variant="outline" className="text-xs">
                              {category.parent}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Category</DialogTitle>
                              <DialogDescription>Make changes to your category</DialogDescription>
                            </DialogHeader>
                            <CategoryForm category={category} />
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCategory(category._id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>Export and import your financial data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Export Data</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download all your financial data as a JSON file for backup
                  </p>
                  <Button onClick={handleExport} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export All Data
                  </Button>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Import Data</h3>
                  <p className="text-sm text-muted-foreground mb-4">Import previously exported data from a JSON file</p>
                  <Button onClick={handleImport} variant="outline" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Sync Status</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Fireproof automatically syncs your data when you're online
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">Connected and syncing</span>
                  </div>
                  <Button variant="outline" size="sm">
                    Force Sync
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 