import { useState } from "react"
import {
  fetchAggregateByType,
  fetchCashflow,
  fetchTimeseries,
} from "@/services/api"
import type { AnalyticsFilters, AnalyticsResult } from "@/types"
import { AnalyticsFilterForm } from "./AnalyticsFilterForm"
import { defaultFilters } from "./constants"
import AnalyticsResults from "./AnalyticsResults"

function Analytics() {
  const [filters, setFilters] = useState<AnalyticsFilters>({
    ...defaultFilters,
  })
  const [result, setResult] = useState<AnalyticsResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      switch (filters.queryType) {
        case "aggregate": {
          const value = await fetchAggregateByType(
            filters.startDate,
            filters.endDate,
            filters.transactionType
          )
          setResult({
            kind: "aggregate",
            value,
            transactionType: filters.transactionType,
          })
          break
        }

        case "timeseries": {
          const interval = filters.interval ?? "month"
          const data = await fetchTimeseries(
            filters.startDate,
            filters.endDate,
            interval,
            filters.transactionType
          )
          setResult({
            kind: "timeseries",
            data,
            interval,
            transactionType: filters.transactionType,
          })
          break
        }

        case "cashflow": {
          const value = await fetchCashflow(
            filters.startDate,
            filters.endDate
          )
          setResult({ kind: "cashflow", value })
          break
        }
      }
    } catch (err) {
      console.error("Analytics query failed", err)
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Analytics
        </h2>
        <p className="text-sm text-muted-foreground">
          Build custom queries to analyze your financial data
        </p>
      </div>

      <AnalyticsFilterForm
        filters={filters}
        onChange={setFilters}
        onSubmit={handleSubmit}
        loading={loading}
      />

      <AnalyticsResults result={result} loading={loading} error={error} />
    </div>
  )
}

export default Analytics
