import { format, startOfMonth, subMonths } from "date-fns"
import type { AnalyticsFilters } from "@/types"

export const defaultFilters: AnalyticsFilters = {
  queryType: "aggregate",
  startDate: format(startOfMonth(subMonths(new Date(), 1)), "yyyy-MM-dd"),
  endDate: format(new Date(), "yyyy-MM-dd"),
  transactionType: undefined,
  interval: "month",
}
