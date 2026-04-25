import { format } from "date-fns"
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn, formatCurrency } from "@/lib/utils"
import {
  tooltipItemStyle,
  tooltipLabelStyle,
  tooltipStyle,
} from "@/lib/chart-tooltip"
import type { AnalyticsResult } from "@/types"

interface AnalyticsResultsProps {
  result: AnalyticsResult | null
  loading: boolean
  error: string | null
}

function ResultSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </CardContent>
    </Card>
  )
}


function AggregateResult({
  result,
}: {
  result: Extract<AnalyticsResult, { kind: "aggregate" }>
}) {
  const isExpense = result.transactionType === "EXPENSE"
  const label = result.transactionType
    ? `Total ${result.transactionType.charAt(0) + result.transactionType.slice(1).toLowerCase()}`
    : "Total (All Types)"

  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              isExpense
                ? "bg-red-100 dark:bg-red-900/30"
                : "bg-emerald-100 dark:bg-emerald-900/30"
            )}
          >
            <DollarSign
              className={cn(
                "h-5 w-5",
                isExpense
                  ? "text-red-600 dark:text-red-400"
                  : "text-emerald-600 dark:text-emerald-400"
              )}
            />
          </div>
          <span className="text-3xl font-bold">
            {formatCurrency(Math.abs(result.value))}
          </span>
        </CardTitle>
      </CardHeader>
    </Card>
  )
}

function CashflowResult({
  result,
}: {
  result: Extract<AnalyticsResult, { kind: "cashflow" }>
}) {
  const isPositive = result.value >= 0
  const Icon = isPositive ? TrendingUp : TrendingDown

  return (
    <Card>
      <CardHeader>
        <CardDescription>Net Cashflow</CardDescription>
        <CardTitle className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              isPositive
                ? "bg-emerald-100 dark:bg-emerald-900/30"
                : "bg-red-100 dark:bg-red-900/30"
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5",
                isPositive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              )}
            />
          </div>
          <span
            className={cn(
              "text-3xl font-bold",
              isPositive ? "text-emerald-600" : "text-red-600"
            )}
          >
            {isPositive ? "+" : ""}
            {formatCurrency(result.value)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {isPositive
            ? "You earned more than you spent in this period."
            : "You spent more than you earned in this period."}
        </p>
      </CardContent>
    </Card>
  )
}

function TimeseriesResult({
  result,
}: {
  result: Extract<AnalyticsResult, { kind: "timeseries" }>
}) {
  const dateFormat =
    result.interval === "day"
      ? "MMM dd"
      : result.interval === "week"
        ? "MMM dd"
        : "MMM yyyy"

  const chartData = result.data.map((point) => ({
    date: format(new Date(point.date), dateFormat),
    amount: point.amount,
  }))

  const label = result.transactionType
    ? result.transactionType.charAt(0) +
      result.transactionType.slice(1).toLowerCase()
    : "All Types"

  const barColor = result.transactionType === "EXPENSE" ? "#ef4444" : "#10b981"

  const useLineChart = chartData.length > 31

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          Timeseries — {label}
        </CardTitle>
        <CardDescription>
          {result.data.length} data points ({result.interval}ly interval)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          {chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No data available for this period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {useLineChart ? (
                <LineChart data={chartData}>
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
                    tickFormatter={(v) => formatCurrency(v)}
                    fontSize={12}
                    stroke="var(--muted-foreground)"
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={tooltipLabelStyle}
                    itemStyle={tooltipItemStyle}
                    formatter={(value: number | undefined) => [
                      formatCurrency(value ?? 0),
                      label,
                    ]}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke={barColor}
                    strokeWidth={2}
                    dot={false}
                    name={label}
                  />
                </LineChart>
              ) : (
                <BarChart data={chartData}>
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
                    tickFormatter={(v) => formatCurrency(v)}
                    fontSize={12}
                    stroke="var(--muted-foreground)"
                  />
                  <Tooltip
                    cursor={{ fill: "var(--accent)" }}
                    contentStyle={tooltipStyle}
                    labelStyle={tooltipLabelStyle}
                    itemStyle={tooltipItemStyle}
                    formatter={(value: number | undefined) => [
                      formatCurrency(value ?? 0),
                      label,
                    ]}
                  />
                  <Legend />
                  <Bar
                    dataKey="amount"
                    fill={barColor}
                    radius={[4, 4, 0, 0]}
                    name={label}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function AnalyticsResults({ result, loading, error }: AnalyticsResultsProps) {
  if (loading) {
    return <ResultSkeleton />
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          <span className="font-medium">Error:</span> {error}
        </AlertDescription>
      </Alert>
    )
  }

  if (!result) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart3 className="mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">
              No results yet
            </p>
            <p className="text-xs text-muted-foreground/70">
              Configure your filters above and run a query to see results
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  switch (result.kind) {
    case "aggregate":
      return <AggregateResult result={result} />
    case "cashflow":
      return <CashflowResult result={result} />
    case "timeseries":
      return <TimeseriesResult result={result} />
  }
}

export default AnalyticsResults
