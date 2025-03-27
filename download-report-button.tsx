"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileDown, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { downloadPDF } from "@/lib/utils"
import { useThemeColors } from "./theme-colors"

interface DownloadReportButtonProps {
  onDownload: (period?: string) => Promise<any>
  reportName: string
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function DownloadReportButton({
  onDownload,
  reportName,
  variant = "outline",
  size = "default",
  className,
}: DownloadReportButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { colors } = useThemeColors()

  const handleDownload = async (period?: string) => {
    try {
      setIsLoading(true)
      const pdf = await onDownload(period)

      // Generate filename
      const timestamp = new Date().toISOString().split("T")[0]
      const periodSuffix = period ? `_${period.toLowerCase().replace(/\s+/g, "_")}` : ""
      const filename = `${reportName.toLowerCase().replace(/\s+/g, "_")}${periodSuffix}_${timestamp}.pdf`

      // Download the PDF
      downloadPDF(pdf, filename)

      toast({
        title: "Report Downloaded",
        description: `Your ${reportName} has been downloaded successfully.`,
        variant: "success",
      })
    } catch (error) {
      console.error("Error generating report:", error)
      toast({
        title: "Download Failed",
        description: "There was an error generating your report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className} disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
          Download Report
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Select Period</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleDownload("All Time")}>All Time</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload("This Month")}>This Month</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload("Last Month")}>Last Month</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload("This Year")}>This Year</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownload("Last Year")}>Last Year</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

