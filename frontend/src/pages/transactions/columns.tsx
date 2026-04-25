/* eslint-disable react-refresh/only-export-components */
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2, Check, X, Check as CheckIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn, formatCurrency } from "@/lib/utils"
import type { Account, Category, Transaction, TransactionTypes } from "@/types"

// Type for the table meta we pass down
export interface TransactionsTableMeta {
  editingRowId: string | null
  editingData: Partial<Transaction> | null
  accounts: Account[]
  categories: Category[]
  setEditingRowId: (id: string | null) => void
  setEditingData: (data: Partial<Transaction> | null) => void
  saveRow: (id: string) => void
  deleteRow: (id: string) => void
  updateCategory: (id: string, categoryId: string) => void
}

// Editable cell wrapper
function EditableCell({
  value,
  field,
  type = "text",
  meta,
  rowId,
}: {
  value: string | number
  field: keyof Transaction
  type?: "text" | "number" | "date"
  meta: TransactionsTableMeta
  rowId: string
}) {
  const isEditing = meta.editingRowId === rowId

  if (!isEditing) {
    return <span>{type === "date" && typeof value === "string" ? format(new Date(value), "MMM dd, yyyy") : value}</span>
  }

  const rawValue = meta.editingData?.[field] ?? value
  const currentValue = typeof rawValue === "object" ? String(rawValue) : rawValue

  return (
    <Input
      type={type}
      value={type === "date" && typeof currentValue === "string"
        ? currentValue.split("T")[0]
        : currentValue}
      onChange={(e) =>
        meta.setEditingData({
          ...meta.editingData,
          [field]: type === "number" ? parseFloat(e.target.value) || 0 : e.target.value,
        })
      }
      className="h-8 w-full"
      autoFocus={field === "description"}
      onKeyDown={(e) => {
        if (e.key === "Enter") meta.saveRow(rowId)
        if (e.key === "Escape") meta.setEditingRowId(null)
      }}
    />
  )
}

// Type selector cell
function TypeSelectCell({
  value,
  meta,
  rowId,
}: {
  value: TransactionTypes
  meta: TransactionsTableMeta
  rowId: string
}) {
  const isEditing = meta.editingRowId === rowId

  if (!isEditing) {
    return (
      <Badge
        variant={value === "INCOME" ? "default" : "secondary"}
        className={cn(
          value === "INCOME"
            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400"
            : value === "EXPENSE"
              ? "bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400"
              : ""
        )}
      >
        {value}
      </Badge>
    )
  }

  const currentValue = (meta.editingData?.type ?? value) as TransactionTypes

  return (
    <Select
      value={currentValue}
      onValueChange={(val) =>
        meta.setEditingData({
          ...meta.editingData,
          type: val as TransactionTypes,
        })
      }
    >
      <SelectTrigger className="h-8 w-[120px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="INCOME">Income</SelectItem>
        <SelectItem value="EXPENSE">Expense</SelectItem>
        <SelectItem value="TRANSFER">Transfer</SelectItem>
      </SelectContent>
    </Select>
  )
}

