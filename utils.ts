import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function getCategoryColor(category: string): string {
  // Map categories to colors
  const categoryColors: Record<string, string> = {
    // Expense categories
    Groceries: "#4caf50",
    Food: "#ff9800",
    Transportation: "#2196f3",
    Entertainment: "#9c27b0",
    Utilities: "#607d8b",
    Housing: "#795548",
    Healthcare: "#f44336",
    Education: "#3f51b5",
    Shopping: "#e91e63",
    Other: "#9e9e9e",

    // Income sources
    Salary: "#4caf50",
    Freelance: "#ff9800",
    Business: "#2196f3",
    Investment: "#9c27b0",
    Interest: "#607d8b",
    Gift: "#e91e63",

    // Default color
    default: "#9e9e9e",
  }

  return categoryColors[category] || categoryColors.default
}

export function downloadPDF(pdf: any, filename: string) {
  pdf.save(filename)
}

