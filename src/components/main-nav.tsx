import { Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./theme-toggle"
import { SyncStatus } from "./sync-status"

export function MainNav({ className }: { className?: string }) {
  return (
    <nav className={cn("sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      <div className="container flex h-14 items-center justify-between">
        {/* Logo and website name */}
        <div className="flex items-center gap-2 md:gap-3">
          <Wallet className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          <span className="text-lg md:text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            SpendSage
          </span>
        </div>

        {/* Right side items */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Hide sync status text on mobile */}
          <div className="hidden sm:block">
            <SyncStatus />
          </div>
          {/* Show only status indicator on mobile */}
          <div className="sm:hidden">
            <div className="flex items-center">
              <div className="h-2 w-2 rounded-full bg-green-500" />
            </div>
          </div>
          
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
} 