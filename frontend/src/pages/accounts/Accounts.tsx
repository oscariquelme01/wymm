import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { RefreshCw, Loader2 } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { DataTable } from "@/components/data-table"
import { getColumns, type AccountsTableMeta } from "./columns"
import {
  fetchAccounts,
  updateAccount,
  deleteAccount,
  syncAccount,
  syncAllAccounts,
} from "@/services/api"
import type { Account } from "@/types"

function AccountsPageSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
      <Skeleton className="h-[500px] w-full rounded-md" />
    </div>
  )
}

export default function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [syncingAll, setSyncingAll] = useState(false)

  // Inline editing state
  const [editingRowId, setEditingRowId] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<Partial<Account> | null>(null)
  const [syncingRowId, setSyncingRowId] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchAccounts()
      setAccounts(data)
    } catch (error) {
      console.error("Failed to load accounts", error)
      toast.error("Failed to load accounts")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSaveRow = useCallback(
    async (id: string) => {
      if (!editingData) return

      const original = accounts.find((a) => a.id === id)
      if (!original) return

      // Optimistic update
      const optimistic = accounts.map((a) => {
        if (a.id !== id) return a
        return {
          ...a,
          name: editingData.name ?? a.name,
          type: editingData.type ?? a.type,
          institution: editingData.institution ?? a.institution,
        }
      })

      setAccounts(optimistic)
      setEditingRowId(null)
      setEditingData(null)

      try {
        await updateAccount(id, {
          name: editingData.name,
          type: editingData.type,
          institution: editingData.institution,
        })
        toast.success("Account updated")
      } catch (error) {
        console.error("Failed to update account", error)
        setAccounts(accounts)
        toast.error("Failed to update account")
      }
    },
    [editingData, accounts]
  )

  const handleDeleteRow = useCallback(
    async (id: string) => {
      const original = [...accounts]

      // Optimistic delete
      setAccounts((prev) => prev.filter((a) => a.id !== id))

      try {
        await deleteAccount(id)
        toast.success("Account deleted")
      } catch (error) {
        console.error("Failed to delete account", error)
        setAccounts(original)
        toast.error("Failed to delete account")
      }
    },
    [accounts]
  )

  const handleSyncRow = useCallback(
    async (id: string) => {
      setSyncingRowId(id)
      try {
        await syncAccount(id)
        toast.success("Account synced")
        // Reload to get updated balance / transactions
        const data = await fetchAccounts()
        setAccounts(data)
      } catch (error) {
        console.error("Failed to sync account", error)
        toast.error("Failed to sync account")
      } finally {
        setSyncingRowId(null)
      }
    },
    []
  )

  const handleSyncAll = useCallback(async () => {
    setSyncingAll(true)
    try {
      await syncAllAccounts()
      toast.success("All accounts synced")
      const data = await fetchAccounts()
      setAccounts(data)
    } catch (error) {
      console.error("Failed to sync accounts", error)
      toast.error("Failed to sync accounts")
    } finally {
      setSyncingAll(false)
    }
  }, [])

  const columns = useMemo(() => getColumns(), [])

  const tableMeta: AccountsTableMeta = useMemo(
    () => ({
      editingRowId,
      editingData,
      syncingRowId,
      setEditingRowId,
      setEditingData,
      saveRow: handleSaveRow,
      deleteRow: handleDeleteRow,
      syncRow: handleSyncRow,
    }),
    [
      editingRowId,
      editingData,
      syncingRowId,
      handleSaveRow,
      handleDeleteRow,
      handleSyncRow,
    ]
  )

  if (loading && accounts.length === 0) {
    return <AccountsPageSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Accounts
          </h2>
          <p className="text-muted-foreground">
            Manage your bank accounts. Sync to fetch the latest balances and
            transactions from your bank.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={handleSyncAll}
          disabled={syncingAll}
        >
          {syncingAll ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          {syncingAll ? "Syncing..." : "Sync All"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Accounts</CardTitle>
          <CardDescription>
            {accounts.length} account{accounts.length === 1 ? "" : "s"} total.
            Click the sync icon on any row to sync that account, or use the
            actions menu to edit or delete.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={accounts}
            filterColumn="name"
            filterPlaceholder="Search accounts..."
            meta={tableMeta}
          />
        </CardContent>
      </Card>
    </div>
  )
}
