"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { addAccount, updateAccount } from "@/lib/store"
import type { Account } from "@/types"

interface AccountFormProps {
  onComplete?: () => void
  account?: Account
}

export default function AccountForm({ onComplete, account }: AccountFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: account?.name || "",
    initialBalance: account?.initialBalance?.toString() || "0",
    color: account?.color || "#000000",
    icon: account?.icon || "wallet",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (account) {
        await updateAccount(account._id, {
          ...formData,
          initialBalance: parseFloat(formData.initialBalance),
        })
      } else {
        await addAccount({
          ...formData,
          initialBalance: parseFloat(formData.initialBalance),
        })
      }
      onComplete?.()
    } catch (error) {
      console.error('Failed to save account:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Account Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="initialBalance">Initial Balance</Label>
        <Input
          id="initialBalance"
          type="number"
          step="0.01"
          value={formData.initialBalance}
          onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
          required
        />
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
        {isSubmitting ? "Saving..." : account ? "Update Account" : "Save Account"}
      </Button>
    </form>
  )
} 