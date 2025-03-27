"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type {
  ShareTransactionType,
  SharePerformanceData,
  PortfolioAllocationData,
  HistoricalPriceData,
} from "@/lib/types"
import { SharePriceChart } from "@/components/share-price-chart"
import { PortfolioPieChart } from "@/components/portfolio-pie-chart"
import { SharePerformanceTable } from "@/components/share-performance-table"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { useThemeColors } from "@/components/theme-colors"
import { DashboardHeader } from "@/components/dashboard-header"
import { CoinStackIcon, MoneyGrowthIcon } from "@/components/money-icons"
import { DownloadReportButton } from "@/components/download-report-button"
import { generatePortfolioReport } from "@/lib/pdf-generator"

export default function ShareAnalysisPage() {
  const [shares, setShares] = useState<ShareTransactionType[]>([])
  const [performanceData, setPerformanceData] = useState<SharePerformanceData[]>([])
  const [allocationData, setAllocationData] = useState<PortfolioAllocationData[]>([])
  const [priceHistoryData, setPriceHistoryData] = useState<HistoricalPriceData[]>([])
  const [mounted, setMounted] = useState(false)
  const { colors } = useThemeColors()

  useEffect(() => {
    setMounted(true)

    // Load shares from localStorage or Supabase
    const fetchShares = async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data, error } = await supabase.from("shares").select("*")

        if (error) {
          throw error
        }

        if (data && data.length > 0) {
          setShares(data as ShareTransactionType[])
        } else {
          // Fallback to localStorage
          const savedShares = localStorage.getItem("shares")
          if (savedShares) {
            setShares(JSON.parse(savedShares))
          }
        }
      } catch (error) {
        console.error("Error fetching shares:", error)
        // Fallback to localStorage
        const savedShares = localStorage.getItem("shares")
        if (savedShares) {
          setShares(JSON.parse(savedShares))
        }
      }
    }

    fetchShares()
  }, [])

  useEffect(() => {
    if (shares.length > 0) {
      generateAnalysisData()
    }
  }, [shares, colors])

  const generateAnalysisData = () => {
    // Generate mock current prices (in a real app, you'd fetch these from an API)
    const mockCurrentPrices: Record<string, number> = {}
    const uniqueSymbols = Array.from(new Set(shares.map((share) => share.symbol)))

    uniqueSymbols.forEach((symbol) => {
      // Generate a random current price that's somewhat realistic
      const transactions = shares.filter((share) => share.symbol === symbol)
      const avgPrice = transactions.reduce((sum, t) => sum + t.price, 0) / transactions.length
      // Random price between 80% and 120% of average price
      mockCurrentPrices[symbol] = avgPrice * (0.8 + Math.random() * 0.4)
    })

    // Calculate performance data
    const performance: SharePerformanceData[] = uniqueSymbols
      .map((symbol) => {
        const symbolTransactions = shares.filter((share) => share.symbol === symbol)

        // Calculate total shares owned
        const totalShares = symbolTransactions.reduce((total, t) => {
          return t.type === "buy" ? total + t.quantity : total - t.quantity
        }, 0)

        // Calculate average buy price
        const buyTransactions = symbolTransactions.filter((t) => t.type === "buy")
        const totalBuyValue = buyTransactions.reduce((sum, t) => sum + t.price * t.quantity, 0)
        const totalBuyShares = buyTransactions.reduce((sum, t) => sum + t.quantity, 0)
        const avgBuyPrice = totalBuyValue / totalBuyShares

        // Current value and profit/loss
        const currentPrice = mockCurrentPrices[symbol]
        const totalValue = totalShares * currentPrice
        const investedValue = totalShares * avgBuyPrice
        const profitLoss = totalValue - investedValue
        const profitLossPercentage = (profitLoss / investedValue) * 100

        return {
          symbol,
          quantity: totalShares,
          avgBuyPrice,
          currentPrice,
          totalValue,
          profitLoss,
          profitLossPercentage,
        }
      })
      .filter((item) => item.quantity > 0) // Only include shares you still own

    setPerformanceData(performance)

    // Calculate portfolio allocation
    const totalPortfolioValue = performance.reduce((sum, item) => sum + item.totalValue, 0)
    const allocation: PortfolioAllocationData[] = performance.map((item, index) => ({
      symbol: item.symbol,
      value: item.totalValue,
      percentage: (item.totalValue / totalPortfolioValue) * 100,
      color: colors.chartColors[index % colors.chartColors.length],
    }))

    setAllocationData(allocation)

    // Generate historical price data (mock data)
    const today = new Date()
    const priceHistory: HistoricalPriceData[] = []

    uniqueSymbols.forEach((symbol) => {
      const currentPrice = mockCurrentPrices[symbol]

      // Generate 30 days of price history
      for (let i = 30; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)

        // Random daily fluctuation between -3% and +3%
        const dailyChange = 1 + (Math.random() * 0.06 - 0.03)
        // Base price starts at 70-90% of current price and gradually moves toward current price
        const basePrice = currentPrice * (0.7 + Math.random() * 0.2)
        const progressFactor = i / 30
        const price = basePrice * (1 + (1 - progressFactor) * (currentPrice / basePrice - 1)) * dailyChange

        priceHistory.push({
          symbol,
          date: date.toISOString().split("T")[0],
          price,
        })
      }
    })

    setPriceHistoryData(priceHistory)
  }

  const handleDownloadReport = async () => {
    // Generate and return the PDF
    return generatePortfolioReport(performanceData)
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="flex flex-col gap-4 money-pattern">
      <DashboardHeader title="Share Portfolio Analysis" subtitle="Visualize your investment performance" />

      <div className="flex justify-end mb-2">
        <DownloadReportButton
          onDownload={handleDownloadReport}
          reportName="Portfolio Performance Report"
          variant="outline"
        />
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="bg-muted/60 p-1">
          <TabsTrigger
            value="performance"
            className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
          >
            <MoneyGrowthIcon size={16} className="mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger
            value="allocation"
            className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
          >
            <CoinStackIcon size={16} className="mr-2" />
            Allocation
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
          >
            <CoinStackIcon size={16} className="mr-2" />
            Price History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card className="border-primary/20 shadow-md money-card">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center">
                <MoneyGrowthIcon size={20} className="mr-2" />
                Portfolio Performance
              </CardTitle>
              <CardDescription>Detailed analysis of your share investments</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <SharePerformanceTable data={performanceData} />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-primary/20 shadow-md money-card">
              <CardHeader className="bg-primary/5">
                <CardTitle className="flex items-center">
                  <MoneyGrowthIcon size={20} className="mr-2" />
                  Profit/Loss by Share
                </CardTitle>
                <CardDescription>Visualization of profit/loss for each share</CardDescription>
              </CardHeader>
              <CardContent className="h-80 pt-6">
                <SharePriceChart
                  data={performanceData.map((item) => ({
                    symbol: item.symbol,
                    date: new Date().toISOString().split("T")[0],
                    price: item.profitLoss,
                  }))}
                  type="area"
                />
              </CardContent>
            </Card>

            <Card className="border-primary/20 shadow-md money-card">
              <CardHeader className="bg-primary/5">
                <CardTitle className="flex items-center">
                  <MoneyGrowthIcon size={20} className="mr-2" />
                  Performance Percentage
                </CardTitle>
                <CardDescription>Profit/loss percentage by share</CardDescription>
              </CardHeader>
              <CardContent className="h-80 pt-6">
                <SharePriceChart
                  data={performanceData.map((item) => ({
                    symbol: item.symbol,
                    date: new Date().toISOString().split("T")[0],
                    price: item.profitLossPercentage,
                  }))}
                  type="area"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="allocation" className="space-y-4">
          <Card className="border-primary/20 shadow-md money-card">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center">
                <CoinStackIcon size={20} className="mr-2" />
                Portfolio Allocation
              </CardTitle>
              <CardDescription>How your investment is distributed across different shares</CardDescription>
            </CardHeader>
            <CardContent className="h-96 pt-6">
              <PortfolioPieChart data={allocationData} />
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-md money-card">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center">
                <CoinStackIcon size={20} className="mr-2" />
                Allocation Details
              </CardTitle>
              <CardDescription>Detailed breakdown of your portfolio allocation</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Allocation %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allocationData.map((item) => (
                    <TableRow key={item.symbol}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                          {item.symbol}
                        </div>
                      </TableCell>
                      <TableCell className="dollar-sign">₹{item.value.toFixed(2)}</TableCell>
                      <TableCell>{item.percentage.toFixed(2)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="border-primary/20 shadow-md money-card">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center">
                <CoinStackIcon size={20} className="mr-2" />
                Price History
              </CardTitle>
              <CardDescription>Historical price trends for your shares</CardDescription>
            </CardHeader>
            <CardContent className="h-96 pt-6">
              <SharePriceChart data={priceHistoryData} type="line" />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {Array.from(new Set(priceHistoryData.map((item) => item.symbol))).map((symbol) => (
              <Card key={symbol} className="border-primary/20 shadow-md money-card">
                <CardHeader className="bg-primary/5">
                  <CardTitle className="flex items-center">
                    <CoinStackIcon size={20} className="mr-2" />
                    {symbol}
                  </CardTitle>
                  <CardDescription>30-day price history</CardDescription>
                </CardHeader>
                <CardContent className="h-60 pt-6">
                  <SharePriceChart data={priceHistoryData.filter((item) => item.symbol === symbol)} type="area" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Import Table components
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

