import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface RootLayoutProps {
  children: ReactNode
  className?: string
}

export function RootLayout({ children, className }: RootLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <div className="mr-4 flex">
              <a className="mr-6 flex items-center space-x-2" href="/">
                <span className="font-bold">SpendSage</span>
              </a>
            </div>
          </div>
        </header>
        <main className={cn("flex-1 container py-6", className)}>
          {children}
        </main>
      </div>
    </div>
  )
} 