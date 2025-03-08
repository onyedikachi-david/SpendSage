"use client"

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts"
import type { Transaction } from "@/types"

interface CategoryPieChartProps {
  transactions: Transaction[]
}

interface PieChartData {
  name: string
  value: number
}

const COLORS = [
  "#2563eb", // blue-600
  "#7c3aed", // violet-600
  "#db2777", // pink-600
  "#dc2626", // red-600
  "#ea580c", // orange-600
  "#ca8a04", // yellow-600
  "#16a34a", // green-600
  "#0d9488", // teal-600
  "#2563eb", // blue-600
  "#7c3aed", // violet-600
]

export default function CategoryPieChart({ transactions }: CategoryPieChartProps) {
  // Calculate total spending by category
  const categoryData = transactions
    .filter((t) => t.isExpense)
    .reduce((acc, transaction) => {
      const { category, amount } = transaction
      if (!acc[category]) {
        acc[category] = 0
      }
      acc[category] += amount
      return acc
    }, {} as Record<string, number>)

  // Convert to array and sort by amount
  const data: PieChartData[] = Object.entries(categoryData)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  // If no data, show a message
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No expense data to display
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label={({ name, percent }: { name: string; percent: number }) => 
            `${name} ${(percent * 100).toFixed(0)}%`
          }
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
} 