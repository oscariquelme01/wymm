/* eslint-disable react-refresh/only-export-components */
import type { ColumnDef } from "@tanstack/react-table"
import {
  ArrowUpDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  Check,
  X,
  RefreshCw,
  Loader2,
} from "lucide-react"
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
import { cn, formatCurrency } from "@/lib/utils"
import type { Account, AccountTypes } from "@/types"

export interface AccountsTableMeta {
  editingRowId: string | null
  editingData: Partial<Account> | null
  syncingRowId: string | null
  setEditingRowId: (id: string | null) => void
  setEditingData: (data: Partial<Account> | null) => void
  saveRow: (id: string) => void
  deleteRow: (id: string) => void
  syncRow: (id: string) => void
}

const ACCOUNT_TYPE_LABELS: Record<AccountTypes, string> = {
  wants: "Wants",
  needs: "Needs",
  investments: "Investments",
}

const ACCOUNT_TYPE_STYLES: Record<AccountTypes, string> = {
  wants:
    "bg-violet-100 text-violet-800 hover:bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400",
  needs:
    "bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
  investments:
    "bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
}

function EditableCell({
  value,
  field,
  meta,
  rowId,
}: {
  value: string
  field: keyof Account
  meta: AccountsTableMeta
  rowId: string
}) {
  const isEditing = meta.editingRowId === rowId

  if (!isEditing) {
    return <span>{value}</span>
  }

  const currentValue = (meta.editingData?.[field] as string) ?? value

  return (
    <Input
      type="text"
      value={currentValue}
      onChange={(e) =>
        meta.setEditingData({
          ...meta.editingData,
          [field]: e.target.value,
        })
      }
      className="h-8 w-full"
      autoFocus={field === "name"}
      onKeyDown={(e) => {
        if (e.key === "Enter") meta.saveRow(rowId)
        if (e.key === "Escape") meta.setEditingRowId(null)
      }}
    />
  )
}

function TypeSelectCell({
  value,
  meta,
  rowId,
}: {
  value: AccountTypes
  meta: AccountsTableMeta
  rowId: string
}) {
  const isEditing = meta.editingRowId === rowId

  if (!isEditing) {
    return (
      <Badge variant="secondary" className={cn(ACCOUNT_TYPE_STYLES[value])}>
        {ACCOUNT_TYPE_LABELS[value]}
      </Badge>
    )
  }

  const currentValue = (meta.editingData?.type ?? value) as AccountTypes

  return (
    <Select
      value={currentValue}
      onValueChange={(val) =>
        meta.setEditingData({
          ...meta.editingData,
          type: val as AccountTypes,
        })
      }
    >
      <SelectTrigger className="h-8 w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="wants">Wants</SelectItem>
        <SelectItem value="needs">Needs</SelectItem>
        <SelectItem value="investments">Investments</SelectItem>
      </SelectContent>
    </Select>
  )
}

function RowActions({
  row,
  meta,
}: {
  row: Account
  meta: AccountsTableMeta
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
              name: row.name,
              type: row.type,
              institution: row.institution,
            })
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

function SortableHeader({
  column,
  label,
}: {
  column: {
    toggleSorting: (desc: boolean) => void
    getIsSorted: () => false | "asc" | "desc"
  }
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

export function getColumns(): ColumnDef<Account>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <SortableHeader column={column} label="Name" />,
      cell: ({ row, table }) => {
        const meta = table.options.meta as AccountsTableMeta
        return (
          <EditableCell
            value={row.getValue("name")}
            field="name"
            meta={meta}
            rowId={row.original.id}
          />
        )
      },
    },
    {
      accessorKey: "institution",
      header: ({ column }) => (
        <SortableHeader column={column} label="Institution" />
      ),
      cell: ({ row, table }) => {
        const meta = table.options.meta as AccountsTableMeta
        return (
          <EditableCell
            value={row.getValue("institution")}
            field="institution"
            meta={meta}
            rowId={row.original.id}
          />
        )
      },
    },
    {
      accessorKey: "iban",
      header: "IBAN",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.getValue("iban")}
        </span>
      ),
    },
    {
      accessorKey: "type",
      header: ({ column }) => <SortableHeader column={column} label="Type" />,
      cell: ({ row, table }) => {
        const meta = table.options.meta as AccountsTableMeta
        return (
          <TypeSelectCell
            value={row.getValue("type")}
            meta={meta}
            rowId={row.original.id}
          />
        )
      },
    },
    {
      accessorKey: "currency",
      header: "Currency",
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue("currency")}</Badge>
      ),
    },
    {
      accessorKey: "balance",
      header: ({ column }) => (
        <div className="text-right">
          <SortableHeader column={column} label="Balance" />
        </div>
      ),
      cell: ({ row }) => {
        const balance = row.getValue("balance") as number
        const currency = row.original.currency
        return (
          <div
            className={cn(
              "text-right font-medium",
              balance >= 0
                ? "text-emerald-600"
                : "text-red-600 dark:text-red-400"
            )}
          >
            {formatCurrency(balance, currency)}
          </div>
        )
      },
      sortingFn: "basic",
    },
    {
      id: "sync",
      enableHiding: false,
      header: "",
      cell: ({ row, table }) => {
        const meta = table.options.meta as AccountsTableMeta
        const isSyncing = meta.syncingRowId === row.original.id

        return (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => meta.syncRow(row.original.id)}
            disabled={isSyncing}
            title="Sync this account"
          >
            {isSyncing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        )
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row, table }) => {
        const meta = table.options.meta as AccountsTableMeta
        return <RowActions row={row.original} meta={meta} />
      },
    },
  ]
}
