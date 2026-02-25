import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "src/components/ui/card";
import { formatCurrency } from "src/lib/utils";
import { format, startOfMonth } from "date-fns";
import { fetchTransactions } from "src/services/api";
import type { Transaction } from "src/types";

function TransactionsTableSkeletonRows({ rows = 10 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b">
          {/* Date */}
          <td className="p-4 align-middle w-[15%]">
            <div className="h-4 w-24 rounded bg-muted animate-pulse" />
          </td>

          {/* Description */}
          <td className="p-4 align-middle w-[55%]">
            <div className="h-4 w-4/5 rounded bg-muted animate-pulse" />
          </td>

          {/* Type badge */}
          <td className="p-4 align-middle w-[15%]">
            <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
          </td>

          {/* Amount */}
          <td className="p-4 align-middle text-right w-[15%]">
            <div className="ml-auto h-4 w-20 rounded bg-muted animate-pulse" />
          </td>
        </tr>
      ))}
    </>
  );
}

function TransactionsTable({ className } : { className?: string }) {
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const endDate = new Date();
        const startDate = startOfMonth(endDate);

        const fetchedTransactions = await fetchTransactions(
          startDate.toString(),
          endDate.toString(),
        );

        setTransactions(fetchedTransactions);
      } catch (error) {
        console.error("Failed to load transactions", error);
      } finally {
        setLoading(false);
      }
    };
    loadTransactions();
  }, []);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);

  const itemsPerPage = 10;

  const totalPages = Math.ceil(transactions.length / itemsPerPage) || 1;
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>
          You made {transactions.length} transactions this month.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[10%]">
                  Date
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[50%]">
                  Description
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[10%]">
                  Account name
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[10%]">
                  Institution
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-[10%]">
                  Type
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground w-[10%]">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {loading ? (
                <TransactionsTableSkeletonRows />
              ) : (
                paginatedTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    {/* Date */}
                    <td className="p-4 align-middle">
                      {format(new Date(transaction.date), "MMM dd, yyyy")}
                    </td>

                    {/* Description */}
                    <td className="p-4 align-middle font-medium">
                      {transaction.description}
                    </td>

                    {/* Account name */}
                    <td className="p-4 align-middle font-medium">
                      {transaction.account.name}
                    </td>

                    {/* Institution */}
                    <td className="p-4 align-middle font-medium">
                      {transaction.account.institution}
                    </td>

                    {/* Type */}
                    <td className="p-4 align-middle">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                          transaction.type === "INCOME"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </td>

                    {/* Amount */}
                    <td
                      className={`p-4 align-middle text-right font-medium ${transaction.type === "INCOME" ? "text-emerald-600" : "text-slate-900"}`}
                    >
                      {transaction.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="bg-transparent text-slate-900 border border-slate-200 hover:bg-slate-100 gap-1 pl-2.5 shadow-none"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="bg-transparent text-slate-900 border border-slate-200 hover:bg-slate-100 gap-1 pr-2.5 shadow-none"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default TransactionsTable;
