"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardHeader } from "@/components/dashboard-header"
import { DownloadReportButton } from "@/components/download-report-button"
import { CategoryBadge } from "@/components/category-badge"
import { CashFlowIcon } from "@/components/money-icons"
import { ResponsiveTable } from "@/components/responsive-table"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { generateExpenseReport } from "@/lib/pdf-generator"
import { formatDate } from "@/lib/utils"
import type { ExpenseType } from "@/lib/types"

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseType[]>([])
  const [newExpense, setNewExpense] = useState<Omit<ExpenseType, "id">>({
    amount: 0,
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    location: "",
    recipient: "", // Added recipient field
  })
  const [mounted, setMounted] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Load expenses from localStorage or Supabase
    const fetchExpenses = async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data, error } = await supabase.from("expenses").select("*").order("date", { ascending: false })

        if (error) {
          throw error
        }

        if (data && data.length > 0) {
          setExpenses(data as ExpenseType[])
        } else {
          // Fallback to localStorage
          const savedExpenses = localStorage.getItem("expenses")
          if (savedExpenses) {
            setExpenses(JSON.parse(savedExpenses))
          }
        }
      } catch (error) {
        console.error("Error fetching expenses:", error)
        // Fallback to localStorage
        const savedExpenses = localStorage.getItem("expenses")
        if (savedExpenses) {
          setExpenses(JSON.parse(savedExpenses))
        }
      }
    }

    fetchExpenses()
  }, [])

  if (!mounted) {
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewExpense((prev) => ({
      ...prev,
      [name]: name === "amount" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setNewExpense((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddExpense = async () => {
    // Validate form
    if (
      newExpense.amount <= 0 ||
      !newExpense.category ||
      !newExpense.description ||
      !newExpense.date ||
      !newExpense.location ||
      !newExpense.recipient
    ) {
      alert("Please fill in all fields")
      return
    }

    const expense: ExpenseType = {
      id: Date.now().toString(),
      ...newExpense,
    }

    // Try to save to Supabase first
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase.from("expenses").insert(expense)

      if (error) {
        console.error("Error saving expense to Supabase:", error)
        // Fall back to localStorage if Supabase fails
      } else {
        // Update the expense with the ID from Supabase
        expense.id = data[0].id
      }
    } catch (error) {
      console.error("Error in Supabase transaction:", error)
      // Continue with localStorage as fallback
    }

    const updatedExpenses = [...expenses, expense]
    setExpenses(updatedExpenses)
    localStorage.setItem("expenses", JSON.stringify(updatedExpenses))

    // Reset form
    setNewExpense({
      amount: 0,
      category: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      location: "",
      recipient: "",
    })

    setDialogOpen(false)
  }

  const handleDeleteExpense = async (id: string) => {
    // Try to delete from Supabase first
    try {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.from("expenses").delete().eq("id", id)

      if (error) {
        console.error("Error deleting expense from Supabase:", error)
      }
    } catch (error) {
      console.error("Error in Supabase delete transaction:", error)
    }

    // Update local state regardless of Supabase result
    const updatedExpenses = expenses.filter((expense) => expense.id !== id)
    setExpenses(updatedExpenses)
    localStorage.setItem("expenses", JSON.stringify(updatedExpenses))
  }

  const handleDownloadReport = async (period?: string) => {
    let filteredExpenses = [...expenses]

    // Filter expenses based on selected period
    if (period) {
      const now = new Date()
      const startDate = new Date()

      if (period === "This Month") {
        startDate.setDate(1)
        startDate.setHours(0, 0, 0, 0)
      } else if (period === "Last Month") {
        startDate.setMonth(startDate.getMonth() - 1)
        startDate.setDate(1)
        startDate.setHours(0, 0, 0, 0)

        const endDate = new Date(now.getFullYear(), now.getMonth(), 0)
        endDate.setHours(23, 59, 59, 999)

        filteredExpenses = expenses.filter((expense) => {
          const expenseDate = new Date(expense.date)
          return expenseDate >= startDate && expenseDate <= endDate
        })
      } else if (period === "This Year") {
        startDate.setMonth(0, 1)
        startDate.setHours(0, 0, 0, 0)
      } else if (period === "Last Year") {
        startDate.setFullYear(startDate.getFullYear() - 1)
        startDate.setMonth(0, 1)
        startDate.setHours(0, 0, 0, 0)

        const endDate = new Date(now.getFullYear() - 1, 11, 31)
        endDate.setHours(23, 59, 59, 999)

        filteredExpenses = expenses.filter((expense) => {
          const expenseDate = new Date(expense.date)
          return expenseDate >= startDate && expenseDate <= endDate
        })
      }

      if (period !== "Last Month" && period !== "Last Year") {
        filteredExpenses = expenses.filter((expense) => {
          const expenseDate = new Date(expense.date)
          return expenseDate >= startDate
        })
      }
    }

    // Sort expenses by date (newest first)
    filteredExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Generate and return the PDF
    return generateExpenseReport(filteredExpenses, period)
  }

  // Define columns for the responsive table
  const columns = [
    {
      header: "Description",
      accessorKey: "description" as keyof ExpenseType,
      cell: (row: ExpenseType) => <span className="font-medium">{row.description}</span>,
    },
    {
      header: "Paid To",
      accessorKey: "recipient" as keyof ExpenseType,
      cell: (row: ExpenseType) => row.recipient || "N/A",
    },
    {
      header: "Category",
      accessorKey: "category" as keyof ExpenseType,
      cell: (row: ExpenseType) => <CategoryBadge category={row.category} />,
    },
    {
      header: "Location",
      accessorKey: "location" as keyof ExpenseType,
    },
    {
      header: "Date",
      accessorKey: "date" as keyof ExpenseType,
      cell: (row: ExpenseType) => formatDate(row.date),
    },
    {
      header: "Amount (NPR)",
      accessorKey: "amount" as keyof ExpenseType,
      cell: (row: ExpenseType) => <span className="text-destructive dollar-sign">₹{row.amount.toFixed(2)}</span>,
      className: "text-right",
    },
    {
      header: "",
      accessorKey: "id" as keyof ExpenseType,
      cell: (row: ExpenseType) => (
        <Button variant="ghost" size="icon" onClick={() => handleDeleteExpense(row.id)}>
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      ),
    },
  ]

  // Custom mobile card renderer
  const mobileCardRenderer = (expense: ExpenseType) => (
    <Card key={expense.id} className="mb-3 border-primary/20 shadow-sm">
      <CardHeader className="p-3 pb-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">{expense.description}</CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteExpense(expense.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="flex flex-wrap gap-2 mt-1">
          <CategoryBadge category={expense.category} />
          <span className="text-xs">{formatDate(expense.date)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 pt-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Paid to: {expense.recipient || "N/A"}</span>
          <span className="font-semibold text-destructive dollar-sign">₹{expense.amount.toFixed(2)}</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">Location: {expense.location}</div>
      </CardContent>
    </Card>
  )

  // Empty state component
  const emptyState = (
    <div className="flex flex-col items-center justify-center py-8">
      <p className="text-muted-foreground mb-4">No expenses found</p>
      <Button onClick={() => setDialogOpen(true)} className="money-gradient-danger text-white">
        <Plus className="mr-2 h-4 w-4" />
        Add Your First Expense
      </Button>
    </div>
  )

  return (
    <div className="flex flex-col gap-4 money-pattern pb-16 md:pb-0">
      <DashboardHeader title="Expense Tracker" subtitle="Manage and track your expenses" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-lg font-semibold md:text-2xl flex items-center">
          <CashFlowIcon size={24} className="mr-2" />
          Expenses
        </h1>
        <div className="flex gap-2">
          <DownloadReportButton onDownload={handleDownloadReport} reportName="Expense Report" variant="outline" />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="money-gradient-danger text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-auto">
              <DialogHeader>
                <DialogTitle>Add Expense</DialogTitle>
                <DialogDescription>Add a new expense to your tracker.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    value={newExpense.description}
                    onChange={handleInputChange}
                    placeholder="Grocery shopping"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount (NPR)</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    value={newExpense.amount || ""}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="recipient">Paid To</Label>
                  <Input
                    id="recipient"
                    name="recipient"
                    value={newExpense.recipient}
                    onChange={handleInputChange}
                    placeholder="Recipient name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={newExpense.category} onValueChange={(value) => handleSelectChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Groceries">Groceries</SelectItem>
                      <SelectItem value="Food">Food</SelectItem>
                      <SelectItem value="Transportation">Transportation</SelectItem>
                      <SelectItem value="Entertainment">Entertainment</SelectItem>
                      <SelectItem value="Utilities">Utilities</SelectItem>
                      <SelectItem value="Housing">Housing</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Shopping">Shopping</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={newExpense.location}
                    onChange={handleInputChange}
                    placeholder="Supermarket"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" name="date" type="date" value={newExpense.date} onChange={handleInputChange} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddExpense} className="money-gradient-danger text-white">
                  Add Expense
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Card className="border-primary/20 shadow-md money-card">
        <CardHeader className="bg-primary/5">
          <CardTitle>All Expenses</CardTitle>
          <CardDescription>View and manage all your recorded expenses</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveTable
            data={expenses}
            columns={columns}
            keyField="id"
            mobileCardRenderer={mobileCardRenderer}
            emptyState={emptyState}
          />
        </CardContent>
      </Card>
    </div>
  )
}

