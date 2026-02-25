import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from 'src/components/ui/card'
import { fetchTimeseries, fetchAccounts } from 'src/services/api'
import type { Account } from 'src/types'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts'
import { Wallet } from 'lucide-react'
import { format } from 'date-fns'
import { formatCurrency } from 'src/lib/utils'
import TransactionsTable from './TransactionsTable'
import MonthRecapCards from './MonthRecapCards'

export default function Dashboard() {
  const [timeseries, setTimeseries] = useState<{ date: string; income: number; expense: number }[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const today = new Date()
        const todayString = today.toString()

        const firstDayOfTheMonth = new Date(today.getFullYear(), today.getMonth(), 1).toString()
        const firstDayOfTheMonthString = firstDayOfTheMonth.toString()

        const [incomeSeries, expenseSeries, fetchedAccounts] = await Promise.all([
            fetchTimeseries(firstDayOfTheMonthString, todayString, 'day', 'INCOME'),
            fetchTimeseries(firstDayOfTheMonthString, todayString, 'day', 'EXPENSE'),
            fetchAccounts(),
        ])

        setAccounts(fetchedAccounts)

        // Merge series
        const merged = incomeSeries.map((item, index) => ({
          date: format(new Date(item.date), 'MMM dd'),
          income: item.amount,
          expense: expenseSeries[index]?.amount || 0
        }))
        
        setTimeseries(merged)
      } catch (error) {
        console.error('Failed to load analytics', error)
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
        <p className="text-slate-500">Overview of your financial health.</p>
      </div>

      <MonthRecapCards/>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Main Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Cash Flow</CardTitle>
             <CardDescription>Income vs Expenses over time</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeseries}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} fontSize={12} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend />
                  <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
                  <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Accounts Table (Small) */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Accounts</CardTitle>
            <CardDescription>Your connected balances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center">
                       <Wallet className="h-5 w-5 text-slate-600" />
                    </div>
                    <div className="grid gap-1">
                      <p className="text-sm font-medium leading-none">{account.name}</p>
                      <p className="text-xs text-muted-foreground">{account.institution}</p>
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
      </div>

      {/* Transactions Table (Main) */}
      <TransactionsTable/>
    </div>
  )
}

