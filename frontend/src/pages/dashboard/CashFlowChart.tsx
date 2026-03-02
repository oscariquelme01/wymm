import { format, startOfMonth, subMonths } from "date-fns"
import { useEffect, useState } from "react"
import {
  Bar,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  XAxis,
  YAxis,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"
import { fetchTimeseries } from "@/services/api"

const skeletonHeights = [
  [88, 62], [112, 48], [72, 96], [100, 56],
  [64, 80], [108, 44], [76, 92], [96, 68],
]

function CashFlowChartSkeleton() {
  return (
    <div className="relative h-75 w-full">
      <div className="absolute inset-0 flex flex-col justify-between py-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-px w-full" />
        ))}
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-6 pb-6">
        {skeletonHeights.map(([h1, h2], i) => (
          <div key={i} className="flex items-end gap-1">
            <Skeleton
              className="w-3 rounded-t"
              style={{ height: `${h1}px` }}
            />
            <Skeleton
              className="w-3 rounded-t"
              style={{ height: `${h2}px` }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function CashFlowChart({ className }: { className?: string }) {
  const [timeseries, setTimeseries] = useState<
    { date: string; income: number; expense: number }[]
  >([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const endDate = new Date()
        const startDate = startOfMonth(subMonths(new Date(), 12))

        const [incomeSeries, expenseSeries] = await Promise.all([
          fetchTimeseries(
            startDate.toString(),
            endDate.toString(),
            "month",
            "INCOME"
          ),
          fetchTimeseries(
            startDate.toString(),
            endDate.toString(),
            "month",
            "EXPENSE"
          ),
        ])

        const merged = incomeSeries.map((item, index) => ({
          date: format(new Date(item.date), "MMM dd"),
          income: item.amount,
          expense: expenseSeries[index]?.amount || 0,
        }))

        setTimeseries(merged)
      } catch (error) {
        console.error("Failed to load cashflow", error)
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Cash Flow</CardTitle>
        <CardDescription>Income vs Expenses over time</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-75 w-full">
          {loading ? (
            <CashFlowChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeseries}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  fontSize={12}
                  stroke="var(--muted-foreground)"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatCurrency(value)}
                  fontSize={12}
                  stroke="var(--muted-foreground)"
                />
                <Tooltip
                  cursor={{ fill: "var(--accent)" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--popover)",
                    color: "var(--popover-foreground)",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="income"
                  className="fill-emerald-500 dark:fill-emerald-400"
                  radius={[4, 4, 0, 0]}
                  name="Income"
                />
                <Bar
                  dataKey="expense"
                  className="fill-red-500 dark:fill-red-400"
                  radius={[4, 4, 0, 0]}
                  name="Expense"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default CashFlowChart
