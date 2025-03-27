"use client"

import { useState, useEffect } from "react"
import { useThemeColors } from "./theme-colors"
import { DollarBillIcon, CoinStackIcon, WalletIcon, PiggyBankIcon } from "./money-icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Palette } from "lucide-react"

interface DashboardHeaderProps {
  title: string
  subtitle?: string
}

export function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const { theme, setTheme, colors } = useThemeColors()
  const [mounted, setMounted] = useState(false)
  const [showMoneyRain, setShowMoneyRain] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const handleMoneyRain = () => {
    setShowMoneyRain(true)
    setTimeout(() => setShowMoneyRain(false), 5000)
  }

  return (
    <div className="relative">
      {showMoneyRain && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute inset-0 animate-money-rain"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 5C8.13401 5 5 6.34315 5 8V16C5 17.6569 8.13401 19 12 19C15.866 19 19 17.6569 19 16V8C19 6.34315 15.866 5 12 5Z' fill='%23${colors.secondary.replace(/^hsl$$|$$$/g, "").replace(/,/g, "%2C")}' /%3E%3Cpath d='M12 5C8.13401 5 5 6.34315 5 8V16C5 17.6569 8.13401 19 12 19C15.866 19 19 17.6569 19 16V8C19 6.34315 15.866 5 12 5Z' stroke='%23${colors.secondaryForeground.replace(/^hsl$$|$$$/g, "").replace(/,/g, "%2C")}' strokeWidth='1.5' /%3E%3C/svg%3E")`,
              backgroundSize: "24px 24px",
              animation: "moneyRain 10s linear infinite",
              opacity: 0.3,
            }}
          ></div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center animate-bounce-subtle"
            style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)` }}
          >
            {theme === "money" && <DollarBillIcon size={24} />}
            {theme === "wealth" && <CoinStackIcon size={24} />}
            {theme === "crypto" && <WalletIcon size={24} />}
            {theme === "vibrant" && <PiggyBankIcon size={24} />}
          </div>
          <div>
            <h1
              className="text-2xl font-bold"
              style={{
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {title}
            </h1>
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-primary/20 hover:bg-primary/10"
            onClick={handleMoneyRain}
          >
            <DollarBillIcon size={16} className="mr-2" />
            Money Rain
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="border-primary/20 hover:bg-primary/10">
                <Palette className="h-5 w-5" />
                <span className="sr-only">Theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Money Themes</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setTheme("money")} className={theme === "money" ? "bg-muted" : ""}>
                <DollarBillIcon size={16} className="mr-2" />
                Money Green
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("wealth")} className={theme === "wealth" ? "bg-muted" : ""}>
                <CoinStackIcon size={16} className="mr-2" />
                Gold Wealth
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("crypto")} className={theme === "crypto" ? "bg-muted" : ""}>
                <WalletIcon size={16} className="mr-2" />
                Crypto Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("vibrant")} className={theme === "vibrant" ? "bg-muted" : ""}>
                <PiggyBankIcon size={16} className="mr-2" />
                Vibrant
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

