"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Upload } from "lucide-react"
import { importCSV, generateSampleCSV } from "@/lib/csv-utils"
import { toast } from "sonner"

const IMPORT_TYPES = [
  { label: "Transactions", value: "transaction" },
  { label: "Categories", value: "category" },
  { label: "Accounts", value: "account" },
  { label: "Budgets", value: "budget" },
] as const

type ImportType = typeof IMPORT_TYPES[number]["value"]

export default function CSVImport() {
  const [selectedType, setSelectedType] = useState<ImportType>("transaction")
  const [isImporting, setIsImporting] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    try {
      const result = await importCSV(file, selectedType)
      
      if (result.successful > 0) {
        toast.success(
          `Successfully imported ${result.successful} ${selectedType}(s)` +
          (result.failed > 0 ? ` (${result.failed} failed)` : "")
        )
      }
      
      if (result.failed > 0) {
        console.error("Import errors:", result.errors)
        toast.error(`Failed to import ${result.failed} ${selectedType}(s)`)
      }
    } catch (error) {
      console.error("Import failed:", error)
      toast.error("Failed to import file. Please check the file format and try again.")
    } finally {
      setIsImporting(false)
      // Reset the file input
      e.target.value = ""
    }
  }

  const downloadSample = () => {
    const content = generateSampleCSV(selectedType)
    const blob = new Blob([content], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sample_${selectedType}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Data</CardTitle>
        <CardDescription>
          Import your data from CSV files. Download sample files to see the required format.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Import Type</label>
          <Select value={selectedType} onValueChange={(value) => setSelectedType(value as ImportType)}>
            <SelectTrigger>
              <SelectValue placeholder="Select type to import" />
            </SelectTrigger>
            <SelectContent>
              {IMPORT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={downloadSample}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download Sample
          </Button>

          <div className="relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isImporting}
            />
            <Button
              variant="default"
              className="flex items-center gap-2"
              disabled={isImporting}
            >
              <Upload className="h-4 w-4" />
              {isImporting ? "Importing..." : "Import CSV"}
            </Button>
          </div>
        </div>

        <Alert>
          <AlertDescription>
            Make sure your CSV file matches the sample format. All dates should be in YYYY-MM-DD format.
            For transactions, use "true" or "false" for the isExpense field.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
} 