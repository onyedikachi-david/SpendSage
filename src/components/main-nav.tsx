import { Wallet } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { cn } from "@/lib/utils"

export function MainNav({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-6", className)}>
      <div className="flex items-center gap-3">
        <Wallet className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          SpendSage
        </span>
      </div>
      <ThemeToggle />
    </div>
  )
} 