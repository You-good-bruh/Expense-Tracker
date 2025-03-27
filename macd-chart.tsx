"use client"

import { useEffect, useState } from "react"
import type { MACDData } from "@/lib/types"
import { useThemeColors } from "@/components/theme-colors"
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface MACDChartProps {
  data: MACDData[]
}

export function MACDChart({ data }: MACDChartProps) {
  const [chartData, setChartData] = useState<MACDData[]>([])
  const { colors } = useThemeColors()

  useEffect(() => {
    // Sort data by date
    const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    setChartData(sortedData)
  }, [data])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const formatCurrency = (value: number) => {
    return `₹${value.toFixed(2)}`
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <defs>
          <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colors.success} stopOpacity={0.8} />
            <stop offset="95%" stopColor={colors.success} stopOpacity={0.2} />
          </linearGradient>
          <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colors.destructive} stopOpacity={0.8} />
            <stop offset="95%" stopColor={colors.destructive} stopOpacity={0.2} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fontSize: 12, fill: colors.foreground }}
          stroke={colors.foreground}
        />
        <YAxis
          yAxisId="left"
          orientation="left"
          tickFormatter={formatCurrency}
          tick={{ fontSize: 12, fill: colors.foreground }}
          stroke={colors.foreground}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
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

        {/* Income and Expenses */}
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="income"
          name="Income"
          fill="url(#incomeGradient)"
          stroke={colors.success}
          activeDot={{ r: 8, fill: colors.success }}
        />
        <Area
          yAxisId="left"
          type="monotone"
          dataKey="expenses"
          name="Expenses"
          fill="url(#expenseGradient)"
          stroke={colors.destructive}
          activeDot={{ r: 8, fill: colors.destructive }}
        />

        {/* MACD Line and Signal Line */}
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="macd"
          name="MACD Line"
          stroke={colors.info}
          dot={false}
          strokeWidth={2}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="signal"
          name="Signal Line"
          stroke={colors.accent}
          dot={false}
          strokeWidth={2}
        />

        {/* Histogram */}
        <Bar
          yAxisId="right"
          dataKey="histogram"
          name="Histogram"
          fill={(data) => (data.histogram >= 0 ? colors.success : colors.destructive)}
          radius={[2, 2, 0, 0]}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

