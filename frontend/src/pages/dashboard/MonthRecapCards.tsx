import { ArrowDownRight, ArrowUpRight, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "src/components/ui/card";
import { formatCurrency } from "src/lib/utils";
import { fetchAggregate } from "src/services/api";

function MonthRecapCards() {
  const [loading, setLoading] = useState(true);
  const [aggregate, setAggregate] = useState<{
    income: number;
    expense: number;
  } | null>(null);

  useEffect(() => {
    const loadAggregates = async () => {
      try {
        const today = new Date();
        const todayString = today.toString();

        const firstDayOfTheMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          1,
        ).toString();
        const firstDayOfTheMonthString = firstDayOfTheMonth.toString();

        const agg = await fetchAggregate(firstDayOfTheMonthString, todayString);

        setAggregate(agg);
      } catch (error) {
        console.error("Failed to load aggregates", error);
      } finally {
        setLoading(false);
      }
    };

    loadAggregates();
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <ArrowUpRight className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "..." : formatCurrency(aggregate?.income || 0)}
          </div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <ArrowDownRight className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {loading ? "..." : formatCurrency(aggregate?.expense || 0)}
          </div>
          <p className="text-xs text-muted-foreground">This month</p>
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
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default MonthRecapCards;
