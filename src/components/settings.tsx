"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useAccounts,
  useCategories,
  addAccount,
  deleteAccount,
  addCategory,
  deleteCategory,
  populateTestData,
  clearDatabase,
} from "@/lib/store"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"
import type { Account, Category } from "@/types"
import CSVImport from "@/components/csv-import"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Currency options based on common formats
const CURRENCY_OPTIONS = [
  { label: "USD ($)", value: "USD" },
  { label: "EUR (€)", value: "EUR" },
  { label: "GBP (£)", value: "GBP" },
  { label: "JPY (¥)", value: "JPY" },
  { label: "CNY (¥)", value: "CNY" },
]

// Date format options
const DATE_FORMAT_OPTIONS = [
  { label: "MM/DD/YYYY", value: "MM/dd/yyyy" },
  { label: "DD/MM/YYYY", value: "dd/MM/yyyy" },
  { label: "YYYY-MM-DD", value: "yyyy-MM-dd" },
]

type PopulateStep = {
  message: string;
  dramaticMessage: string;
  progress: number;
}

const populateSteps: PopulateStep[] = [
  { message: "Initializing", dramaticMessage: "Powering up the quantum data engines...", progress: 5 },
  { message: "Preparing Database", dramaticMessage: "Calibrating the flux capacitors...", progress: 10 },
  { message: "Adding Categories", dramaticMessage: "Synthesizing category matrices...", progress: 30 },
  { message: "Adding Accounts", dramaticMessage: "Materializing digital vaults...", progress: 50 },
  { message: "Adding Transactions", dramaticMessage: "Weaving the fabric of financial reality...", progress: 70 },
  { message: "Adding Budgets", dramaticMessage: "Balancing the cosmic ledger...", progress: 85 },
  { message: "Finalizing", dramaticMessage: "Stabilizing the space-time continuum...", progress: 95 },
  { message: "Complete", dramaticMessage: "The prophecy has been fulfilled!", progress: 100 }
];

