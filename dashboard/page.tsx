"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CreditCard, LineChart, Plus, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MoneyCard } from "@/components/money-card"
import { DashboardHeader } from "@/components/dashboard-header"
import { CategoryBadge } from "@/components/category-badge"
import {
  DollarBillIcon,
  CoinStackIcon,
  WalletIcon,
  PiggyBankIcon,
  MoneyGrowthIcon,
  CashFlowIcon,
} from "@/components/money-icons"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import type { ExpenseType, IncomeType, ShareTransactionType } from "@/lib/types"
import { toast } from "@/components/ui/use-toast"
import { getCategoryColor } from "@/lib/utils"
import { useThemeColors } from "@/components/theme-colors"

export default function Dashboard() {
  const [expenses, setExpenses] = useState<ExpenseType[]>([])
  const [incomes, setIncomes] = useState<IncomeType[]>([])
  const [shares, setShares] = useState<ShareTransactionType[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const { colors } = useThemeColors()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) return

        setUserId(session.user.id)

        // Fetch expenses
        const { data: expensesData, error: expensesError } = await supabase
          .from("expenses")
          .select("*")
          .eq("user_id", session.user.id)
          .order("date", { ascending: false })

        if (expensesError) throw expensesError
        setExpenses(expensesData as ExpenseType[])

        // Fetch incomes
        const { data: incomesData, error: incomesError } = await supabase
          .from("income")
          .select("*")
          .eq("user_id", session.user.id)
          .order("date", { ascending: false })

        if (incomesError) throw incomesError
        setIncomes(incomesData as IncomeType[])

        // Fetch shares
        const { data: sharesData, error: sharesError } = await supabase
          .from("shares")
          .select("*")
          .eq("user_id", session.user.id)
          .order("date", { ascending: false })

        if (sharesError) throw sharesError
        setShares(sharesData as ShareTransactionType[])
      } catch (error: any) {
        console.error("Error fetching data:", error)

        // Fallback to localStorage if Supabase fails
        const savedExpenses = localStorage.getItem("expenses")
        if (savedExpenses) setExpenses(JSON.parse(savedExpenses))

        const savedIncomes = localStorage.getItem("incomes")
        if (savedIncomes) setIncomes(JSON.parse(savedIncomes))

        const savedShares = localStorage.getItem("shares")
        if (savedShares) setShares(JSON.parse(savedShares))

        toast({
          title: "Using local data",
          description: "Could not connect to database. Using locally stored data instead.",
          variant: "warning",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  // Calculate total income
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0)

  // Calculate total shares value
  const totalSharesValue = shares.reduce((sum, share) => {
    return share.type === "buy" ? sum + share.price * share.quantity : sum - share.price * share.quantity
  }, 0)

  // Get recent expenses
  const recentExpenses = expenses.slice(0, 5)

  // Get recent incomes
  const recentIncomes = incomes.slice(0, 5)

  // Get recent share transactions
  const recentShares = shares.slice(0, 5)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 money-pattern">
      <DashboardHeader title="Financial Dashboard" subtitle="Track your money, grow your wealth" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MoneyCard
          title="Total Expenses"
          value={`₹${totalExpenses.toFixed(2)}`}
          description="Your total expenses"
          icon={<CreditCard className="h-4 w-4" />}
          trend={{ value: 20.1, isPositive: false }}
          variant="danger"
          animation="float"
        />

        <MoneyCard
          title="Total Income"
          value={`₹${totalIncome.toFixed(2)}`}
          description="Your total income"
          icon={<WalletIcon size={16} />}
          trend={{ value: 5.2, isPositive: true }}
          variant="success"
          animation="float"
        />

        <MoneyCard
          title="Share Investments"
          value={`₹${Math.abs(totalSharesValue).toFixed(2)}`}
          description={totalSharesValue >= 0 ? "Investment value" : "Investment loss"}
          icon={<CoinStackIcon size={16} />}
          trend={{ value: 12.5, isPositive: totalSharesValue >= 0 }}
          variant="gold"
          animation="float"
        />

        <MoneyCard
          title="Net Balance"
          value={`₹${(totalIncome - totalExpenses).toFixed(2)}`}
          description={totalIncome > totalExpenses ? "Surplus" : "Deficit"}
          icon={<DollarBillIcon size={16} />}
          variant={totalIncome > totalExpenses ? "success" : "danger"}
          animation="float"
        />
      </div>

      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList className="bg-muted/60 p-1">
          <TabsTrigger
            value="recent"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            Recent Activity
          </TabsTrigger>
          <TabsTrigger
            value="expenses"
            className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground"
          >
            Expenses
          </TabsTrigger>
          <TabsTrigger
            value="income"
            className="data-[state=active]:bg-success data-[state=active]:text-success-foreground"
          >
            Income
          </TabsTrigger>
          <TabsTrigger
            value="shares"
            className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
          >
            Shares
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-primary/20 shadow-md overflow-hidden money-card">
              <CardHeader className="pb-2 border-b bg-primary/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    <CashFlowIcon size={20} className="mr-2" />
                    Recent Expenses
                  </CardTitle>
                  <div className="bg-destructive/10 text-destructive px-2 py-1 rounded-full text-xs font-medium">
                    Outflow
                  </div>
                </div>
                <CardDescription>Your recent expenses</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {recentExpenses.length > 0 ? (
                    recentExpenses.map((expense) => (
                      <div key={expense.id} className="flex items-center p-4 hover:bg-muted/50 transition-colors">
                        <div
                          className="flex items-center justify-center rounded-full p-2 mr-3"
                          style={{ backgroundColor: `${getCategoryColor(expense.category)}20` }}
                        >
                          <CreditCard className="h-4 w-4" style={{ color: getCategoryColor(expense.category) }} />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">{expense.description}</p>
                          <div className="flex items-center gap-2">
                            <CategoryBadge category={expense.category} />
                            <p className="text-xs text-muted-foreground">Paid to: {expense.recipient || "N/A"}</p>
                          </div>
                        </div>
                        <div className="font-medium text-destructive">₹{expense.amount.toFixed(2)}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">No recent expenses</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/20 p-3">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/expenses">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Expense
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-primary/20 shadow-md overflow-hidden money-card">
              <CardHeader className="pb-2 border-b bg-primary/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    <MoneyGrowthIcon size={20} className="mr-2" />
                    Recent Income
                  </CardTitle>
                  <div className="bg-success/10 text-success px-2 py-1 rounded-full text-xs font-medium">Inflow</div>
                </div>
                <CardDescription>Your recent income transactions</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {recentIncomes.length > 0 ? (
                    recentIncomes.map((income) => (
                      <div key={income.id} className="flex items-center p-4 hover:bg-muted/50 transition-colors">
                        <div
                          className="flex items-center justify-center rounded-full p-2 mr-3"
                          style={{ backgroundColor: `${getCategoryColor(income.source)}20` }}
                        >
                          <Wallet className="h-4 w-4" style={{ color: getCategoryColor(income.source) }} />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">{income.description}</p>
                          <CategoryBadge category={income.source} />
                        </div>
                        <div className="font-medium text-success">₹{income.amount.toFixed(2)}</div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">No recent income</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/20 p-3">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/income">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Income
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-primary/20 shadow-md overflow-hidden money-card">
              <CardHeader className="pb-2 border-b bg-primary/5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    <CoinStackIcon size={20} className="mr-2" />
                    Recent Shares
                  </CardTitle>
                  <div className="bg-secondary/10 text-secondary-foreground px-2 py-1 rounded-full text-xs font-medium">
                    Investments
                  </div>
                </div>
                <CardDescription>Your recent share transactions</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {recentShares.length > 0 ? (
                    recentShares.map((share) => (
                      <div key={share.id} className="flex items-center p-4 hover:bg-muted/50 transition-colors">
                        <div
                          className="flex items-center justify-center rounded-full p-2 mr-3"
                          style={{
                            backgroundColor:
                              share.type === "buy" ? "rgba(59, 130, 246, 0.1)" : "rgba(16, 185, 129, 0.1)",
                            color: share.type === "buy" ? "rgb(59, 130, 246)" : "rgb(16, 185, 129)",
                          }}
                        >
                          <LineChart className="h-4 w-4" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">{share.symbol}</p>
                          <p className="text-xs text-muted-foreground">
                            {share.type === "buy" ? "Buy" : "Sell"} - {share.quantity} shares
                          </p>
                        </div>
                        <div
                          className={`font-medium ${share.type === "buy" ? "text-blue-600 dark:text-blue-400" : "text-green-500 dark:text-green-400"}`}
                        >
                          {share.type === "buy" ? "-" : "+"}₹{(share.price * share.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center">
                      <p className="text-sm text-muted-foreground">No recent share transactions</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/20 p-3">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/shares">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Transaction
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card className="border-primary/20 shadow-md overflow-hidden money-card">
            <CardHeader className="pb-2 border-b bg-primary/5">
              <CardTitle className="text-lg flex items-center">
                <PiggyBankIcon size={20} className="mr-2" />
                Financial Summary
              </CardTitle>
              <CardDescription>Your current financial status at a glance</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Income vs Expenses</h3>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-success"
                      style={{
                        width: `${Math.min(100, (totalIncome / (totalIncome + totalExpenses)) * 100)}%`,
                        transition: "width 1s ease-in-out",
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-success">Income: ₹{totalIncome.toFixed(2)}</span>
                    <span className="text-destructive">Expenses: ₹{totalExpenses.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Savings Rate</h3>
                  <div className="flex items-center justify-center">
                    <div className="relative w-24 h-24">
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <circle cx="50" cy="50" r="40" fill="none" stroke={colors.muted} strokeWidth="10" />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={totalIncome > totalExpenses ? colors.success : colors.destructive}
                          strokeWidth="10"
                          strokeDasharray="251.2"
                          strokeDashoffset={251.2 - 251.2 * Math.max(0, (totalIncome - totalExpenses) / totalIncome)}
                          transform="rotate(-90 50 50)"
                          strokeLinecap="round"
                          style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
                        />
                        <text
                          x="50"
                          y="50"
                          textAnchor="middle"
                          y="50"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill={totalIncome > totalExpenses ? colors.success : colors.destructive}
                          fontSize="14"
                          fontWeight="bold"
                        >
                          {totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0}%
                        </text>
                      </svg>
                    </div>
                  </div>
                  <div className="text-center text-xs">
                    <span className={totalIncome > totalExpenses ? "text-success" : "text-destructive"}>
                      {totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0}% of income
                      saved
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Investment Allocation</h3>
                  <div className="flex items-center justify-center">
                    <div className="coin-flip">
                      <CoinStackIcon size={48} />
                    </div>
                  </div>
                  <div className="text-center text-xs">
                    <span className="text-secondary-foreground">
                      ₹{Math.abs(totalSharesValue).toFixed(2)} in investments
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <Card className="border-primary/20 shadow-md overflow-hidden money-card">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-primary/5">
              <div>
                <CardTitle className="flex items-center">
                  <CashFlowIcon size={20} className="mr-2" />
                  Expenses
                </CardTitle>
                <CardDescription>Manage and track your expenses</CardDescription>
              </div>
              <Button asChild className="money-gradient-danger text-white">
                <Link href="/dashboard/expenses">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Expense
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {expenses.length > 0 ? (
                  expenses.slice(0, 10).map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between border-b pb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium leading-none">{expense.description}</p>
                          <CategoryBadge category={expense.category} />
                        </div>
                        <p className="text-sm text-muted-foreground">Paid to: {expense.recipient || "N/A"}</p>
                        <p className="text-xs text-muted-foreground">{expense.date}</p>
                      </div>
                      <div className="font-medium text-destructive dollar-sign">₹{expense.amount.toFixed(2)}</div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <CashFlowIcon size={48} className="mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-4">No expenses found</p>
                    <Button asChild className="money-gradient-danger text-white">
                      <Link href="/dashboard/expenses">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First Expense
                      </Link>
                    </Button>
                  </div>
                )}

                {expenses.length > 10 && (
                  <div className="text-center">
                    <Button variant="link" asChild>
                      <Link href="/dashboard/expenses">View all expenses</Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income" className="space-y-4">
          <Card className="border-primary/20 shadow-md overflow-hidden money-card">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-primary/5">
              <div>
                <CardTitle className="flex items-center">
                  <MoneyGrowthIcon size={20} className="mr-2" />
                  Income
                </CardTitle>
                <CardDescription>Manage and track your income</CardDescription>
              </div>
              <Button asChild className="money-gradient-success text-white">
                <Link href="/dashboard/income">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Income
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {incomes.length > 0 ? (
                  incomes.slice(0, 10).map((income) => (
                    <div key={income.id} className="flex items-center justify-between border-b pb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium leading-none">{income.description}</p>
                          <CategoryBadge category={income.source} />
                        </div>
                        <p className="text-xs text-muted-foreground">{income.date}</p>
                      </div>
                      <div className="font-medium text-success dollar-sign">₹{income.amount.toFixed(2)}</div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <MoneyGrowthIcon size={48} className="mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-4">No income records found</p>
                    <Button asChild className="money-gradient-success text-white">
                      <Link href="/dashboard/income">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First Income
                      </Link>
                    </Button>
                  </div>
                )}

                {incomes.length > 10 && (
                  <div className="text-center">
                    <Button variant="link" asChild>
                      <Link href="/dashboard/income">View all income</Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shares" className="space-y-4">
          <Card className="border-primary/20 shadow-md overflow-hidden money-card">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-primary/5">
              <div>
                <CardTitle className="flex items-center">
                  <CoinStackIcon size={20} className="mr-2" />
                  Share Transactions
                </CardTitle>
                <CardDescription>Manage your share portfolio</CardDescription>
              </div>
              <Button asChild className="money-gradient-gold text-black">
                <Link href="/dashboard/shares">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Transaction
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {shares.length > 0 ? (
                  shares.slice(0, 10).map((share) => (
                    <div key={share.id} className="flex items-center justify-between border-b pb-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{share.symbol}</p>
                        <p className="text-sm text-muted-foreground">
                          {share.type === "buy" ? "Buy" : "Sell"} - {share.quantity} shares at ₹{share.price.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">{share.date}</p>
                      </div>
                      <div
                        className={`font-medium ${share.type === "buy" ? "text-blue-600 dark:text-blue-400" : "text-green-500 dark:text-green-400"} dollar-sign`}
                      >
                        {share.type === "buy" ? "-" : "+"}₹{(share.price * share.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <CoinStackIcon size={48} className="mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-4">No share transactions found</p>
                    <Button asChild className="money-gradient-gold text-black">
                      <Link href="/dashboard/shares">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First Transaction
                      </Link>
                    </Button>
                  </div>
                )}

                {shares.length > 10 && (
                  <div className="text-center">
                    <Button variant="link" asChild>
                      <Link href="/dashboard/shares">View all transactions</Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

