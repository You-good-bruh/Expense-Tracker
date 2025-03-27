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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { DashboardHeader } from "@/components/dashboard-header"
import { DownloadReportButton } from "@/components/download-report-button"
import { CoinStackIcon } from "@/components/money-icons"
import { getSupabaseBrowserClient } from "@/lib/supabase"
import { generateShareTransactionsReport } from "@/lib/pdf-generator"
import type { ShareTransactionType } from "@/lib/types"

export default function SharesPage() {
  const [shares, setShares] = useState<ShareTransactionType[]>([])
  const [newShare, setNewShare] = useState<Omit<ShareTransactionType, "id">>({
    symbol: "",
    type: "buy",
    quantity: 0,
    price: 0,
    date: new Date().toISOString().split("T")[0],
    notes: "",
  })
  const [mounted, setMounted] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Load shares from localStorage or Supabase
    const fetchShares = async () => {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data, error } = await supabase.from("shares").select("*").order("date", { ascending: false })

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

  if (!mounted) {
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewShare((prev) => ({
      ...prev,
      [name]: name === "quantity" || name === "price" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleTypeChange = (value: string) => {
    setNewShare((prev) => ({
      ...prev,
      type: value as "buy" | "sell",
    }))
  }

  const handleAddShare = async () => {
    // Validate form
    if (!newShare.symbol || newShare.quantity <= 0 || newShare.price <= 0 || !newShare.date) {
      alert("Please fill in all required fields")
      return
    }

    const share: ShareTransactionType = {
      id: Date.now().toString(),
      ...newShare,
    }

    // Try to save to Supabase first
    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase.from("shares").insert(share)

      if (error) {
        console.error("Error saving share to Supabase:", error)
        // Fall back to localStorage if Supabase fails
      } else {
        // Update the share with the ID from Supabase
        share.id = data[0].id
      }
    } catch (error) {
      console.error("Error in Supabase transaction:", error)
      // Continue with localStorage as fallback
    }

    const updatedShares = [...shares, share]
    setShares(updatedShares)
    localStorage.setItem("shares", JSON.stringify(updatedShares))

    // Reset form
    setNewShare({
      symbol: "",
      type: "buy",
      quantity: 0,
      price: 0,
      date: new Date().toISOString().split("T")[0],
      notes: "",
    })

    setDialogOpen(false)
  }

  const handleDeleteShare = async (id: string) => {
    // Try to delete from Supabase first
    try {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.from("shares").delete().eq("id", id)

      if (error) {
        console.error("Error deleting share from Supabase:", error)
      }
    } catch (error) {
      console.error("Error in Supabase delete transaction:", error)
    }

    // Update local state regardless of Supabase result
    const updatedShares = shares.filter((share) => share.id !== id)
    setShares(updatedShares)
    localStorage.setItem("shares", JSON.stringify(updatedShares))
  }

  const handleDownloadReport = async (period?: string) => {
    let filteredShares = [...shares]

    // Filter shares based on selected period
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

        filteredShares = shares.filter((share) => {
          const shareDate = new Date(share.date)
          return shareDate >= startDate && shareDate <= endDate
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

        filteredShares = shares.filter((share) => {
          const shareDate = new Date(share.date)
          return shareDate >= startDate && shareDate <= endDate
        })
      }

      if (period !== "Last Month" && period !== "Last Year") {
        filteredShares = shares.filter((share) => {
          const shareDate = new Date(share.date)
          return shareDate >= startDate
        })
      }
    }

    // Sort shares by date (newest first)
    filteredShares.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Generate and return the PDF
    return generateShareTransactionsReport(filteredShares, period)
  }

  return (
    <div className="flex flex-col gap-4 money-pattern">
      <DashboardHeader title="Share Transactions" subtitle="Manage your investment portfolio" />

      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl flex items-center">
          <CoinStackIcon size={24} className="mr-2" />
          Share Transactions
        </h1>
        <div className="flex gap-2">
          <DownloadReportButton
            onDownload={handleDownloadReport}
            reportName="Share Transactions Report"
            variant="outline"
          />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="money-gradient-gold text-black">
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Share Transaction</DialogTitle>
                <DialogDescription>Record a new share purchase or sale.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="symbol">Symbol</Label>
                  <Input
                    id="symbol"
                    name="symbol"
                    value={newShare.symbol}
                    onChange={handleInputChange}
                    placeholder="NABIL"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Transaction Type</Label>
                  <RadioGroup value={newShare.type} onValueChange={handleTypeChange} className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="buy" id="buy" />
                      <Label htmlFor="buy">Buy</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sell" id="sell" />
                      <Label htmlFor="sell">Sell</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    value={newShare.quantity || ""}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price">Price per Share (NPR)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={newShare.price || ""}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" name="date" type="date" value={newShare.date} onChange={handleInputChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={newShare.notes}
                    onChange={handleInputChange}
                    placeholder="Optional notes about this transaction"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddShare} className="money-gradient-gold text-black">
                  Add Transaction
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Card className="border-primary/20 shadow-md money-card">
        <CardHeader className="bg-primary/5">
          <CardTitle>All Share Transactions</CardTitle>
          <CardDescription>View and manage all your share transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {shares.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Price (NPR)</TableHead>
                  <TableHead>Total (NPR)</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shares.map((share) => (
                  <TableRow key={share.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{share.symbol}</TableCell>
                    <TableCell className={share.type === "buy" ? "text-blue-600" : "text-green-600"}>
                      {share.type === "buy" ? "Buy" : "Sell"}
                    </TableCell>
                    <TableCell>{share.quantity}</TableCell>
                    <TableCell className="dollar-sign">₹{share.price.toFixed(2)}</TableCell>
                    <TableCell
                      className={share.type === "buy" ? "text-red-600 dollar-sign" : "text-green-600 dollar-sign"}
                    >
                      {share.type === "buy" ? "-" : "+"}₹{(share.price * share.quantity).toFixed(2)}
                    </TableCell>
                    <TableCell>{share.date}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteShare(share.id)}>
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
              <p className="text-muted-foreground mb-4">No share transactions found</p>
              <Button onClick={() => setDialogOpen(true)} className="money-gradient-gold text-black">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Transaction
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

