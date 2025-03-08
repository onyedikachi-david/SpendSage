import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Dashboard from "@/components/dashboard"
import Transactions from "@/components/transactions"
import Analytics from "@/components/analytics"
import Budgets from "@/components/budgets"
import Settings from "@/components/settings"
import { MainNav } from "@/components/main-nav"
import { SyncStatus } from "@/components/sync-status"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { Toaster } from "sonner"

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="spendsage-theme">
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <MainNav />
            <div className="flex items-center gap-4">
              <SyncStatus />
              <div className="h-5 w-px bg-border" />
              <ThemeToggle />
            </div>
          </div>
        </header>
        <main className="flex-1 container py-6">
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-full sm:w-auto">
              <TabsTrigger 
                value="dashboard" 
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                )}
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="transactions"
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                )}
              >
                Transactions
              </TabsTrigger>
              <TabsTrigger 
                value="analytics"
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                )}
              >
                Analytics
              </TabsTrigger>
              <TabsTrigger 
                value="budgets"
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                )}
              >
                Budgets
              </TabsTrigger>
              <TabsTrigger 
                value="settings"
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                )}
              >
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
      <Toaster richColors closeButton position="top-right" />
    </ThemeProvider>
  )
}
