import jsPDF from "jspdf"
import "jspdf-autotable"
import type { ExpenseType, IncomeType, ShareTransactionType, SharePerformanceData } from "@/lib/types"
import { formatDate } from "@/lib/utils"

// Extend the jsPDF type to include autoTable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

// Helper function to add title and metadata to PDF
const setupPDF = (title: string, subtitle?: string) => {
  const pdf = new jsPDF()

  // Add metadata
  pdf.setProperties({
    title: title,
    subject: subtitle || "Financial Report",
    author: "Expense Tracker",
    creator: "Expense Tracker App",
  })

  // Add title
  pdf.setFontSize(20)
  pdf.setTextColor(32, 128, 64) // Green color for title
  pdf.text(title, 14, 22)

  // Add subtitle if provided
  if (subtitle) {
    pdf.setFontSize(12)
    pdf.setTextColor(100, 100, 100) // Gray color for subtitle
    pdf.text(subtitle, 14, 30)
  }

  // Add date
  pdf.setFontSize(10)
  pdf.setTextColor(100, 100, 100)
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 38)

  // Add horizontal line
  pdf.setDrawColor(200, 200, 200)
  pdf.line(14, 42, 196, 42)

  return pdf
}

// Generate expense report PDF
export const generateExpenseReport = (expenses: ExpenseType[], period?: string) => {
  const title = "Expense Report"
  const subtitle = period ? `Period: ${period}` : "All Expenses"

  const pdf = setupPDF(title, subtitle)

  // Calculate total
  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  // Add total
  pdf.setFontSize(12)
  pdf.setTextColor(32, 128, 64)
  pdf.text(`Total Expenses: ₹${total.toFixed(2)}`, 14, 50)

  // Prepare data for table
  const tableData = expenses.map((expense) => [
    formatDate(expense.date),
    expense.description,
    expense.category,
    expense.recipient || "N/A",
    `₹${expense.amount.toFixed(2)}`,
  ])

  // Add table
  pdf.autoTable({
    startY: 60,
    head: [["Date", "Description", "Category", "Paid To", "Amount"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [32, 128, 64],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [240, 248, 240],
    },
    columnStyles: {
      4: { halign: "right" },
    },
  })

  // Add category summary
  const categories = expenses.reduce(
    (acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0
      }
      acc[expense.category] += expense.amount
      return acc
    },
    {} as Record<string, number>,
  )

  const categoryData = Object.entries(categories).map(([category, amount]) => [
    category,
    `₹${amount.toFixed(2)}`,
    `${((amount / total) * 100).toFixed(2)}%`,
  ])

  pdf.addPage()
  pdf.setFontSize(16)
  pdf.setTextColor(32, 128, 64)
  pdf.text("Expense Breakdown by Category", 14, 22)

  pdf.autoTable({
    startY: 30,
    head: [["Category", "Amount", "Percentage"]],
    body: categoryData,
    theme: "grid",
    headStyles: {
      fillColor: [32, 128, 64],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [240, 248, 240],
    },
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
    },
  })

  return pdf
}

// Generate income report PDF
export const generateIncomeReport = (incomes: IncomeType[], period?: string) => {
  const title = "Income Report"
  const subtitle = period ? `Period: ${period}` : "All Income"

  const pdf = setupPDF(title, subtitle)

  // Calculate total
  const total = incomes.reduce((sum, income) => sum + income.amount, 0)

  // Add total
  pdf.setFontSize(12)
  pdf.setTextColor(32, 128, 64)
  pdf.text(`Total Income: ₹${total.toFixed(2)}`, 14, 50)

  // Prepare data for table
  const tableData = incomes.map((income) => [
    formatDate(income.date),
    income.description,
    income.source,
    `₹${income.amount.toFixed(2)}`,
  ])

  // Add table
  pdf.autoTable({
    startY: 60,
    head: [["Date", "Description", "Source", "Amount"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [32, 128, 64],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [240, 248, 240],
    },
    columnStyles: {
      3: { halign: "right" },
    },
  })

  // Add source summary
  const sources = incomes.reduce(
    (acc, income) => {
      if (!acc[income.source]) {
        acc[income.source] = 0
      }
      acc[income.source] += income.amount
      return acc
    },
    {} as Record<string, number>,
  )

  const sourceData = Object.entries(sources).map(([source, amount]) => [
    source,
    `₹${amount.toFixed(2)}`,
    `${((amount / total) * 100).toFixed(2)}%`,
  ])

  pdf.addPage()
  pdf.setFontSize(16)
  pdf.setTextColor(32, 128, 64)
  pdf.text("Income Breakdown by Source", 14, 22)

  pdf.autoTable({
    startY: 30,
    head: [["Source", "Amount", "Percentage"]],
    body: sourceData,
    theme: "grid",
    headStyles: {
      fillColor: [32, 128, 64],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [240, 248, 240],
    },
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
    },
  })

  return pdf
}

