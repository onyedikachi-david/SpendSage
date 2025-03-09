import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useCategories, useAccounts } from "@/lib/store"
import type { Transaction, Category, Account } from "@/types"

const transactionSchema = z.object({
  date: z.date(),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive number",
  }),
  category: z.string().min(1, "Category is required"),
  account: z.string().min(1, "Account is required"),
  description: z.string().min(1, "Description is required"),
  isExpense: z.boolean(),
})

type TransactionFormValues = z.infer<typeof transactionSchema>

interface TransactionFormProps {
  initialData?: Transaction
  onSubmit: (data: TransactionFormValues) => void
}

export function TransactionForm({ initialData, onSubmit }: TransactionFormProps) {
  const { docs: categories = [] } = useCategories() as { docs: Category[] }
  const { docs: accounts = [] } = useAccounts() as { docs: Account[] }

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: initialData ? new Date(initialData.date) : new Date(),
      amount: initialData ? initialData.amount.toString() : "",
      category: initialData?.category || "",
      account: initialData?.account || "",
      description: initialData?.description || "",
      isExpense: initialData?.isExpense ?? true,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full max-w-lg mx-auto">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-sm md:text-base">Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal text-sm md:text-base h-9 md:h-10",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm md:text-base">Amount</FormLabel>
              <FormControl>
                <Input 
                  placeholder="0.00" 
                  {...field} 
                  className="h-9 md:h-10 text-sm md:text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm md:text-base">Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-9 md:h-10 text-sm md:text-base">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem 
                      key={category._id} 
                      value={category._id}
                      className="text-sm md:text-base"
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="account"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm md:text-base">Account</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-9 md:h-10 text-sm md:text-base">
                    <SelectValue placeholder="Select an account" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem 
                      key={account._id} 
                      value={account._id}
                      className="text-sm md:text-base"
                    >
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm md:text-base">Description</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter description" 
                  {...field} 
                  className="h-9 md:h-10 text-sm md:text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isExpense"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm md:text-base">Type</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === "expense")}
                defaultValue={field.value ? "expense" : "income"}
              >
                <FormControl>
                  <SelectTrigger className="h-9 md:h-10 text-sm md:text-base">
                    <SelectValue placeholder="Select transaction type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="expense" className="text-sm md:text-base">Expense</SelectItem>
                  <SelectItem value="income" className="text-sm md:text-base">Income</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full h-9 md:h-10 text-sm md:text-base">
          {initialData ? "Update" : "Add"} Transaction
        </Button>
      </form>
    </Form>
  )
} 