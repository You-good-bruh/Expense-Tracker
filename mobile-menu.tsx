"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, CreditCard, Wallet, LineChart, BarChart3, Settings, PieChart, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useThemeColors } from "./theme-colors"
import { DollarBillIcon, MoneyGrowthIcon } from "./money-icons"

export function MobileMenu() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { colors } = useThemeColors()

  const isActive = (path: string) => {
    return pathname === path
  }

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: "Expenses",
      path: "/dashboard/expenses",
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      name: "Income",
      path: "/dashboard/income",
      icon: <Wallet className="h-5 w-5" />,
    },
    {
      name: "Shares",
      path: "/dashboard/shares",
      icon: <LineChart className="h-5 w-5" />,
    },
    {
      name: "Share Analysis",
      path: "/dashboard/shares/analysis",
      icon: <PieChart className="h-5 w-5" />,
    },
    {
      name: "Reports",
      path: "/dashboard/reports",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      name: "Settings",
      path: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <DollarBillIcon size={24} />
              <span className="font-semibold">Expense Tracker</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          <div className="flex-1 overflow-auto py-2">
            <nav className="grid gap-1 px-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                    isActive(item.path)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t">
            <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-muted/50">
              <MoneyGrowthIcon size={20} />
              <span className="text-sm">Track your finances on the go!</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

