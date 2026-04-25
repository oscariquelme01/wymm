import { useCallback, useEffect, useMemo, useState } from "react"
import { format, startOfMonth } from "date-fns"
import { toast } from "sonner"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { DataTable } from "@/components/data-table"
import { getColumns, type TransactionsTableMeta } from "./columns"
import {
  fetchTransactions,
  fetchAccounts,
  fetchCategories,
  updateTransaction,
  deleteTransaction,
} from "@/services/api"
import type { Account, Category, Transaction, TransactionTypes } from "@/types"

function TransactionsPageSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
      <div className="flex gap-4 mt-6">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-24" />
      </div>
      <Skeleton className="h-150 w-full rounded-md" />
    </div>
  )
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [startDate, setStartDate] = useState(
    format(startOfMonth(new Date()), "yyyy-MM-dd")
  )
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [typeFilter, setTypeFilter] = useState<TransactionTypes | "all">("all")
  const [minAmount, setMinAmount] = useState("")
  const [maxAmount, setMaxAmount] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  // Editing state
  const [editingRowId, setEditingRowId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<Partial<Transaction> | null>(
    null
  )

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [txns, accts, cats] = await Promise.all([
        fetchTransactions(
          startDate,
          endDate,
          typeFilter === "all" ? undefined : typeFilter,
          undefined,
          undefined,
          undefined,
          categoryFilter === "all" ? undefined : categoryFilter
        ),
        fetchAccounts(),
        fetchCategories(),
      ])
      setTransactions(txns)
      setAccounts(accts)
      setCategories(cats)
    } catch (error) {
      console.error("Failed to load transactions", error)
      toast.error("Failed to load transactions")
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate, typeFilter, categoryFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSaveRow = useCallback(
    async (id: string) => {
      if (!editingData) return

      const originalTransaction = transactions.find((t) => t.id === id)
      if (!originalTransaction) return

      // Optimistic update
      const optimisticTransactions = transactions.map((t) => {
        if (t.id !== id) return t

        const updatedAccount = (editingData as Record<string, unknown>).accountId
          ? accounts.find(
              (a) => a.id === (editingData as Record<string, unknown>).accountId
            ) || t.account
          : t.account

        return {
          ...t,
          description: editingData.description ?? t.description,
          amount: editingData.amount ?? t.amount,
          date: editingData.date ?? t.date,
          type: editingData.type ?? t.type,
          account: updatedAccount,
        }
      })

      setTransactions(optimisticTransactions)
      setEditingRowId(null)
      setEditingData(null)

      try {
        await updateTransaction(id, {
          description: editingData.description,
          amount: editingData.amount,
          date: editingData.date,
          type: editingData.type,
          accountId: (editingData as Record<string, unknown>).accountId as
            | string
            | undefined,
        })
        toast.success("Transaction updated")
      } catch (error) {
        console.error("Failed to update transaction", error)
        // Rollback
        setTransactions(transactions)
        toast.error("Failed to update transaction")
      }
    },
    [editingData, transactions, accounts]
  )

  const handleDeleteRow = useCallback(
    async (id: string) => {
      const originalTransactions = [...transactions]

      // Optimistic delete
      setTransactions((prev) => prev.filter((t) => t.id !== id))

      try {
        await deleteTransaction(id)
        toast.success("Transaction deleted")
      } catch (error) {
        console.error("Failed to delete transaction", error)
        // Rollback
        setTransactions(originalTransactions)
        toast.error("Failed to delete transaction")
      }
    },
    [transactions]
  )

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const amount = Math.abs(t.amount)
      if (minAmount && amount < parseFloat(minAmount)) return false
      if (maxAmount && amount > parseFloat(maxAmount)) return false
      return true
    })
  }, [transactions, minAmount, maxAmount])

  const columns = useMemo(() => getColumns(), [])

  const tableMeta: TransactionsTableMeta = useMemo(
    () => ({
      editingRowId,
      editingData,
      accounts,
      categories,
      setEditingRowId,
      setEditingData,
      saveRow: handleSaveRow,
      deleteRow: handleDeleteRow,
    }),
    [
      editingRowId,
      editingData,
      accounts,
      categories,
      handleSaveRow,
      handleDeleteRow,
    ]
  )

  if (loading && transactions.length === 0) {
    return <TransactionsPageSkeleton />
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Transactions
        </h2>
        <p className="text-muted-foreground">
          View and edit all your transactions. Click the actions menu on any
          row to edit or delete.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Narrow down transactions by date range and type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Min Amount</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Max Amount</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={typeFilter}
                onValueChange={(val) =>
                  setTypeFilter(val as TransactionTypes | "all")
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="INCOME">Income</SelectItem>
                  <SelectItem value="EXPENSE">Expense</SelectItem>
                  <SelectItem value="TRANSFER">Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={loadData} disabled={loading}>
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardContent className="pt-6">
          <DataTable
            columns={columns}
            data={filteredTransactions}
            filterColumn="description"
            filterPlaceholder="Search descriptions..."
            meta={tableMeta}
          />
        </CardContent>
      </Card>
    </div>
  )
}
