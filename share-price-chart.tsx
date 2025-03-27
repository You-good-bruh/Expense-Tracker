"use client"

import { useEffect, useState } from "react"
import type { HistoricalPriceData } from "@/lib/types"
import { useThemeColors } from "@/components/theme-colors"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface SharePriceChartProps {
  data: HistoricalPriceData[]
  type?: "line" | "area"
  showGradient?: boolean
}

export function SharePriceChart({ data, type = "line", showGradient = true }: SharePriceChartProps) {
  const [chartData, setChartData] = useState<HistoricalPriceData[]>([])
  const [symbols, setSymbols] = useState<string[]>([])
  const { colors } = useThemeColors()

  useEffect(() => {
    // Sort data by date
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    setChartData(sortedData)

    // Extract unique symbols
    const uniqueSymbols = Array.from(new Set(data.map((item) => item.symbol)))
    setSymbols(uniqueSymbols)
  }, [data])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const formatCurrency = (value: number) => {
    return `₹${value.toFixed(2)}`
  }

  // Group data by date for multi-line chart
  const groupedData = chartData.reduce((acc: any[], item) => {
    const existingItem = acc.find((i) => i.date === item.date)
    if (existingItem) {
      existingItem[item.symbol] = item.price
    } else {
      const newItem: any = { date: item.date }
      newItem[item.symbol] = item.price
      acc.push(newItem)
    }
    return acc
  }, [])

  if (type === "area") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={groupedData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <defs>
            {symbols.map((symbol, index) => (
              <linearGradient key={symbol} id={`gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.chartColors[index % colors.chartColors.length]} stopOpacity={0.8} />
                <stop
                  offset="95%"
                  stopColor={colors.chartColors[index % colors.chartColors.length]}
                  stopOpacity={0.2}
                />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 12, fill: colors.foreground }}
            stroke={colors.foreground}
          />
          <YAxis
            tickFormatter={formatCurrency}
            tick={{ fontSize: 12, fill: colors.foreground }}
            stroke={colors.foreground}
          />
          <Tooltip
            formatter={(value: number) => formatCurrency(value)}
            labelFormatter={(label) => formatDate(label as string)}
            contentStyle={{
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.cardForeground,
            }}
          />
          <Legend wrapperStyle={{ color: colors.foreground }} />

          {symbols.map((symbol, index) => (
            <Area
              key={symbol}
              type="monotone"
              dataKey={symbol}
              name={symbol}
              fill={showGradient ? `url(#gradient-${symbol})` : colors.chartColors[index % colors.chartColors.length]}
              stroke={colors.chartColors[index % colors.chartColors.length]}
              activeDot={{ r: 8, fill: colors.chartColors[index % colors.chartColors.length] }}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={groupedData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fontSize: 12, fill: colors.foreground }}
          stroke={colors.foreground}
        />
        <YAxis
          tickFormatter={formatCurrency}
          tick={{ fontSize: 12, fill: colors.foreground }}
          stroke={colors.foreground}
        />
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          labelFormatter={(label) => formatDate(label as string)}
          contentStyle={{
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.cardForeground,
          }}
        />
        <Legend wrapperStyle={{ color: colors.foreground }} />

        {symbols.map((symbol, index) => (
          <Line
            key={symbol}
            type="monotone"
            dataKey={symbol}
            name={symbol}
            stroke={colors.chartColors[index % colors.chartColors.length]}
            activeDot={{ r: 8, fill: colors.chartColors[index % colors.chartColors.length] }}
            strokeWidth={2}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

