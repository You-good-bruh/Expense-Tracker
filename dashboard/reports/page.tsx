"use client"

import { useEffect, useState } from "react"
import { BarChart3, LineChart, PieChart } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { DownloadReportButton } from "@/components/download-report-button"
import { CashFlowIcon, CoinStackIcon } from "@/components/money-icons"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { generateFinancialSummaryReport } from "@/lib/pdf-generator"
import type { ExpenseType, IncomeType, MACDData, ShareTransactionType } from "@/lib/types"
import { MACDChart } from "@/components/macd-chart"

export default function ReportsPage() {
  const [expenses, setExpenses] = useState<ExpenseType[]>([])
  const [shares, setShares] = useState<ShareTransactionType[]>([])
  const [incomes, setIncomes] = useState<IncomeType[]>([])
  const [macdData, setMacdData] = useState<MACDData[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Load data from localStorage or Supabase
    const fetchData = async () => {
      try {
        const supabase = getSupabaseBrowserClient()

        // Fetch expenses
        const { data: expensesData, error: expensesError } = await supabase.from("expenses").select("*")

        if (expensesError) throw expensesError
        if (expensesData && expensesData.length > 0) {
          setExpenses(expensesData as ExpenseType[])
        } else {
          // Fallback to localStorage
          const savedExpenses = localStorage.getItem("expenses")
          if (savedExpenses) setExpenses(JSON.parse(savedExpenses))
        }

        // Fetch shares
        const { data: sharesData, error: sharesError } = await supabase.from("shares").select("*")

        if (sharesError) throw sharesError
        if (sharesData && sharesData.length > 0) {
          setShares(sharesData as ShareTransactionType[])
        } else {
          // Fallback to localStorage
          const savedShares = localStorage.getItem("shares")
          if (savedShares) setShares(JSON.parse(savedShares))
        }

        // Fetch incomes
        const { data: incomesData, error: incomesError } = await supabase.from("income").select("*")

        if (incomesError) throw incomesError
        if (incomesData && incomesData.length > 0) {
          setIncomes(incomesData as IncomeType[])
        } else {
          // Fallback to localStorage
          const savedIncomes = localStorage.getItem("incomes")
          if (savedIncomes) setIncomes(JSON.parse(savedIncomes))
        }
      } catch (error) {
        console.error("Error fetching data:", error)

        // Fallback to localStorage
        const savedExpenses = localStorage.getItem("expenses")
        if (savedExpenses) setExpenses(JSON.parse(savedExpenses))

        const savedShares = localStorage.getItem("shares")
        if (savedShares) setShares(JSON.parse(savedShares))

        const savedIncomes = localStorage.getItem("incomes")
        if (savedIncomes) setIncomes(JSON.parse(savedIncomes))
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (expenses.length > 0 && incomes.length > 0) {
      calculateMACDData()
    }
  }, [expenses, incomes])

  const calculateMACDData = () => {
    // Get all dates from expenses and incomes
    const allDates = [...new Set([...expenses.map((e) => e.date), ...incomes.map((i) => i.date)])].sort()

    // Group expenses and incomes by date
    const expensesByDate: Record<string, number> = {}
    const incomesByDate: Record<string, number> = {}

    expenses.forEach((expense) => {
      if (expensesByDate[expense.date]) {
        expensesByDate[expense.date] += expense.amount
      } else {
        expensesByDate[expense.date] = expense.amount
      }
    })

    incomes.forEach((income) => {
      if (incomesByDate[income.date]) {
        incomesByDate[income.date] += income.amount
      } else {
        incomesByDate[income.date] = income.amount
      }
    })

    // Create data points for each date
    const dataPoints = allDates.map((date) => ({
      date,
      expenses: expensesByDate[date] || 0,
      income: incomesByDate[date] || 0,
    }))

    // Calculate 12-day EMA and 26-day EMA for expenses-income
    const ema12 = calculateEMA(
      dataPoints.map((d) => d.income - d.expenses),
      12,
    )
    const ema26 = calculateEMA(
      dataPoints.map((d) => d.income - d.expenses),
      26,
    )

    // Calculate MACD line (12-day EMA - 26-day EMA)
    const macdLine = ema12.map((value, index) => value - ema26[index])

    // Calculate 9-day EMA of MACD line (signal line)
    const signalLine = calculateEMA(macdLine, 9)

    // Calculate histogram (MACD line - signal line)
    const histogram = macdLine.map((value, index) => value - signalLine[index])

    // Create MACD data
    const macdData: MACDData[] = dataPoints.map((point, index) => ({
      date: point.date,
      macd: macdLine[index] || 0,
      signal: signalLine[index] || 0,
      histogram: histogram[index] || 0,
      expenses: point.expenses,
      income: point.income,
    }))

    setMacdData(macdData)
  }

  // Calculate Exponential Moving Average
  const calculateEMA = (data: number[], period: number): number[] => {
    const k = 2 / (period + 1)
    const emaData: number[] = []

    // First EMA is SMA
    let ema = data.slice(0, period).reduce((sum, value) => sum + value, 0) / period

    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        emaData.push(0) // Placeholder for first period-1 points
      } else {
        ema = data[i] * k + ema * (1 - k)
        emaData.push(ema)
      }
    }

    return emaData
  }

  const handleDownloadReport = async () => {
    // Generate and return the PDF
    return generateFinancialSummaryReport(expenses, incomes, shares)
  }

  if (!mounted) {
    return null
  }

  // Calculate expenses by category
  const expensesByCategory: Record<string, number> = {}
  expenses.forEach((expense) => {
    if (expensesByCategory[expense.category]) {
      expensesByCategory[expense.category] += expense.amount
    } else {
      expensesByCategory[expense.category] = expense.amount
    }
  })

  // Calculate expenses by recipient
  const expensesByRecipient: Record<string, number> = {}
  expenses.forEach((expense) => {
    const recipient = expense.recipient || "Unknown"
    if (expensesByRecipient[recipient]) {
      expensesByRecipient[recipient] += expense.amount
    } else {
      expensesByRecipient[recipient] = expense.amount
    }
  })

  // Calculate share transactions by type
  const sharesByType = {
    buy: shares.filter((share) => share.type === "buy").reduce((sum, share) => sum + share.price * share.quantity, 0),
    sell: shares.filter((share) => share.type === "sell").reduce((sum, share) => sum + share.price * share.quantity, 0),
  }

  // Calculate total expenses
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  // Calculate total income
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0)

  return (
    <div className="flex flex-col gap-4 money-pattern">
      <DashboardHeader title="Financial Reports" subtitle="Analyze your financial data" />

      <div className="flex justify-end mb-2">
        <DownloadReportButton
          onDownload={handleDownloadReport}
          reportName="Financial Summary Report"
          variant="outline"
        />
      </div>

      <Tabs defaultValue="macd" className="space-y-4">
        <TabsList className="bg-muted/60 p-1">
          <TabsTrigger
            value="macd"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <LineChart className="mr-2 h-4 w-4" />
            MACD Analysis
          </TabsTrigger>
          <TabsTrigger
            value="expenses"
            className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground"
          >
            <CashFlowIcon size={16} className="mr-2" />
            Expenses
          </TabsTrigger>
          <TabsTrigger
            value="shares"
            className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
          >
            <CoinStackIcon size={16} className="mr-2" />
            Shares
          </TabsTrigger>
          <TabsTrigger
            value="summary"
            className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
          >
            <PieChart className="mr-2 h-4 w-4" />
            Summary
          </TabsTrigger>
        </TabsList>
        <TabsContent value="macd" className="space-y-4">
          <Card className="border-primary/20 shadow-md money-card">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center">
                <LineChart className="mr-2 h-5 w-5" />
                MACD Chart - Income vs Expenses
              </CardTitle>
              <CardDescription>Moving Average Convergence Divergence analysis of your financial flow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <MACDChart data={macdData} />
              </div>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-muted-foreground">
                  <strong>MACD Line (Blue):</strong> Shows the difference between 12-day and 26-day EMAs of your net
                  cash flow.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Signal Line (Red):</strong> 9-day EMA of the MACD line, used to generate buy/sell signals.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Histogram (Green/Red):</strong> Difference between MACD and Signal lines. Green bars indicate
                  positive momentum, red bars indicate negative momentum.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="expenses" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-primary/20 shadow-md money-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-primary/5">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dollar-sign">₹{totalExpenses.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card className="col-span-1 md:col-span-2 border-primary/20 shadow-md money-card">
              <CardHeader className="bg-primary/5">
                <CardTitle className="flex items-center">
                  <CashFlowIcon size={20} className="mr-2" />
                  Expenses by Category
                </CardTitle>
                <CardDescription>Breakdown of your expenses by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(expensesByCategory).map(([category, amount]) => (
                    <div key={category} className="flex items-center">
                      <div className="w-full max-w-md">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{category}</span>
                          <span className="text-sm font-medium dollar-sign">₹{amount.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div
                            className="bg-primary h-2.5 rounded-full"
                            style={{ width: `${(amount / totalExpenses) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="ml-4 text-sm text-muted-foreground">
                        {((amount / totalExpenses) * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <Card className="border-primary/20 shadow-md money-card">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center">
                <CashFlowIcon size={20} className="mr-2" />
                Expenses by Recipient
              </CardTitle>
              <CardDescription>Who you've paid the most</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(expensesByRecipient)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([recipient, amount]) => (
                    <div key={recipient} className="flex items-center">
                      <div className="w-full max-w-md">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{recipient}</span>
                          <span className="text-sm font-medium dollar-sign">₹{amount.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div
                            className="bg-primary h-2.5 rounded-full"
                            style={{ width: `${(amount / totalExpenses) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="ml-4 text-sm text-muted-foreground">
                        {((amount / totalExpenses) * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="shares" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="border-primary/20 shadow-md money-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-primary/5">
                <CardTitle className="text-sm font-medium">Total Bought</CardTitle>
                <CoinStackIcon size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dollar-sign">₹{sharesByType.buy.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card className="border-primary/20 shadow-md money-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-primary/5">
                <CardTitle className="text-sm font-medium">Total Sold</CardTitle>
                <CoinStackIcon size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dollar-sign">₹{sharesByType.sell.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card className="border-primary/20 shadow-md money-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-primary/5">
                <CardTitle className="text-sm font-medium">Net Investment</CardTitle>
                <CoinStackIcon size={16} className="text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dollar-sign">
                  ₹{(sharesByType.buy - sharesByType.sell).toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>
          <Card className="border-primary/20 shadow-md money-card">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center">
                <CoinStackIcon size={20} className="mr-2" />
                Share Transactions
              </CardTitle>
              <CardDescription>Overview of your share portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Transaction Distribution</h3>
                  <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-blue-500"></div>
                      <span className="dollar-sign">Buy: ₹{sharesByType.buy.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-green-500"></div>
                      <span className="dollar-sign">Sell: ₹{sharesByType.sell.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-4">Share Holdings</h3>
                  {shares.length > 0 ? (
                    <div className="space-y-4">
                      {/* Calculate holdings by symbol */}
                      {Object.entries(
                        shares.reduce((acc: Record<string, { quantity: number; value: number }>, share) => {
                          if (!acc[share.symbol]) {
                            acc[share.symbol] = { quantity: 0, value: 0 }
                          }

                          if (share.type === "buy") {
                            acc[share.symbol].quantity += share.quantity
                            acc[share.symbol].value += share.price * share.quantity
                          } else {
                            acc[share.symbol].quantity -= share.quantity
                            acc[share.symbol].value -= share.price * share.quantity
                          }

                          return acc
                        }, {}),
                      ).map(([symbol, data]) => (
                        <div key={symbol} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{symbol}</div>
                            <div className="text-sm text-muted-foreground">{data.quantity} shares</div>
                          </div>
                          <div className="font-medium dollar-sign">₹{data.value.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No share transactions found</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="summary" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-primary/20 shadow-md money-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-primary/5">
                <CardTitle className="text-sm font-medium">Financial Summary</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Income</span>
                    <span className="font-medium text-success dollar-sign">₹{totalIncome.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Expenses</span>
                    <span className="font-medium text-destructive dollar-sign">₹{totalExpenses.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Net Balance</span>
                    <span
                      className={`font-medium ${totalIncome > totalExpenses ? "text-success" : "text-destructive"} dollar-sign`}
                    >
                      ₹{(totalIncome - totalExpenses).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Share Investments</span>
                    <span className="font-medium dollar-sign">
                      ₹{(sharesByType.buy - sharesByType.sell).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-primary/20 shadow-md money-card">
              <CardHeader className="bg-primary/5">
                <CardTitle>Monthly Breakdown</CardTitle>
                <CardDescription>Financial activity by month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Group expenses and income by month */}
                  {Object.entries(
                    [
                      ...expenses,
                      ...incomes.map((income) => ({
                        id: income.id,
                        amount: income.amount,
                        category: "Income",
                        description: income.description,
                        date: income.date,
                        location: "",
                        recipient: income.source,
                      })),
                    ].reduce((acc: Record<string, { expense: number; income: number }>, item) => {
                      const month = item.date.substring(0, 7) // YYYY-MM format
                      if (!acc[month]) {
                        acc[month] = { expense: 0, income: 0 }
                      }

                      if (item.category === "Income") {
                        acc[month].income += item.amount
                      } else {
                        acc[month].expense += item.amount
                      }

                      return acc
                    }, {}),
                  ).map(([month, data]) => (
                    <div key={month} className="space-y-2">
                      <div className="font-medium">
                        {new Date(month).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Income:</span>
                        <span className="text-success dollar-sign">₹{data.income.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Expenses:</span>
                        <span className="text-destructive dollar-sign">₹{data.expense.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm font-medium">
                        <span>Net:</span>
                        <span
                          className={
                            data.income > data.expense ? "text-success dollar-sign" : "text-destructive dollar-sign"
                          }
                        >
                          ₹{(data.income - data.expense).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