// Account selector cell
function AccountSelectCell({
  value,
  meta,
  rowId,
}: {
  value: Account
  meta: TransactionsTableMeta
  rowId: string
}) {
  const isEditing = meta.editingRowId === rowId

  if (!isEditing) {
    return (
      <div>
        <div className="font-medium">{value.name}</div>
        <div className="text-xs text-muted-foreground">{value.institution}</div>
      </div>
    )
  }

  const currentAccountId = (meta.editingData as Record<string, unknown>)?.accountId as string ?? value.id

  return (
    <Select
      value={currentAccountId}
      onValueChange={(val) =>
        meta.setEditingData({
          ...meta.editingData,
          accountId: val,
        } as Partial<Transaction> & { accountId: string })
      }
    >
      <SelectTrigger className="h-8 w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {meta.accounts.map((account) => (
          <SelectItem key={account.id} value={account.id}>
            {account.name} ({account.institution})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// Category cell — click to change, autosaves
function CategoryCell({
  row,
  meta,
}: {
  row: Transaction
  meta: TransactionsTableMeta
}) {
  const [open, setOpen] = useState(false)
  const categorization = row.transactionCategorization
  const currentName = categorization?.category?.name
  const currentId = categorization?.category?.id
  const source = categorization?.source

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-md px-1 py-0.5 text-left transition-colors hover:bg-accent/50"
        >
          {currentName ? (
            <Badge variant="outline">{currentName}</Badge>
          ) : (
            <span className="text-muted-foreground">Uncategorized</span>
          )}
          {source === "ml_model" && (
            <span
              className="text-[10px] text-muted-foreground"
              title={`Confidence: ${categorization?.confidence ?? "N/A"}`}
            >
              AI
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search category..." />
          <CommandList>
            <CommandEmpty>No category found.</CommandEmpty>
            <CommandGroup>
              {meta.categories.map((category) => (
                <CommandItem
                  key={category.id}
                  value={category.name}
                  onSelect={() => {
                    if (category.id !== currentId) {
                      meta.updateCategory(row.id, category.id)
                    }
                    setOpen(false)
                  }}
                >
                  <CheckIcon
                    className={cn(
                      "mr-2 h-4 w-4",
                      category.id === currentId ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {category.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// Row actions cell
function RowActions({
  row,
  meta,
}: {
  row: Transaction
  meta: TransactionsTableMeta
}) {
  const isEditing = meta.editingRowId === row.id
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => meta.saveRow(row.id)}
          className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => meta.setEditingRowId(null)}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  if (deleteConfirm) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-destructive mr-1">Delete?</span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => {
            meta.deleteRow(row.id)
            setDeleteConfirm(false)
          }}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => setDeleteConfirm(false)}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-xs">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            meta.setEditingRowId(row.id)
            meta.setEditingData({
              description: row.description,
              amount: row.amount,
              date: row.date,
              type: row.type,
              accountId: row.account.id,
            } as Partial<Transaction> & { accountId: string })
          }}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setDeleteConfirm(true)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Column sort header helper
function SortableHeader({
  column,
  label,
}: {
  column: { toggleSorting: (desc: boolean) => void; getIsSorted: () => false | "asc" | "desc" }
  label: string
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {label}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  )
}

export function getColumns(): ColumnDef<Transaction>[] {
  return [
    {
      accessorKey: "date",
      header: ({ column }) => <SortableHeader column={column} label="Date" />,
      cell: ({ row, table }) => {
        const meta = table.options.meta as TransactionsTableMeta
        return (
          <EditableCell
            value={row.getValue("date")}
            field="date"
            type="date"
            meta={meta}
            rowId={row.original.id}
          />
        )
      },
      sortingFn: "datetime",
    },
    {
      accessorKey: "description",
      header: ({ column }) => (
        <SortableHeader column={column} label="Description" />
      ),
      cell: ({ row, table }) => {
        const meta = table.options.meta as TransactionsTableMeta
        return (
          <EditableCell
            value={row.getValue("description")}
            field="description"
            meta={meta}
            rowId={row.original.id}
          />
        )
      },
    },
    {
      id: "account",
      accessorFn: (row) => row.account.name,
      header: ({ column }) => (
        <SortableHeader column={column} label="Account" />
      ),
      cell: ({ row, table }) => {
        const meta = table.options.meta as TransactionsTableMeta
        return (
          <AccountSelectCell
            value={row.original.account}
            meta={meta}
            rowId={row.original.id}
          />
        )
      },
    },
    {
      accessorKey: "type",
      header: ({ column }) => <SortableHeader column={column} label="Type" />,
      cell: ({ row, table }) => {
        const meta = table.options.meta as TransactionsTableMeta
        return (
          <TypeSelectCell
            value={row.getValue("type")}
            meta={meta}
            rowId={row.original.id}
          />
        )
      },
      filterFn: (row, id, value) => {
        return value === "all" || row.getValue(id) === value
      },
    },
    {
      id: "category",
      accessorFn: (row) => row.transactionCategorization?.category?.name ?? "",
      header: ({ column }) => (
        <SortableHeader column={column} label="Category" />
      ),
      cell: ({ row, table }) => {
        const meta = table.options.meta as TransactionsTableMeta
        return <CategoryCell row={row.original} meta={meta} />
      },
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <div className="text-right">
          <SortableHeader column={column} label="Amount" />
        </div>
      ),
      cell: ({ row, table }) => {
        const meta = table.options.meta as TransactionsTableMeta
        const isEditing = meta.editingRowId === row.original.id
        const type = row.original.type
        const amount = row.getValue("amount") as number

        if (isEditing) {
          return (
            <EditableCell
              value={amount}
              field="amount"
              type="number"
              meta={meta}
              rowId={row.original.id}
            />
          )
        }

        return (
          <div
            className={cn(
              "text-right font-medium",
              type === "INCOME"
                ? "text-emerald-600"
                : type === "EXPENSE"
                  ? "text-red-600 dark:text-red-400"
                  : "text-foreground"
            )}
          >
            {type === "INCOME" ? "+" : type === "EXPENSE" ? "-" : ""}
            {formatCurrency(amount)}
          </div>
        )
      },
      sortingFn: "basic",
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row, table }) => {
        const meta = table.options.meta as TransactionsTableMeta
        return <RowActions row={row.original} meta={meta} />
      },
    },
  ]
}
