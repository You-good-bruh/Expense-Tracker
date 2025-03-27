"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface Column<T> {
  header: string
  accessorKey: keyof T | ((row: T) => any)
  cell?: (row: T) => React.ReactNode
  className?: string
}

interface ResponsiveTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyField: keyof T
  mobileCardRenderer?: (item: T, index: number) => React.ReactNode
  emptyState?: React.ReactNode
  className?: string
}

export function ResponsiveTable<T>({
  data,
  columns,
  keyField,
  mobileCardRenderer,
  emptyState,
  className,
}: ResponsiveTableProps<T>) {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const getValue = (row: T, accessorKey: keyof T | ((row: T) => any)) => {
    if (typeof accessorKey === "function") {
      return accessorKey(row)
    }
    return row[accessorKey]
  }

  if (data.length === 0) {
    return emptyState || <div className="text-center py-8 text-muted-foreground">No data available</div>
  }

  return (
    <>
      {/* Desktop view - regular table */}
      <div className="hidden md:block">
        <Table className={className}>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={String(row[keyField])} className="hover:bg-muted/50">
                {columns.map((column, index) => (
                  <TableCell key={index} className={column.className}>
                    {column.cell ? column.cell(row) : getValue(row, column.accessorKey)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile view - cards */}
      <div className="md:hidden space-y-3">
        {mobileCardRenderer
          ? data.map((item, index) => mobileCardRenderer(item, index))
          : data.map((row) => {
              const rowId = String(row[keyField])
              const isExpanded = expandedRows[rowId]

              return (
                <Card key={rowId} className="overflow-hidden">
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer"
                    onClick={() => toggleRow(rowId)}
                  >
                    <div className="font-medium">
                      {columns[0].cell ? columns[0].cell(row) : getValue(row, columns[0].accessorKey)}
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>

                  <div className={cn("px-4 pb-4 space-y-2 grid grid-cols-1 gap-2", !isExpanded && "hidden")}>
                    {columns.slice(1).map((column, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{column.header}:</span>
                        <span className={cn("text-sm font-medium", column.className)}>
                          {column.cell ? column.cell(row) : getValue(row, column.accessorKey)}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )
            })}
      </div>
    </>
  )
}

