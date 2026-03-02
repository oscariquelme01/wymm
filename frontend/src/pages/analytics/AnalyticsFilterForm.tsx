import { Search, RotateCcw } from "lucide-react"
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { defaultFilters } from "./constants"
import type {
  AnalyticsFilters,
  AnalyticsQueryType,
  TimeseriesInterval,
  TransactionTypes,
} from "@/types"

interface AnalyticsFilterFormProps {
  filters: AnalyticsFilters
  onChange: (filters: AnalyticsFilters) => void
  onSubmit: () => void
  loading: boolean
}

function AnalyticsFilterForm({
  filters,
  onChange,
  onSubmit,
  loading,
}: AnalyticsFilterFormProps) {
  const handleQueryTypeChange = (queryType: AnalyticsQueryType) => {
    const updated: AnalyticsFilters = { ...filters, queryType }

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
            <Label>Query Type</Label>
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
                  className={cn(
                    "rounded-lg border-2 p-3 text-left transition-colors",
                    filters.queryType === option.value
                      ? "border-primary bg-accent"
                      : "border-border hover:border-muted-foreground/30"
                  )}
                >
                  <div className="text-sm font-medium text-foreground">
                    {option.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {option.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  onChange({ ...filters, startDate: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
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
                <Label>Transaction Type</Label>
                <Select
                  value={filters.transactionType ?? "all"}
                  onValueChange={(value) =>
                    onChange({
                      ...filters,
                      transactionType:
                        value === "all"
                          ? undefined
                          : (value as TransactionTypes),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="INCOME">Income</SelectItem>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                    <SelectItem value="TRANSFER">Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {showInterval && (
              <div className="space-y-2">
                <Label>Interval</Label>
                <Select
                  value={filters.interval ?? "month"}
                  onValueChange={(value) =>
                    onChange({
                      ...filters,
                      interval: value as TimeseriesInterval,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Daily</SelectItem>
                    <SelectItem value="week">Weekly</SelectItem>
                    <SelectItem value="month">Monthly</SelectItem>
                  </SelectContent>
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
            <Button type="button" variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export { AnalyticsFilterForm }
