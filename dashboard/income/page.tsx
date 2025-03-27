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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardHeader } from "@/components/dashboard-header"
import { DownloadReportButton } from "@/components/download-report-button"
import { CategoryBadge } from "@/components/category-badge"
import { MoneyGrowthIcon } from "@/components/money-icons"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { generateIncomeReport } from "@/lib/pdf-generator"
import type { IncomeType } from "@/lib/types"

export default function IncomePage() {
  const [incomes, setIncomes] = useState<IncomeType[]>([])
  const [newIncome, setNewIncome] = useState<Omit<IncomeType, "id">>({
    amount: 0,
    source: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  })
  const [mounted, setMounted] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Load incomes from localStorage or Supabase
    const fetchIncomes = async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data, error } = await supabase.from("income").select("*").order("date", { ascending: false })

        if (error) {
          throw error
        }

        if (data && data.length > 0) {
          setIncomes(data as IncomeType[])
        } else {
          // Fallback to localStorage
          const savedIncomes = localStorage.getItem("incomes")
          if (savedIncomes) {
            setIncomes(JSON.parse(savedIncomes))
          } else {
            // Set demo data if no data exists
            const demoIncomes: IncomeType[] = [
              { id: "1", amount: 45000, source: "Salary", description: "Monthly salary", date: "2024-03-25" },
              { id: "2", amount: 5000, source: "Freelance", description: "Website project", date: "2024-03-20" },
              { id: "3", amount: 2000, source: "Interest", description: "Bank interest", date: "2024-03-15" },
            ]
            setIncomes(demoIncomes)
            localStorage.setItem("incomes", JSON.stringify(demoIncomes))
          }
        }
      } catch (error) {
        console.error("Error fetching incomes:", error)
        // Fallback to localStorage
        const savedIncomes = localStorage.getItem("incomes")
        if (savedIncomes) {
          setIncomes(JSON.parse(savedIncomes))
        } else {
          // Set demo data if no data exists
          const demoIncomes: IncomeType[] = [
            { id: "1", amount: 45000, source: "Salary", description: "Monthly salary", date: "2024-03-25" },
            { id: "2", amount: 5000, source: "Freelance", description: "Website project", date: "2024-03-20" },
            { id: "3", amount: 2000, source: "Interest", description: "Bank interest", date: "2024-03-15" },
          ]
          setIncomes(demoIncomes)
          localStorage.setItem("incomes", JSON.stringify(demoIncomes))
        }
      }
    }

    fetchIncomes()
  }, [])

  if (!mounted) {
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewIncome((prev) => ({
      ...prev,
      [name]: name === "amount" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setNewIncome((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddIncome = async () => {
    // Validate form
    if (newIncome.amount <= 0 || !newIncome.source || !newIncome.description || !newIncome.date) {
      alert("Please fill in all fields")
      return
    }

    const income: IncomeType = {
      id: Date.now().toString(),
      ...newIncome,
    }

    // Try to save to Supabase first
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase.from("income").insert(income)

      if (error) {
        console.error("Error saving income to Supabase:", error)
        // Fall back to localStorage if Supabase fails
      } else {
        // Update the income with the ID from Supabase
        income.id = data[0].id
      }
    } catch (error) {
      console.error("Error in Supabase transaction:", error)
      // Continue with localStorage as fallback
    }

    const updatedIncomes = [...incomes, income]
    setIncomes(updatedIncomes)
    localStorage.setItem("incomes", JSON.stringify(updatedIncomes))

    // Reset form
    setNewIncome({
      amount: 0,
      source: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    })

    setDialogOpen(false)
  }

  const handleDeleteIncome = async (id: string) => {
    // Try to delete from Supabase first
    try {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.from("income").delete().eq("id", id)

      if (error) {
        console.error("Error deleting income from Supabase:", error)
      }
    } catch (error) {
      console.error("Error in Supabase delete transaction:", error)
    }

    // Update local state regardless of Supabase result
    const updatedIncomes = incomes.filter((income) => income.id !== id)
    setIncomes(updatedIncomes)
    localStorage.setItem("incomes", JSON.stringify(updatedIncomes))
  }

  const handleDownloadReport = async (period?: string) => {
    let filteredIncomes = [...incomes]

    // Filter incomes based on selected period
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

        filteredIncomes = incomes.filter((income) => {
          const incomeDate = new Date(income.date)
          return incomeDate >= startDate && incomeDate <= endDate
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

        filteredIncomes = incomes.filter((income) => {
          const incomeDate = new Date(income.date)
          return incomeDate >= startDate && incomeDate <= endDate
        })
      }

      if (period !== "Last Month" && period !== "Last Year") {
        filteredIncomes = incomes.filter((income) => {
          const incomeDate = new Date(income.date)
          return incomeDate >= startDate
        })
      }
    }

    // Sort incomes by date (newest first)
    filteredIncomes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Generate and return the PDF
    return generateIncomeReport(filteredIncomes, period)
  }

  // Calculate total income
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0)

  return (
    <div className="flex flex-col gap-4 money-pattern">
      <DashboardHeader title="Income Tracker" subtitle="Manage and track your income" />

      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl flex items-center">
          <MoneyGrowthIcon size={24} className="mr-2" />
          Income
        </h1>
        <div className="flex gap-2">
          <DownloadReportButton onDownload={handleDownloadReport} reportName="Income Report" variant="outline" />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="money-gradient-success text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add Income
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Income</DialogTitle>
                <DialogDescription>Add a new income to your tracker.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    value={newIncome.description}
                    onChange={handleInputChange}
                    placeholder="Monthly salary"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount (NPR)</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    value={newIncome.amount || ""}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="source">Source</Label>
                  <Select value={newIncome.source} onValueChange={(value) => handleSelectChange("source", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Salary">Salary</SelectItem>
                      <SelectItem value="Freelance">Freelance</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Investment">Investment</SelectItem>
                      <SelectItem value="Interest">Interest</SelectItem>
                      <SelectItem value="Gift">Gift</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" name="date" type="date" value={newIncome.date} onChange={handleInputChange} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddIncome} className="money-gradient-success text-white">
                  Add Income
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Card className="mb-4 border-primary/20 shadow-md money-card">
        <CardHeader className="pb-2 bg-primary/5">
          <CardTitle>Total Income</CardTitle>
          <CardDescription>Your total income for all periods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold dollar-sign">₹{totalIncome.toFixed(2)}</div>
        </CardContent>
      </Card>
      <Card className="border-primary/20 shadow-md money-card">
        <CardHeader className="bg-primary/5">
          <CardTitle>All Income</CardTitle>
          <CardDescription>View and manage all your recorded income</CardDescription>
        </CardHeader>
        <CardContent>
          {incomes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount (NPR)</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomes.map((income) => (
                  <TableRow key={income.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{income.description}</TableCell>
                    <TableCell>
                      <CategoryBadge category={income.source} />
                    </TableCell>
                    <TableCell>{income.date}</TableCell>
                    <TableCell className="text-right text-success dollar-sign">₹{income.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteIncome(income.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground mb-4">No income records found</p>
              <Button onClick={() => setDialogOpen(true)} className="money-gradient-success text-white">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Income
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

