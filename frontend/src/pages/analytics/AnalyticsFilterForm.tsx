import { format, startOfMonth, subMonths } from "date-fns"
import { Search, RotateCcw } from "lucide-react"
import { Button } from "src/components/ui/button"
import { Input } from "src/components/ui/input"
import { Select } from "src/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "src/components/ui/card"
import type {
  AnalyticsFilters,
  AnalyticsQueryType,
  TimeseriesInterval,
  TransactionTypes,
} from "src/types"

interface AnalyticsFilterFormProps {
  filters: AnalyticsFilters
  onChange: (filters: AnalyticsFilters) => void
  onSubmit: () => void
  loading: boolean
}

const defaultFilters: AnalyticsFilters = {
  queryType: "aggregate",
  startDate: format(startOfMonth(subMonths(new Date(), 1)), "yyyy-MM-dd"),
  endDate: format(new Date(), "yyyy-MM-dd"),
  transactionType: undefined,
  interval: "month",
}

function AnalyticsFilterForm({
  filters,
  onChange,
  onSubmit,
  loading,
}: AnalyticsFilterFormProps) {
  const handleQueryTypeChange = (queryType: AnalyticsQueryType) => {
    const updated: AnalyticsFilters = { ...filters, queryType }

    // Clear fields that don't apply to the new query type
    if (queryType === "cashflow") {
      updated.transactionType = undefined
    }
    if (queryType !== "timeseries") {
      updated.interval = undefined
    } else if (!updated.interval) {
      updated.interval = "month"
    }

    onChange(updated)
  }

  const handleReset = () => {
    onChange({ ...defaultFilters })
  }

  const showTransactionType = filters.queryType !== "cashflow"
  const showInterval = filters.queryType === "timeseries"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Query Builder</CardTitle>
        <CardDescription>
          Configure your analytics query by selecting a type and setting filters
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
          className="space-y-6"
        >
          {/* Query type selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Query Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  {
                    value: "aggregate",
                    label: "Aggregate",
                    desc: "Total sum",
                  },
                  {
                    value: "timeseries",
                    label: "Timeseries",
                    desc: "Over time",
                  },
                  {
                    value: "cashflow",
                    label: "Cashflow",
                    desc: "Net income",
                  },
                ] as const
              ).map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleQueryTypeChange(option.value)}
                  className={`rounded-lg border-2 p-3 text-left transition-colors ${
                    filters.queryType === option.value
                      ? "border-slate-900 bg-slate-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="text-sm font-medium text-slate-900">
                    {option.label}
                  </div>
                  <div className="text-xs text-slate-500">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Start Date
              </label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  onChange({ ...filters, startDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                End Date
              </label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  onChange({ ...filters, endDate: e.target.value })
                }
              />
            </div>
          </div>

          {/* Conditional fields */}
          <div className="grid grid-cols-2 gap-4">
            {showTransactionType && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Transaction Type
                </label>
                <Select
                  value={filters.transactionType ?? ""}
                  onChange={(e) =>
                    onChange({
                      ...filters,
                      transactionType:
                        (e.target.value as TransactionTypes) || undefined,
                    })
                  }
                >
                  <option value="">All Types</option>
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                  <option value="TRANSFER">Transfer</option>
                </Select>
              </div>
            )}

            {showInterval && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Interval
                </label>
                <Select
                  value={filters.interval ?? "month"}
                  onChange={(e) =>
                    onChange({
                      ...filters,
                      interval: e.target.value as TimeseriesInterval,
                    })
                  }
                >
                  <option value="day">Daily</option>
                  <option value="week">Weekly</option>
                  <option value="month">Monthly</option>
                </Select>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              <Search className="mr-2 h-4 w-4" />
              {loading ? "Running..." : "Run Query"}
            </Button>
            <Button
              type="button"
              onClick={handleReset}
              className="bg-white text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export { AnalyticsFilterForm, defaultFilters }
