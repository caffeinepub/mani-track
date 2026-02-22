import { FinanceSection } from './FinanceSection';
import { useGetAllFinanceEntries } from '../hooks/useFinanceQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Loader2, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { aggregateByPeriod } from '../utils/financeAggregation';
import { EntryType } from '../backend';

interface FinanceDashboardProps {
  timePeriod: 'daily' | 'monthly' | 'yearly';
  onTimePeriodChange: (period: 'daily' | 'monthly' | 'yearly') => void;
}

export function FinanceDashboard({ timePeriod, onTimePeriodChange }: FinanceDashboardProps) {
  const { data: entries = [], isLoading } = useGetAllFinanceEntries();

  const incomeEntries = entries.filter((e) => e.entryType === EntryType.income);
  const expenseEntries = entries.filter((e) => e.entryType === EntryType.expense);
  const savingEntries = entries.filter((e) => e.entryType === EntryType.saving);

  const aggregatedIncome = aggregateByPeriod(incomeEntries, timePeriod);
  const aggregatedExpense = aggregateByPeriod(expenseEntries, timePeriod);
  const aggregatedSaving = aggregateByPeriod(savingEntries, timePeriod);

  const totalIncome = incomeEntries.reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = expenseEntries.reduce((sum, e) => sum + e.amount, 0);
  const totalSaving = savingEntries.reduce((sum, e) => sum + e.amount, 0);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Finance Overview</CardTitle>
              <CardDescription>View your financial data by time period</CardDescription>
            </div>
            <Tabs value={timePeriod} onValueChange={(v) => onTimePeriodChange(v as any)}>
              <TabsList>
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">Yearly</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-income/10 border border-income/20">
              <TrendingUp className="h-8 w-8 text-income" />
              <div>
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-2xl font-bold text-income">₹{totalIncome.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-expense/10 border border-expense/20">
              <TrendingDown className="h-8 w-8 text-expense" />
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-expense">₹{totalExpense.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-saving/10 border border-saving/20">
              <PiggyBank className="h-8 w-8 text-saving" />
              <div>
                <p className="text-sm text-muted-foreground">Total Savings</p>
                <p className="text-2xl font-bold text-saving">₹{totalSaving.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <FinanceSection
          title="Income"
          entries={aggregatedIncome}
          type="income"
          timePeriod={timePeriod}
        />
        <FinanceSection
          title="Expenses"
          entries={aggregatedExpense}
          type="expense"
          timePeriod={timePeriod}
        />
        <FinanceSection
          title="Savings"
          entries={aggregatedSaving}
          type="saving"
          timePeriod={timePeriod}
        />
      </div>
    </div>
  );
}