export default function Settings() {
  const { docs: rawAccounts = [] } = useAccounts()
  const accounts = rawAccounts as unknown as Account[]
  const { docs: rawCategories = [] } = useCategories()
  const categories = rawCategories as unknown as Category[]

  // Form states
  const [newAccount, setNewAccount] = useState({ name: "", type: "checking", initialBalance: "" })
  const [newCategory, setNewCategory] = useState({ name: "", color: "#2196F3", icon: "" })
  
  // Preferences state
  const [preferences, setPreferences] = useState({
    currency: "USD",
    dateFormat: "MM/dd/yyyy",
    enableNotifications: true,
    notifyOnOverBudget: true,
    notifyOnLowBalance: true,
    lowBalanceThreshold: "100",
  })

  const [isPopulating, setIsPopulating] = useState(false);
  const [currentStep, setCurrentStep] = useState<PopulateStep | null>(null);

  // Handle account operations
  const handleAddAccount = async () => {
    if (!newAccount.name || !newAccount.type || !newAccount.initialBalance || isNaN(parseFloat(newAccount.initialBalance))) {
      toast.error("Please fill in all account fields correctly")
      return
    }

    try {
      await addAccount({
        name: newAccount.name,
        initialBalance: parseFloat(newAccount.initialBalance),
        icon: "bank",
        color: "#2196F3",
      })
      setNewAccount({ name: "", type: "checking", initialBalance: "" })
      toast.success("Account added successfully")
    } catch (error) {
      console.error("Failed to add account:", error)
      toast.error("Failed to add account")
    }
  }

  const handleDeleteAccount = async (id: string) => {
    try {
      await deleteAccount(id)
      toast.success("Account deleted successfully")
    } catch (error) {
      console.error("Failed to delete account:", error)
      toast.error("Failed to delete account")
    }
  }

  // Handle category operations
  const handleAddCategory = async () => {
    if (!newCategory.name || !newCategory.color) {
      toast.error("Please fill in all category fields")
      return
    }

    try {
      await addCategory({
        name: newCategory.name,
        color: newCategory.color,
        icon: newCategory.icon || "folder",
        parent: null,
      })
      setNewCategory({ name: "", color: "#2196F3", icon: "" })
      toast.success("Category added successfully")
    } catch (error) {
      console.error("Failed to add category:", error)
      toast.error("Failed to add category")
    }
  }

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id)
      toast.success("Category deleted successfully")
    } catch (error) {
      console.error("Failed to delete category:", error)
      toast.error("Failed to delete category")
    }
  }

  // Handle preferences update
  const handleUpdatePreferences = () => {
    // In a real app, this would be persisted to a user preferences store
    toast.success("Preferences updated successfully")
  }

  // Handle data export
  const handleExportData = () => {
    const data = {
      accounts,
      categories,
      // Add other data as needed
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `spendsage-export-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success("Data exported successfully")
  }

  const simulateProgress = async () => {
    for (const step of populateSteps.slice(0, -1)) { // All except last step
      setCurrentStep(step);
      // Random delay between 500ms and 1500ms
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    }
  };

  const handlePopulateData = async () => {
    setIsPopulating(true);
    setCurrentStep(populateSteps[0]);

    try {
      // Start the progress animation in the background
      const progressAnimation = simulateProgress();

      // Actually populate the data
      const success = await populateTestData();

      // Wait for both the animation and data population to complete
      await progressAnimation;

      // Short delay for dramatic effect
      await new Promise(resolve => setTimeout(resolve, 800));

      // Show final step
      setCurrentStep(populateSteps[populateSteps.length - 1]);
      
      if (success) {
        toast.success("Test data added successfully");
      } else {
        toast.error("Failed to add test data");
      }
    } catch (error) {
      console.error("Error adding test data:", error);
      toast.error("Failed to add test data");
    } finally {
      // Keep success/failure message visible briefly
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsPopulating(false);
      setCurrentStep(null);
    }
  };

  const handleClearAndPopulate = async () => {
    setIsPopulating(true);
    setCurrentStep(populateSteps[0]);

    try {
      // Clear the database first
      const cleared = await clearDatabase();
      if (!cleared) {
        throw new Error("Failed to clear database");
      }

      // Start the progress animation
      simulateProgress();

      // Populate with fresh data
      const success = await populateTestData();

      // Short delay for dramatic effect
      await new Promise(resolve => setTimeout(resolve, 800));

      // Show final step
      setCurrentStep(populateSteps[populateSteps.length - 1]);
      
      if (success) {
        toast.success("Database cleared and repopulated successfully");
      } else {
        toast.error("Failed to populate test data");
      }
    } catch (error) {
      console.error("Error in clear and populate:", error);
      toast.error("Failed to clear and populate database");
    } finally {
      // Keep success/failure message visible briefly
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsPopulating(false);
      setCurrentStep(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your accounts, categories, and preferences
        </p>
      </div>

      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Accounts</CardTitle>
              <CardDescription>
                Manage your financial accounts and their balances
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                {accounts.map((account) => (
                  <Card key={account._id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {account.name}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAccount(account._id)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        ${account.initialBalance.toFixed(2)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Type: {account.type}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-4">
                <div className="grid flex-1 gap-2">
                  <Label htmlFor="name">Account Name</Label>
                  <Input
                    id="name"
                    value={newAccount.name}
                    onChange={(e) =>
                      setNewAccount((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g., Main Checking"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={newAccount.type}
                    onValueChange={(value) =>
                      setNewAccount((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Checking</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                      <SelectItem value="credit">Credit Card</SelectItem>
                      <SelectItem value="investment">Investment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="initialBalance">Initial Balance</Label>
                  <div className="flex gap-2">
                    <Input
                      id="initialBalance"
                      type="number"
                      value={newAccount.initialBalance}
                      onChange={(e) =>
                        setNewAccount((prev) => ({ ...prev, initialBalance: e.target.value }))
                      }
                      placeholder="0.00"
                    />
                    <Button onClick={handleAddAccount}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>
                Manage your expense and income categories
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                {categories.map((category) => (
                  <Card key={category._id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div className="flex items-center space-x-2">
                        <div
                          className="h-4 w-4 rounded"
                          style={{ backgroundColor: category.color }}
                        />
                        <CardTitle className="text-sm font-medium">
                          {category.name}
                        </CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCategory(category._id)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </CardHeader>
                  </Card>
                ))}
              </div>

              <div className="flex gap-4">
                <div className="grid flex-1 gap-2">
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input
                    id="categoryName"
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g., Groceries"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    type="color"
                    value={newCategory.color}
                    onChange={(e) =>
                      setNewCategory((prev) => ({ ...prev, color: e.target.value }))
                    }
                    className="h-10 px-2 py-1"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="icon">Icon (optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="icon"
                      value={newCategory.icon}
                      onChange={(e) =>
                        setNewCategory((prev) => ({ ...prev, icon: e.target.value }))
                      }
                      placeholder="Icon name"
                    />
                    <Button onClick={handleAddCategory}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Customize your experience and notification settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select
                    value={preferences.currency}
                    onValueChange={(value) =>
                      setPreferences((prev) => ({ ...prev, currency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Select
                    value={preferences.dateFormat}
                    onValueChange={(value) =>
                      setPreferences((prev) => ({ ...prev, dateFormat: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      {DATE_FORMAT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Notifications</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="notifications" className="flex-1">
                      Enable Notifications
                    </Label>
                    <Switch
                      id="notifications"
                      checked={preferences.enableNotifications}
                      onCheckedChange={(checked) =>
                        setPreferences((prev) => ({
                          ...prev,
                          enableNotifications: checked,
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="overBudget" className="flex-1">
                      Notify when over budget
                    </Label>
                    <Switch
                      id="overBudget"
                      checked={preferences.notifyOnOverBudget}
                      onCheckedChange={(checked) =>
                        setPreferences((prev) => ({
                          ...prev,
                          notifyOnOverBudget: checked,
                        }))
                      }
                      disabled={!preferences.enableNotifications}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="lowBalance" className="flex-1">
                      Notify on low balance
                    </Label>
                    <div className="flex items-center gap-4">
                      <Switch
                        id="lowBalance"
                        checked={preferences.notifyOnLowBalance}
                        onCheckedChange={(checked) =>
                          setPreferences((prev) => ({
                            ...prev,
                            notifyOnLowBalance: checked,
                          }))
                        }
                        disabled={!preferences.enableNotifications}
                      />
                      {preferences.notifyOnLowBalance && (
                        <Input
                          type="number"
                          value={preferences.lowBalanceThreshold}
                          onChange={(e) =>
                            setPreferences((prev) => ({
                              ...prev,
                              lowBalanceThreshold: e.target.value,
                            }))
                          }
                          className="w-24"
                          placeholder="Amount"
                          disabled={!preferences.enableNotifications}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Button onClick={handleUpdatePreferences}>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Export your data or import data from other sources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <div className="space-x-2">
                  <Button 
                    variant="secondary"
                    onClick={handlePopulateData}
                    disabled={isPopulating}
                  >
                    {isPopulating ? "Populating..." : "Add Test Data"}
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        disabled={isPopulating}
                      >
                        Clear & Populate
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete all existing data and replace it with fresh test data.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleClearAndPopulate}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Clear & Populate
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        disabled={isPopulating}
                      >
                        Clear Data
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete all existing data from the database.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={async () => {
                            try {
                              const cleared = await clearDatabase();
                              if (cleared) {
                                toast.success("Database cleared successfully");
                              } else {
                                toast.error("Failed to clear database");
                              }
                            } catch (error) {
                              console.error("Error clearing database:", error);
                              toast.error("Failed to clear database");
                            }
                          }}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Clear Data
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <Button onClick={handleExportData} variant="outline">
                  Export All Data
                </Button>
              </div>

              {isPopulating && currentStep && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{currentStep.message}</span>
                    <span>{currentStep.progress}%</span>
                  </div>
                  <Progress value={currentStep.progress} className="h-2" />
                  <p className="text-sm text-muted-foreground italic animate-pulse">
                    {currentStep.dramaticMessage}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <CSVImport />
        </TabsContent>
      </Tabs>
    </div>
  )
} 