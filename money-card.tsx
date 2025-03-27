import type { ReactNode } from "react"
import { useThemeColors } from "./theme-colors"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MoneyCardProps {
  title: string
  value: string | number
  description?: string
  icon?: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
  valueClassName?: string
  variant?: "default" | "gold" | "platinum" | "success" | "danger"
  animation?: "none" | "float" | "pulse" | "bounce"
}

export function MoneyCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
  valueClassName,
  variant = "default",
  animation = "none",
}: MoneyCardProps) {
  const { colors } = useThemeColors()

  // Define animation class
  const animationClass =
    animation === "float"
      ? "animate-float"
      : animation === "pulse"
        ? "animate-pulse"
        : animation === "bounce"
          ? "animate-bounce-subtle"
          : ""

  // Define variant styles
  const variantStyles = {
    default: {
      card: "border-primary/20 shadow-md",
      header: "bg-primary/5",
      value: "",
    },
    gold: {
      card: "border-yellow-400/50 shadow-md",
      header: "bg-gradient-to-r from-yellow-400 to-yellow-600 text-black",
      value: "text-yellow-600 dark:text-yellow-400",
    },
    platinum: {
      card: "border-gray-300/50 shadow-md",
      header: "bg-gradient-to-r from-gray-300 to-gray-500 text-black",
      value: "text-gray-700 dark:text-gray-300",
    },
    success: {
      card: "border-green-500/20 shadow-md",
      header: "bg-green-500/10",
      value: "text-green-600 dark:text-green-400",
    },
    danger: {
      card: "border-red-500/20 shadow-md",
      header: "bg-red-500/10",
      value: "text-red-600 dark:text-red-400",
    },
  }

  return (
    <Card className={cn("overflow-hidden money-card", variantStyles[variant].card, animationClass, className)}>
      <CardHeader className={cn("rounded-t-lg", variantStyles[variant].header)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className={cn("text-2xl font-bold dollar-sign", variantStyles[variant].value, valueClassName)}>
          {value}
        </div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {trend && (
          <p className={cn("text-xs flex items-center mt-1", trend.isPositive ? "text-success" : "text-destructive")}>
            <span className={cn("mr-1 text-lg", trend.isPositive ? "text-success" : "text-destructive")}>
              {trend.isPositive ? "↑" : "↓"}
            </span>
            {trend.value}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  )
}