// Generate share transactions report PDF
export const generateShareTransactionsReport = (shares: ShareTransactionType[], period?: string) => {
  const title = "Share Transactions Report"
  const subtitle = period ? `Period: ${period}` : "All Transactions"

  const pdf = setupPDF(title, subtitle)

  // Calculate totals
  const buyTotal = shares
    .filter((share) => share.type === "buy")
    .reduce((sum, share) => sum + share.price * share.quantity, 0)

  const sellTotal = shares
    .filter((share) => share.type === "sell")
    .reduce((sum, share) => sum + share.price * share.quantity, 0)

  // Add totals
  pdf.setFontSize(12)
  pdf.setTextColor(32, 128, 64)
  pdf.text(`Total Bought: ₹${buyTotal.toFixed(2)}`, 14, 50)
  pdf.text(`Total Sold: ₹${sellTotal.toFixed(2)}`, 14, 58)
  pdf.text(`Net Investment: ₹${(buyTotal - sellTotal).toFixed(2)}`, 14, 66)

  // Prepare data for table
  const tableData = shares.map((share) => [
    formatDate(share.date),
    share.symbol,
    share.type === "buy" ? "Buy" : "Sell",
    share.quantity.toString(),
    `₹${share.price.toFixed(2)}`,
    `₹${(share.price * share.quantity).toFixed(2)}`,
    share.notes || "",
  ])

  // Add table
  pdf.autoTable({
    startY: 76,
    head: [["Date", "Symbol", "Type", "Quantity", "Price", "Total", "Notes"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [32, 128, 64],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [240, 248, 240],
    },
    columnStyles: {
      4: { halign: "right" },
      5: { halign: "right" },
    },
  })

  return pdf
}

// Generate portfolio performance report PDF
export const generatePortfolioReport = (performanceData: SharePerformanceData[]) => {
  const title = "Portfolio Performance Report"
  const subtitle = `As of ${new Date().toLocaleDateString()}`

  const pdf = setupPDF(title, subtitle)

  // Calculate totals
  const totalValue = performanceData.reduce((sum, item) => sum + item.totalValue, 0)
  const totalProfitLoss = performanceData.reduce((sum, item) => sum + item.profitLoss, 0)
  const totalProfitLossPercentage = (totalProfitLoss / (totalValue - totalProfitLoss)) * 100

  // Add summary
  pdf.setFontSize(12)
  pdf.setTextColor(32, 128, 64)
  pdf.text(`Total Portfolio Value: ₹${totalValue.toFixed(2)}`, 14, 50)

  if (totalProfitLoss >= 0) {
    pdf.setTextColor(22, 163, 74) // Green for profit
  } else {
    pdf.setTextColor(220, 38, 38) // Red for loss
  }

  pdf.text(`Total Profit/Loss: ₹${totalProfitLoss.toFixed(2)} (${totalProfitLossPercentage.toFixed(2)}%)`, 14, 58)

  // Prepare data for table
  const tableData = performanceData.map((item) => [
    item.symbol,
    item.quantity.toString(),
    `₹${item.avgBuyPrice.toFixed(2)}`,
    `₹${item.currentPrice.toFixed(2)}`,
    `₹${item.totalValue.toFixed(2)}`,
    `₹${item.profitLoss.toFixed(2)}`,
    `${item.profitLossPercentage.toFixed(2)}%`,
  ])

  // Add table
  pdf.autoTable({
    startY: 68,
    head: [["Symbol", "Quantity", "Avg. Buy Price", "Current Price", "Total Value", "Profit/Loss", "P/L %"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [32, 128, 64],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [240, 248, 240],
    },
    columnStyles: {
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
      5: { halign: "right" },
      6: { halign: "right" },
    },
    didDrawCell: (data) => {
      // Color the profit/loss cells
      if (data.section === "body" && (data.column.index === 5 || data.column.index === 6)) {
        const value = data.cell.raw as string
        if (value.startsWith("₹")) {
          const numValue = Number.parseFloat(value.substring(1))
          if (numValue >= 0) {
            pdf.setFillColor(220, 252, 231) // Light green
          } else {
            pdf.setFillColor(254, 226, 226) // Light red
          }
        } else if (value.endsWith("%")) {
          const numValue = Number.parseFloat(value)
          if (numValue >= 0) {
            pdf.setFillColor(220, 252, 231) // Light green
          } else {
            pdf.setFillColor(254, 226, 226) // Light red
          }
        }
        pdf.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, "F")
        pdf.setTextColor(0, 0, 0)
        pdf.text(data.cell.raw as string, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2, {
          align: "center",
          baseline: "middle",
        })
      }
    },
  })

  return pdf
}

// Generate financial summary report PDF
export const generateFinancialSummaryReport = (
  expenses: ExpenseType[],
  incomes: IncomeType[],
  shares: ShareTransactionType[],
) => {
  const title = "Financial Summary Report"
  const subtitle = `Generated on ${new Date().toLocaleDateString()}`

  const pdf = setupPDF(title, subtitle)

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0)
  const netBalance = totalIncome - totalExpenses

  const buyTotal = shares
    .filter((share) => share.type === "buy")
    .reduce((sum, share) => sum + share.price * share.quantity, 0)

  const sellTotal = shares
    .filter((share) => share.type === "sell")
    .reduce((sum, share) => sum + share.price * share.quantity, 0)

  const netInvestment = buyTotal - sellTotal

  // Add summary
  pdf.setFontSize(14)
  pdf.setTextColor(32, 128, 64)
  pdf.text("Financial Overview", 14, 50)

  pdf.setFontSize(12)
  pdf.setTextColor(0, 0, 0)

  // Income and expenses
  pdf.text("Income and Expenses", 14, 60)
  pdf.setTextColor(22, 163, 74) // Green for income
  pdf.text(`Total Income: ₹${totalIncome.toFixed(2)}`, 20, 68)
  pdf.setTextColor(220, 38, 38) // Red for expenses
  pdf.text(`Total Expenses: ₹${totalExpenses.toFixed(2)}`, 20, 76)

  // Net balance
  pdf.setTextColor(0, 0, 0)
  pdf.text("Net Balance:", 20, 84)
  if (netBalance >= 0) {
    pdf.setTextColor(22, 163, 74) // Green for positive
  } else {
    pdf.setTextColor(220, 38, 38) // Red for negative
  }
  pdf.text(`₹${netBalance.toFixed(2)}`, 80, 84)

  // Savings rate
  pdf.setTextColor(0, 0, 0)
  pdf.text("Savings Rate:", 20, 92)
  const savingsRate = totalIncome > 0 ? (netBalance / totalIncome) * 100 : 0
  if (savingsRate >= 0) {
    pdf.setTextColor(22, 163, 74) // Green for positive
  } else {
    pdf.setTextColor(220, 38, 38) // Red for negative
  }
  pdf.text(`${savingsRate.toFixed(2)}%`, 80, 92)

  // Investments
  pdf.setTextColor(0, 0, 0)
  pdf.text("Investments", 14, 104)
  pdf.text(`Total Bought: ₹${buyTotal.toFixed(2)}`, 20, 112)
  pdf.text(`Total Sold: ₹${sellTotal.toFixed(2)}`, 20, 120)
  pdf.text("Net Investment:", 20, 128)
  pdf.setTextColor(32, 128, 64)
  pdf.text(`₹${netInvestment.toFixed(2)}`, 80, 128)

  // Add expense categories breakdown
  const categories = expenses.reduce(
    (acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0
      }
      acc[expense.category] += expense.amount
      return acc
    },
    {} as Record<string, number>,
  )

  const categoryData = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => [category, `₹${amount.toFixed(2)}`, `${((amount / totalExpenses) * 100).toFixed(2)}%`])

  pdf.addPage()
  pdf.setFontSize(14)
  pdf.setTextColor(32, 128, 64)
  pdf.text("Expense Breakdown by Category", 14, 22)

  pdf.autoTable({
    startY: 30,
    head: [["Category", "Amount", "Percentage"]],
    body: categoryData,
    theme: "grid",
    headStyles: {
      fillColor: [32, 128, 64],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [240, 248, 240],
    },
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
    },
  })

  // Add income sources breakdown
  const sources = incomes.reduce(
    (acc, income) => {
      if (!acc[income.source]) {
        acc[income.source] = 0
      }
      acc[income.source] += income.amount
      return acc
    },
    {} as Record<string, number>,
  )

  const sourceData = Object.entries(sources)
    .sort((a, b) => b[1] - a[1])
    .map(([source, amount]) => [source, `₹${amount.toFixed(2)}`, `${((amount / totalIncome) * 100).toFixed(2)}%`])

  const lastY = (pdf as any).lastAutoTable.finalY + 20

  pdf.setFontSize(14)
  pdf.setTextColor(32, 128, 64)
  pdf.text("Income Breakdown by Source", 14, lastY)

  pdf.autoTable({
    startY: lastY + 8,
    head: [["Source", "Amount", "Percentage"]],
    body: sourceData,
    theme: "grid",
    headStyles: {
      fillColor: [32, 128, 64],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [240, 248, 240],
    },
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
    },
  })

  return pdf
}

