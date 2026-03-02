import { startOfMonth, startOfYear } from "date-fns"
import { ArrowDownRight, ArrowUpRight, DollarSign } from "lucide-react"
import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Skeleton } from "@/components/ui/skeleton"
import { cn, formatCurrency } from "@/lib/utils"
import { fetchAggregate } from "@/services/api"

type RecapMode = "monthly" | "yearly"

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

function MonthRecapCards({ className }: { className?: string }) {
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<RecapMode>("monthly")
  const [aggregate, setAggregate] = useState<{
    income: number
    expense: number
  } | null>(null)

  useEffect(() => {
    const loadAggregates = async () => {
      setLoading(true)
      try {
        const endDate = new Date()
        const startDate =
          mode === "monthly" ? startOfMonth(endDate) : startOfYear(endDate)

        const agg = await fetchAggregate(
          startDate.toString(),
          endDate.toString()
        )

        setAggregate(agg)
      } catch (error) {
        console.error("Failed to load aggregates", error)
      } finally {
        setLoading(false)
      }
    }

    loadAggregates()
  }, [mode])

  const periodLabel = mode === "monthly" ? "This month" : "This year"
  const net = (aggregate?.income || 0) - (aggregate?.expense || 0)

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
      <CardContent>
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
                      net >= 0 ? "text-emerald-500 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
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
      </CardContent>
    </Card>
  )
}

export default MonthRecapCards
