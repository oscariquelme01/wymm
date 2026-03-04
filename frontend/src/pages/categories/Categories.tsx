import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Plus } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { DataTable } from "@/components/data-table"
import { getColumns, type CategoriesTableMeta } from "./columns"
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/services/api"
import type { Category } from "@/types"

function CategoriesPageSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
      <Skeleton className="h-[500px] w-full rounded-md" />
    </div>
  )
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newParentId, setNewParentId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  // Inline editing state
  const [editingRowId, setEditingRowId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<Partial<Category> | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchCategories()
      setCategories(data)
    } catch (error) {
      console.error("Failed to load categories", error)
      toast.error("Failed to load categories")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleCreate = useCallback(async () => {
    if (!newName.trim()) {
      toast.error("Category name is required")
      return
    }

    setCreating(true)
    try {
      const created = await createCategory({
        name: newName.trim(),
        parentId: newParentId,
      })
      setCategories((prev) => [...prev, created])
      setNewName("")
      setNewParentId(null)
      setCreateOpen(false)
      toast.success("Category created")
    } catch (error) {
      console.error("Failed to create category", error)
      toast.error("Failed to create category")
    } finally {
      setCreating(false)
    }
  }, [newName, newParentId])

  const handleSaveRow = useCallback(
    async (id: string) => {
      if (!editingData) return

      const original = categories.find((c) => c.id === id)
      if (!original) return

      // Optimistic update
      const optimistic = categories.map((c) => {
        if (c.id !== id) return c
        return {
          ...c,
          name: editingData.name ?? c.name,
          parentId:
            editingData.parentId !== undefined
              ? editingData.parentId
              : c.parentId,
        }
      })

      setCategories(optimistic)
      setEditingRowId(null)
      setEditingData(null)

      try {
        await updateCategory(id, {
          name: editingData.name,
          parentId:
            editingData.parentId !== undefined
              ? editingData.parentId
              : undefined,
        })
        toast.success("Category updated")
      } catch (error) {
        console.error("Failed to update category", error)
        setCategories(categories)
        toast.error("Failed to update category")
      }
    },
    [editingData, categories]
  )

  const handleDeleteRow = useCallback(
    async (id: string) => {
      const original = [...categories]

      // Optimistic delete
      setCategories((prev) => prev.filter((c) => c.id !== id))

      try {
        await deleteCategory(id)
        toast.success("Category deleted")
      } catch (error) {
        console.error("Failed to delete category", error)
        setCategories(original)
        toast.error("Failed to delete category")
      }
    },
    [categories]
  )

  const columns = useMemo(() => getColumns(), [])

  const tableMeta: CategoriesTableMeta = useMemo(
    () => ({
      editingRowId,
      editingData,
      categories,
      setEditingRowId,
      setEditingData,
      saveRow: handleSaveRow,
      deleteRow: handleDeleteRow,
    }),
    [editingRowId, editingData, categories, handleSaveRow, handleDeleteRow]
  )

  if (loading && categories.length === 0) {
    return <CategoriesPageSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Categories
          </h2>
          <p className="text-muted-foreground">
            Manage transaction categories. Categories can be nested using parent
            categories.
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Category</DialogTitle>
              <DialogDescription>
                Add a new transaction category. Optionally assign a parent to
                create a subcategory.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="category-name">Name</Label>
                <Input
                  id="category-name"
                  placeholder="e.g. Food & Dining"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !creating) handleCreate()
                  }}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-parent">Parent Category</Label>
                <Select
                  value={newParentId ?? "none"}
                  onValueChange={(val) =>
                    setNewParentId(val === "none" ? null : val)
                  }
                >
                  <SelectTrigger id="category-parent">
                    <SelectValue placeholder="None (top-level)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (top-level)</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
          <CardDescription>
            {categories.length} categor{categories.length === 1 ? "y" : "ies"}{" "}
            total. Click the actions menu on any row to edit or delete.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={categories}
            filterColumn="name"
            filterPlaceholder="Search categories..."
            meta={tableMeta}
          />
        </CardContent>
      </Card>
    </div>
  )
}
