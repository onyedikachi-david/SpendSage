import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash } from "lucide-react"
import type { Transaction } from "@/types"
import { cn } from "@/lib/utils"

interface TransactionListProps {
  transactions: Transaction[]
  onEdit: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => void
}

export function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
  return (
    <div className="relative w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[110px]">Date</TableHead>
            <TableHead className="max-w-[300px]">Description</TableHead>
            <TableHead className="w-[150px]">Category</TableHead>
            <TableHead className="w-[150px]">Account</TableHead>
            <TableHead className="w-[150px] text-right">Amount</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell 
                colSpan={6} 
                className="h-24 text-center text-muted-foreground"
              >
                No transactions found.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow 
                key={transaction._id}
                className="hover:bg-muted/50"
              >
                <TableCell className="font-medium">
                  {format(new Date(transaction.date), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="max-w-[300px] truncate">
                  {transaction.description}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-sm font-medium">
                    {transaction.category}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-md bg-muted/50 px-2 py-1 text-sm font-medium">
                    {transaction.account}
                  </span>
                </TableCell>
                <TableCell className={cn(
                  "text-right font-medium tabular-nums",
                  transaction.isExpense ? "text-red-500" : "text-green-500"
                )}>
                  {transaction.isExpense ? "-" : "+"}
                  ${transaction.amount.toFixed(2)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="hover:bg-muted"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => onEdit(transaction)}
                        className="gap-2"
                      >
                        <Pencil className="h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(transaction)}
                        className="text-red-600 gap-2"
                      >
                        <Trash className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
} 