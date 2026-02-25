import { Wallet } from "lucide-react"
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "src/components/ui/card"
import { formatCurrency } from "src/lib/utils"
import { fetchAccounts } from "src/services/api";
import type { Account } from "src/types";

function AccountsInfo() {
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const [fetchedAccounts] = await Promise.all([fetchAccounts()]);

        setAccounts(fetchedAccounts);
      } catch (error) {
        console.error("Failed to load accounts", error);
      }
    };

    loadAccounts();
  }, []);

  return (
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Accounts</CardTitle>
            <CardDescription>Your connected balances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-slate-600" />
                    </div>
                    <div className="grid gap-1">
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
  )
}

export default AccountsInfo
