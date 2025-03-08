"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addCategory, updateCategory } from "@/lib/store"
import { useCategories } from "@/lib/store"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Category } from "@/types"

interface CategoryFormProps {
  onComplete?: () => void
  category?: Category
}

export default function CategoryForm({ onComplete, category }: CategoryFormProps) {
  const { docs: categories } = useCategories()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: category?.name || "",
    parent: category?.parent || "",
    color: category?.color || "#000000",
    icon: category?.icon || "folder",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (category) {
        await updateCategory(category._id, formData)
      } else {
        await addCategory(formData)
      }
      onComplete?.()
    } catch (error) {
      console.error('Failed to save category:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Category Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="parent">Parent Category (Optional)</Label>
        <Select
          value={formData.parent}
          onValueChange={(value) => setFormData({ ...formData, parent: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select parent category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None</SelectItem>
            {categories?.map((cat: Category) => (
              <SelectItem key={cat._id} value={cat.name}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="icon">Icon</Label>
        <Input
          id="icon"
          value={formData.icon}
          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="color">Color</Label>
        <div className="flex gap-2">
          <Input
            id="color"
            type="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            className="w-12 h-12 p-1"
            required
          />
          <Input
            type="text"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            className="flex-1"
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : category ? "Update Category" : "Save Category"}
      </Button>
    </form>
  )
} 