/* eslint-disable react-refresh/only-export-components */
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2, Check, X } from "lucide-react"
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
import type { Category } from "@/types"

export interface CategoriesTableMeta {
  editingRowId: string | null
  editingData: Partial<Category> | null
  categories: Category[]
  setEditingRowId: (id: string | null) => void
  setEditingData: (data: Partial<Category> | null) => void
  saveRow: (id: string) => void
  deleteRow: (id: string) => void
}

function EditableCell({
  value,
  field,
  meta,
  rowId,
}: {
  value: string
  field: keyof Category
  meta: CategoriesTableMeta
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

function ParentSelectCell({
  value,
  meta,
  rowId,
}: {
  value: string | null
  meta: CategoriesTableMeta
  rowId: string
}) {
  const isEditing = meta.editingRowId === rowId
  const parentCategory = value
    ? meta.categories.find((c) => c.id === value)
    : null

  if (!isEditing) {
    return parentCategory ? (
      <Badge variant="secondary">{parentCategory.name}</Badge>
    ) : (
      <span className="text-muted-foreground">—</span>
    )
  }

  const currentValue =
    (meta.editingData?.parentId !== undefined
      ? meta.editingData.parentId
      : value) ?? "none"

  // Exclude self and own children from parent options
  const availableParents = meta.categories.filter((c) => c.id !== rowId)

  return (
    <Select
      value={currentValue ?? "none"}
      onValueChange={(val) =>
        meta.setEditingData({
          ...meta.editingData,
          parentId: val === "none" ? null : val,
        })
      }
    >
      <SelectTrigger className="h-8 w-[180px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">None (top-level)</SelectItem>
        {availableParents.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function RowActions({
  row,
  meta,
}: {
  row: Category
  meta: CategoriesTableMeta
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
              parentId: row.parentId,
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

export function getColumns(): ColumnDef<Category>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <SortableHeader column={column} label="Name" />,
      cell: ({ row, table }) => {
        const meta = table.options.meta as CategoriesTableMeta
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
      id: "parent",
      accessorFn: (row) => row.parentId,
      header: ({ column }) => (
        <SortableHeader column={column} label="Parent Category" />
      ),
      cell: ({ row, table }) => {
        const meta = table.options.meta as CategoriesTableMeta
        return (
          <ParentSelectCell
            value={row.original.parentId}
            meta={meta}
            rowId={row.original.id}
          />
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <SortableHeader column={column} label="Created" />
      ),
      cell: ({ row }) => {
        const value = row.getValue("createdAt") as string
        return (
          <span className="text-muted-foreground">
            {format(new Date(value), "MMM dd, yyyy")}
          </span>
        )
      },
      sortingFn: "datetime",
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row, table }) => {
        const meta = table.options.meta as CategoriesTableMeta
        return <RowActions row={row.original} meta={meta} />
      },
    },
  ]
}
