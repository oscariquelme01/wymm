import { format, startOfMonth, subMonths } from "date-fns";
import { useEffect, useState } from "react";
import {
  Bar,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "src/components/ui/card";
import { fetchTimeseries } from "src/services/api";

function CashFlowChartSkeleton() {
  return (
    <div className="relative h-75 w-full">
      {/* Fake grid lines */}
      <div className="absolute inset-0 flex flex-col justify-between py-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-px w-full bg-muted/40" />
        ))}
      </div>

      {/* Fake bars */}
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-6 pb-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-end gap-1">
            <div
              className="w-3 rounded-t bg-muted animate-pulse"
              style={{ height: `${40 + Math.random() * 80}px` }}
            />
            <div
              className="w-3 rounded-t bg-muted animate-pulse"
              style={{ height: `${30 + Math.random() * 70}px` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function CashFlowChart({ className }: { className?: string }) {
  const [timeseries, setTimeseries] = useState<{ date: string; income: number; expense: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const endDate = new Date();
        const startDate =  startOfMonth(subMonths(new Date(), 12))

        const [incomeSeries, expenseSeries] = await Promise.all([
            fetchTimeseries(startDate.toString(), endDate.toString(), 'month', 'INCOME'),
            fetchTimeseries(startDate.toString(), endDate.toString(), 'month', 'EXPENSE'),
        ])

        // Merge series
        const merged = incomeSeries.map((item, index) => ({
          date: format(new Date(item.date), 'MMM dd'),
          income: item.amount,
          expense: expenseSeries[index]?.amount || 0
        }))
        
        setTimeseries(merged)
      } catch (error) {
        console.error('Failed to load cashflow', error)
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

          { loading ? (
            CashFlowChartSkeleton()
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeseries}>
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
                  tickFormatter={(value) => `$${value}`}
                  fontSize={12}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="income"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  name="Income"
                />
                <Bar
                  dataKey="expense"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  name="Expense"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default CashFlowChart;
