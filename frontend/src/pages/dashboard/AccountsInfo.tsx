import { Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  type PieSectorShapeProps,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { fetchAccounts } from "@/services/api";
import type { Account } from "@/types";

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

function AccountsInfoSkeleton() {
  return (
    <div className="space-y-4">
      <div className="aspect-square w-full mb-4 flex items-center justify-center">
        <Skeleton className="h-48 w-48 rounded-full" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-2">
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}

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
              data={pieData}
              cx="50%"
              cy="50%"
              shape={MyCustomPie}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const fetchedAccounts = await fetchAccounts();
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
        {loading ? (
          <AccountsInfoSkeleton />
        ) : (
          <>
            {renderPieChart(pieData)}
            <div className="space-y-2">
              {accounts.map((account, index) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors"
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
                    <div
                      className="grid gap-1"
                      style={{ color: COLORS[index % COLORS.length] }}
                    >
                      <p className="text-sm font-medium leading-none">
                        {account.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {account.institution}
                      </p>
                    </div>
                  </div>
                  <div className="font-medium text-foreground">
                    {formatCurrency(account.balance)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default AccountsInfo;
