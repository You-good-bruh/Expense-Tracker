"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  BarChart3,
  CreditCard,
  Home,
  LineChart,
  LogOut,
  Package,
  Settings,
  User,
  Wallet,
  PieChart,
  Palette,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useThemeColors } from "@/components/theme-colors"
import { MobileMenu } from "@/components/mobile-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme, colors } = useThemeColors()

  useEffect(() => {
    setMounted(true)

    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true"

    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    // Get user data
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    router.push("/login")
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <MobileMenu />
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Package className="h-6 w-6" />
            <span className="hidden sm:inline-block">Expense Tracker</span>
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Palette className="h-5 w-5" />
                <span className="sr-only">Theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Theme</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setTheme("money")} className={theme === "money" ? "bg-muted" : ""}>
                Money Green
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("wealth")} className={theme === "wealth" ? "bg-muted" : ""}>
                Gold Wealth
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("crypto")} className={theme === "crypto" ? "bg-muted" : ""}>
                Crypto Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("vibrant")} className={theme === "vibrant" ? "bg-muted" : ""}>
                Vibrant
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Logout</span>
          </Button>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4">
              <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                <span className="">Navigation</span>
              </Link>
            </div>
            <div className="flex-1 overflow-auto py-2">
              <nav className="grid gap-1 px-2 text-sm font-medium">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-primary"
                >
                  <Home className="h-4 w-4" />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/expenses"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-primary"
                >
                  <CreditCard className="h-4 w-4" />
                  Expenses
                </Link>
                <Link
                  href="/dashboard/income"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-primary"
                >
                  <Wallet className="h-4 w-4" />
                  Income
                </Link>
                <Link
                  href="/dashboard/shares"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-primary"
                >
                  <LineChart className="h-4 w-4" />
                  Shares
                </Link>
                <Link
                  href="/dashboard/shares/analysis"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-primary"
                >
                  <PieChart className="h-4 w-4" />
                  Share Analysis
                </Link>
                <Link
                  href="/dashboard/reports"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-primary"
                >
                  <BarChart3 className="h-4 w-4" />
                  Reports
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-primary"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </nav>
            </div>
            <div className="mt-auto p-4">
              <div className="flex items-center gap-2 rounded-lg border p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-medium">{user?.name || "User"}</div>
                  <div className="text-xs text-muted-foreground">{user?.email || "user@example.com"}</div>
                </div>
              </div>
            </div>
          </div>
        </aside>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background z-30">
        <div className="flex justify-around items-center h-16">
          <Link href="/dashboard" className="flex flex-col items-center justify-center w-full h-full">
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link href="/dashboard/expenses" className="flex flex-col items-center justify-center w-full h-full">
            <CreditCard className="h-5 w-5" />
            <span className="text-xs mt-1">Expenses</span>
          </Link>
          <Link href="/dashboard/income" className="flex flex-col items-center justify-center w-full h-full">
            <Wallet className="h-5 w-5" />
            <span className="text-xs mt-1">Income</span>
          </Link>
          <Link href="/dashboard/shares" className="flex flex-col items-center justify-center w-full h-full">
            <LineChart className="h-5 w-5" />
            <span className="text-xs mt-1">Shares</span>
          </Link>
        </div>
      </div>

      {/* Add padding to the bottom on mobile to account for the navigation bar */}
      <div className="h-16 md:hidden"></div>
    </div>
  )
}

