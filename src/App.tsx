import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Dashboard from "@/components/dashboard"
import Transactions from "@/components/transactions"
import Analytics from "@/components/analytics"
import Budgets from "@/components/budgets"
import Settings from "@/components/settings"
import { MainNav } from "@/components/main-nav"
import { SyncStatus } from "@/components/sync-status"

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <MainNav />
          <div className="flex items-center space-x-4">
            <SyncStatus />
          </div>
        </div>
      </header>
      <main className="flex-1 container py-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-full sm:w-auto">
            <TabsTrigger value="dashboard" className="ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="transactions" className="ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              Transactions
            </TabsTrigger>
            <TabsTrigger value="analytics" className="ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="budgets" className="ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              Budgets
            </TabsTrigger>
            <TabsTrigger value="settings" className="ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              Settings
            </TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard" className="space-y-4">
            <Dashboard />
          </TabsContent>
          <TabsContent value="transactions" className="space-y-4">
            <Transactions />
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <Analytics />
          </TabsContent>
          <TabsContent value="budgets" className="space-y-4">
            <Budgets />
          </TabsContent>
          <TabsContent value="settings" className="space-y-4">
            <Settings />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
