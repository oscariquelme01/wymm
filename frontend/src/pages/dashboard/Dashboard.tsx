import TransactionsTable from "./TransactionsTable"
import RecapCards from "./RecapCards"
import CashFlowChart from "./CashFlowChart"
import AccountsInfo from "./AccountsInfo"

export default function Dashboard() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard
        </h2>
        <p className="text-muted-foreground">
          Overview of your financial health.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <RecapCards className="col-span-5" />
        <AccountsInfo className="col-span-2 row-span-2" />
        <CashFlowChart className="col-span-5" />
        <TransactionsTable className="md:col-span-7 col-span-2" />
      </div>
    </div>
  )
}
