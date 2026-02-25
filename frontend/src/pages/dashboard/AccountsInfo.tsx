import { Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
  type PieSectorShapeProps,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "src/components/ui/card";
import { formatCurrency } from "src/lib/utils";
import { fetchAccounts } from "src/services/api";
import type { Account } from "src/types";

const COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

function AccountsInfo({ className }: { className?: string }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  function renderPieChart(pieData: Array<{ name: string; value: number }>) {
    const MyCustomPie = (props: PieSectorShapeProps) => {
      return <Sector {...props} fill={COLORS[props.index % COLORS.length]} />;
    };
    return (
      <div className="aspect-square w-full mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              dataKey="value"
              // startAngle={180}
              // endAngle={0}
              data={pieData}
              cx="50%"
              cy="50%"
              shape={MyCustomPie}
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value))}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const [fetchedAccounts] = await Promise.all([fetchAccounts()]);

        setAccounts(fetchedAccounts);
      } catch (error) {
        console.error("Failed to load accounts", error);
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, []);

  const pieData = accounts.map((account) => ({
    name: account.name,
    value: Number(account.balance),
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Accounts</CardTitle>
        <CardDescription>Your connected balances</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? "..." : renderPieChart(pieData)}
        <div className="space-y-2">
          {accounts.map((account, index) => (
            <div
              key={account.id}
              className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className="h-9 w-9 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: `${COLORS[index % COLORS.length]}20`,
                  }}
                >
                  <Wallet
                    className="h-5 w-5"
                    style={{ color: COLORS[index % COLORS.length] }}
                  />
                </div>
                <div className="grid gap-1" style={{ color: COLORS[index % COLORS.length] }}>
                  <p className="text-sm font-medium leading-none">
                    {account.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {account.institution}
                  </p>
                </div>
              </div>
              <div className="font-medium text-slate-900">
                {formatCurrency(account.balance)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default AccountsInfo;
