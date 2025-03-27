"use client"

import type { SharePerformanceData } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useThemeColors } from "@/components/theme-colors"

interface SharePerformanceTableProps {
  data: SharePerformanceData[]
}

export function SharePerformanceTable({ data }: SharePerformanceTableProps) {
  const { colors } = useThemeColors()

  const formatCurrency = (value: number) => {
    return `₹${value.toFixed(2)}`
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  // Calculate totals
  const totalValue = data.reduce((sum, item) => sum + item.totalValue, 0)
  const totalProfitLoss = data.reduce((sum, item) => sum + item.profitLoss, 0)
  const totalProfitLossPercentage = (totalProfitLoss / (totalValue - totalProfitLoss)) * 100

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Symbol</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Avg. Buy Price</TableHead>
          <TableHead>Current Price</TableHead>
          <TableHead>Total Value</TableHead>
          <TableHead>Profit/Loss</TableHead>
          <TableHead>P/L %</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.symbol} className="hover:bg-muted/50">
            <TableCell className="font-medium">{item.symbol}</TableCell>
            <TableCell>{item.quantity}</TableCell>
            <TableCell className="dollar-sign">{formatCurrency(item.avgBuyPrice)}</TableCell>
            <TableCell className="dollar-sign">{formatCurrency(item.currentPrice)}</TableCell>
            <TableCell className="dollar-sign">{formatCurrency(item.totalValue)}</TableCell>
            <TableCell className={item.profitLoss >= 0 ? "text-success dollar-sign" : "text-destructive dollar-sign"}>
              {formatCurrency(item.profitLoss)}
            </TableCell>
            <TableCell className={item.profitLossPercentage >= 0 ? "text-success" : "text-destructive"}>
              {formatPercentage(item.profitLossPercentage)}
            </TableCell>
          </TableRow>
        ))}
        <TableRow className="font-bold bg-muted/20">
          <TableCell>Total</TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
          <TableCell></TableCell>
          <TableCell className="dollar-sign">{formatCurrency(totalValue)}</TableCell>
          <TableCell className={totalProfitLoss >= 0 ? "text-success dollar-sign" : "text-destructive dollar-sign"}>
            {formatCurrency(totalProfitLoss)}
          </TableCell>
          <TableCell className={totalProfitLossPercentage >= 0 ? "text-success" : "text-destructive"}>
            {formatPercentage(totalProfitLossPercentage)}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

