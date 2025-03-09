import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Dashboard from "@/components/dashboard"
import Transactions from "@/components/transactions"
import Analytics from "@/components/analytics"
import Budgets from "@/components/budgets"
import Settings from "@/components/settings"
import { MainNav } from "@/components/main-nav"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import { AchievementsPage } from "@/components/achievements/AchievementsPage"

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="spendsage-theme">
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <MainNav />
        <main className="flex-1 container py-4 md:py-6 px-4 md:px-6">
          <Tabs defaultValue="dashboard" className="space-y-4 md:space-y-6">
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <TabsList className="inline-flex h-9 md:h-10 items-center justify-start md:justify-center rounded-md bg-muted p-1 text-muted-foreground w-auto min-w-full md:w-auto">
                <TabsTrigger 
                  value="dashboard" 
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  <span className="mr-1 md:mr-2">📊</span> <span className="whitespace-nowrap">Dashboard</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="transactions"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  <span className="mr-1 md:mr-2">💸</span> <span className="whitespace-nowrap">Transactions</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  <span className="mr-1 md:mr-2">📈</span> <span className="whitespace-nowrap">Analytics</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="budgets"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  <span className="mr-1 md:mr-2">💰</span> <span className="whitespace-nowrap">Budgets</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="achievements"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  <span className="mr-1 md:mr-2">🏆</span> <span className="whitespace-nowrap">Achievements</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="settings"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                >
                  <span className="mr-1 md:mr-2">⚙️</span> <span className="whitespace-nowrap">Settings</span>
                </TabsTrigger>
              </TabsList>
            </div>
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
            <TabsContent value="achievements" className="space-y-4">
              <AchievementsPage />
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
