export interface ExpenseType {
  id: string
  amount: number
  category: string
  description: string
  date: string
  location: string
  recipient: string
  user_id?: string
}

export interface ShareTransactionType {
  id: string
  symbol: string
  type: "buy" | "sell"
  quantity: number
  price: number
  date: string
  notes: string
  user_id?: string
}

export interface IncomeType {
  id: string
  amount: number
  source: string
  description: string
  date: string
  user_id?: string
}

// MACD calculation types
export interface MACDData {
  date: string
  macd: number
  signal: number
  histogram: number
  expenses: number
  income: number
}

// Share performance data
export interface SharePerformanceData {
  symbol: string
  quantity: number
  avgBuyPrice: number
  currentPrice: number
  totalValue: number
  profitLoss: number
  profitLossPercentage: number
}

// Portfolio allocation data
export interface PortfolioAllocationData {
  symbol: string
  value: number
  percentage: number
  color: string
}

// Historical price data
export interface HistoricalPriceData {
  date: string
  price: number
  symbol: string
}

