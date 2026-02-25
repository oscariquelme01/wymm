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
} from "src/components/ui/card"
import { formatCurrency } from "src/lib/utils"
import type { AnalyticsResult } from "src/types"

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
          <div className="h-4 w-32 rounded bg-muted animate-pulse" />
          <div className="h-8 w-48 rounded bg-muted animate-pulse" />
          <div className="h-4 w-64 rounded bg-muted animate-pulse" />
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
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${isExpense ? "bg-red-100" : "bg-emerald-100"}`}
          >
            <DollarSign
              className={`h-5 w-5 ${isExpense ? "text-red-600" : "text-emerald-600"}`}
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
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${isPositive ? "bg-emerald-100" : "bg-red-100"}`}
          >
            <Icon
              className={`h-5 w-5 ${isPositive ? "text-emerald-600" : "text-red-600"}`}
            />
          </div>
          <span
            className={`text-3xl font-bold ${isPositive ? "text-emerald-600" : "text-red-600"}`}
          >
            {isPositive ? "+" : ""}
            {formatCurrency(result.value)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-500">
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
          <BarChart3 className="h-5 w-5 text-slate-500" />
          Timeseries — {label}
        </CardTitle>
        <CardDescription>
          {result.data.length} data points ({result.interval}ly interval)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          {chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-slate-400">
              No data available for this period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {useLineChart ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    fontSize={12}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v}`}
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    fontSize={12}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v}`}
                    fontSize={12}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
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
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-red-700">
            <span className="text-sm font-medium">Error:</span>
            <span className="text-sm">{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!result) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart3 className="mb-3 h-10 w-10 text-slate-300" />
            <p className="text-sm font-medium text-slate-500">
              No results yet
            </p>
            <p className="text-xs text-slate-400">
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
