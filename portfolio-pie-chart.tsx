"use client"

import { useEffect, useState } from "react"
import type { PortfolioAllocationData } from "@/lib/types"
import { useThemeColors } from "@/components/theme-colors"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend, Sector } from "recharts"

interface PortfolioPieChartProps {
  data: PortfolioAllocationData[]
}

export function PortfolioPieChart({ data }: PortfolioPieChartProps) {
  const [chartData, setChartData] = useState<PortfolioAllocationData[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const { colors } = useThemeColors()

  useEffect(() => {
    // Add colors to data if not already present
    const dataWithColors = data.map((item, index) => ({
      ...item,
      color: item.color || colors.chartColors[index % colors.chartColors.length],
    }))
    setChartData(dataWithColors)
  }, [data, colors])

  const formatCurrency = (value: number) => {
    return `₹${value.toFixed(2)}`
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`
  }

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="p-3 bg-card border border-border rounded-md shadow-md">
          <p className="font-bold text-cardForeground">{data.symbol}</p>
          <p className="text-sm text-muted-foreground">Value: {formatCurrency(data.value)}</p>
          <p className="text-sm text-muted-foreground">Allocation: {formatPercentage(data.percentage)}</p>
        </div>
      )
    }
    return null
  }

  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props
    const sin = Math.sin(-RADIAN * midAngle)
    const cos = Math.cos(-RADIAN * midAngle)
    const sx = cx + (outerRadius + 10) * cos
    const sy = cy + (outerRadius + 10) * sin
    const mx = cx + (outerRadius + 30) * cos
    const my = cy + (outerRadius + 30) * sin
    const ex = mx + (cos >= 0 ? 1 : -1) * 22
    const ey = my
    const textAnchor = cos >= 0 ? "start" : "end"

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="text-sm font-medium">
          {payload.symbol}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          textAnchor={textAnchor}
          fill={colors.foreground}
          className="text-xs"
        >
          {`₹${value.toFixed(2)}`}
        </text>
        <text
          x={ex + (cos >= 0 ? 1 : -1) * 12}
          y={ey}
          dy={18}
          textAnchor={textAnchor}
          fill={colors.mutedForeground}
          className="text-xs"
        >
          {`(${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          nameKey="symbol"
          onMouseEnter={onPieEnter}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} stroke={colors.background} strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend formatter={(value) => <span style={{ color: colors.foreground }}>{value}</span>} />
      </PieChart>
    </ResponsiveContainer>
  )
}

