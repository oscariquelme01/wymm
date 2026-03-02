import { startOfMonth, startOfYear } from "date-fns";
import { ArrowDownRight, ArrowUpRight, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "src/components/ui/card";
import { cn, formatCurrency } from "src/lib/utils";
import { fetchAggregate } from "src/services/api";

type RecapMode = "monthly" | "yearly";

function MonthRecapCards({ className }: { className?: string }) {
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<RecapMode>("monthly");
  const [aggregate, setAggregate] = useState<{
    income: number;
    expense: number;
  } | null>(null);

  useEffect(() => {
    const loadAggregates = async () => {
      setLoading(true);
      try {
        const endDate = new Date();
        const startDate =
          mode === "monthly" ? startOfMonth(endDate) : startOfYear(endDate);

        const agg = await fetchAggregate(
          startDate.toString(),
          endDate.toString(),
        );

        setAggregate(agg);
      } catch (error) {
        console.error("Failed to load aggregates", error);
      } finally {
        setLoading(false);
      }
    };

    loadAggregates();
  }, [mode]);

  const periodLabel = mode === "monthly" ? "This month" : "This year";

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex items-center justify-between flex-row">
        <CardTitle>{periodLabel}'s recap</CardTitle>

        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 w-fit">
          <button
            onClick={() => setMode("monthly")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              mode === "monthly"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setMode("yearly")}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              mode === "yearly"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            Yearly
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3 w-full">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Income
              </CardTitle>
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : formatCurrency(aggregate?.income || 0)}
              </div>
              <p className="text-xs text-muted-foreground">{periodLabel}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Expenses
              </CardTitle>
              <ArrowDownRight className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : formatCurrency(aggregate?.expense || 0)}
              </div>
              <p className="text-xs text-muted-foreground">{periodLabel}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Income</CardTitle>
              <DollarSign className="h-4 w-4 text-slate-500" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${(aggregate?.income || 0) - (aggregate?.expense || 0) >= 0 ? "text-emerald-600" : "text-red-600"}`}
              >
                {loading
                  ? "..."
                  : formatCurrency(
                      (aggregate?.income || 0) - (aggregate?.expense || 0),
                    )}
              </div>
              <p className="text-xs text-muted-foreground">{periodLabel}</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}

export default MonthRecapCards;
