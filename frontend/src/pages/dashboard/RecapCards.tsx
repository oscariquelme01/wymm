import { format, startOfMonth, startOfYear } from "date-fns"
import { ArrowDownRight, ArrowUpRight, DollarSign } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Skeleton } from "@/components/ui/skeleton"
import { cn, formatCurrency } from "@/lib/utils"
import {
  tooltipItemStyle,
  tooltipLabelStyle,
  tooltipStyle,
} from "@/lib/chart-tooltip"
import { fetchAggregate, fetchTransactions } from "@/services/api"
import type { Transaction } from "@/types"

type RecapMode = "monthly" | "yearly"

const CHART_COLORS = [
  "#f43f5e", // rose-500
  "#f59e0b", // amber-500
  "#8b5cf6", // violet-500
  "#06b6d4", // cyan-500
  "#ec4899", // pink-500
  "#10b981", // emerald-500
  "#64748b", // slate-500 (used for "Other")
]

const MAX_PIE_SLICES = 6

function RecapCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-32 mb-1" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  )
}

function aggregateByCategory(transactions: Transaction[]) {
  const totals = new Map<string, number>()
  for (const tx of transactions) {
    const name = tx.transactionCategorization?.category?.name ?? "Uncategorized"
    totals.set(name, (totals.get(name) ?? 0) + tx.amount)
  }

  const sorted = Array.from(totals, ([name, value]) => ({ name, value })).sort(
    (a, b) => b.value - a.value
  )

  if (sorted.length <= MAX_PIE_SLICES) return sorted

  const top = sorted.slice(0, MAX_PIE_SLICES)
  const otherValue = sorted
    .slice(MAX_PIE_SLICES)
    .reduce((sum, s) => sum + s.value, 0)
  return [...top, { name: "Other", value: otherValue }]
}

function topExpenses(transactions: Transaction[], n = 5) {
  return [...transactions].sort((a, b) => b.amount - a.amount).slice(0, n)
}

function MonthRecapCards({ className }: { className?: string }) {
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<RecapMode>("monthly")
  const [aggregate, setAggregate] = useState<{
    income: number
    expense: number
  } | null>(null)
  const [expenses, setExpenses] = useState<Transaction[]>([])

  useEffect(() => {
    const loadRecap = async () => {
      setLoading(true)
      try {
        const endDate = new Date()
        const startDate =
          mode === "monthly" ? startOfMonth(endDate) : startOfYear(endDate)

        const [agg, expenseTxs] = await Promise.all([
          fetchAggregate(startDate.toString(), endDate.toString()),
          fetchTransactions(
            startDate.toString(),
            endDate.toString(),
            "EXPENSE"
          ),
        ])

        setAggregate(agg)
        setExpenses(expenseTxs)
      } catch (error) {
        console.error("Failed to load recap", error)
      } finally {
        setLoading(false)
      }
    }

    loadRecap()
  }, [mode])

  const periodLabel = mode === "monthly" ? "This month" : "This year"
  const net = (aggregate?.income || 0) - (aggregate?.expense || 0)

  const categoryData = useMemo(
    () =>
      aggregateByCategory(expenses).map((slice, i) => ({
        ...slice,
        fill: CHART_COLORS[i % CHART_COLORS.length],
      })),
    [expenses]
  )
  const top5 = useMemo(() => topExpenses(expenses), [expenses])

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex items-center justify-between flex-row">
        <CardTitle>{periodLabel}'s recap</CardTitle>

        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={(value) => {
            if (value) setMode(value as RecapMode)
          }}
          className="bg-muted rounded-lg p-1"
        >
          <ToggleGroupItem
            value="monthly"
            className="rounded-md px-3 py-1.5 text-sm font-medium data-[state=on]:bg-background data-[state=on]:shadow-sm"
          >
            Monthly
          </ToggleGroupItem>
          <ToggleGroupItem
            value="yearly"
            className="rounded-md px-3 py-1.5 text-sm font-medium data-[state=on]:bg-background data-[state=on]:shadow-sm"
          >
            Yearly
          </ToggleGroupItem>
        </ToggleGroup>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3 w-full">
          {loading ? (
            <>
              <RecapCardSkeleton />
              <RecapCardSkeleton />
              <RecapCardSkeleton />
            </>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Income
                  </CardTitle>
                  <ArrowUpRight className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(aggregate?.income || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">{periodLabel}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Expenses
                  </CardTitle>
                  <ArrowDownRight className="h-4 w-4 text-red-500 dark:text-red-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(aggregate?.expense || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">{periodLabel}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Net Income
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div
                    className={cn(
                      "text-2xl font-bold",
                      net >= 0
                        ? "text-emerald-500 dark:text-emerald-400"
                        : "text-red-500 dark:text-red-400"
                    )}
                  >
                    {formatCurrency(net)}
                  </div>
                  <p className="text-xs text-muted-foreground">{periodLabel}</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 w-full">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Expenses by category
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-64 w-full" />
              ) : categoryData.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                  No expenses for this period.
                </div>
              ) : (
                <>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={45}
                          outerRadius={75}
                          paddingAngle={2}
                          label={({ percent }) =>
                            percent && percent > 0.08
                              ? `${Math.round(percent * 100)}%`
                              : ""
                          }
                          labelLine={false}
                        />
                        <Tooltip
                          formatter={(value) =>
                            formatCurrency(Number(value) || 0)
                          }
                          contentStyle={tooltipStyle}
                          labelStyle={tooltipLabelStyle}
                          itemStyle={tooltipItemStyle}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                    {categoryData.map((slice) => (
                      <div
                        key={slice.name}
                        className="flex items-center gap-2 truncate"
                      >
                        <span
                          className="inline-block h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: slice.fill }}
                        />
                        <span className="truncate text-muted-foreground">
                          {slice.name}
                        </span>
                        <span className="ml-auto font-medium">
                          {formatCurrency(slice.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                Top expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : top5.length === 0 ? (
                <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                  No expenses for this period.
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {top5.map((tx) => {
                    const category =
                      tx.transactionCategorization?.category?.name ??
                      "Uncategorized"
                    return (
                      <li
                        key={tx.id}
                        className="flex items-center gap-3 py-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {tx.description || tx.creditorName || "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(tx.date), "MMM dd")} · {category}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                          -{formatCurrency(tx.amount)}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}

export default MonthRecapCards
