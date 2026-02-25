import TransactionsTable from "./TransactionsTable";
import MonthRecapCards from "./MonthRecapCards";
import CashFlowChart from "./CashFlowChart";
import AccountsInfo from "./AccountsInfo";

export default function Dashboard() {

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Dashboard
        </h2>
        <p className="text-slate-500">Overview of your financial health.</p>
      </div>

      <MonthRecapCards />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <CashFlowChart />
        <AccountsInfo />
      </div>

      <TransactionsTable />
    </div>
  );
}
