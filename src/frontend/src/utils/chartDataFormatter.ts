import { startOfDay, startOfMonth, startOfYear, format } from 'date-fns';
import type { FinanceEntry } from '../backend';
import { EntryType } from '../backend';

export interface ChartDataPoint {
  period: string;
  income: number;
  expense: number;
  saving: number;
}

export function formatChartData(
  entries: FinanceEntry[],
  timePeriod: 'daily' | 'monthly' | 'yearly'
): ChartDataPoint[] {
  const grouped = new Map<
    string,
    { date: Date; income: number; expense: number; saving: number }
  >();

  // Determine format string based on time period
  let formatString: string;
  if (timePeriod === 'daily') {
    formatString = 'MMM dd';
  } else if (timePeriod === 'monthly') {
    formatString = 'MMM yyyy';
  } else {
    formatString = 'yyyy';
  }

  entries.forEach((entry) => {
    const date = new Date(Number(entry.date) * 1000);
    let key: string;
    let periodDate: Date;

    if (timePeriod === 'daily') {
      periodDate = startOfDay(date);
      key = format(periodDate, 'yyyy-MM-dd');
    } else if (timePeriod === 'monthly') {
      periodDate = startOfMonth(date);
      key = format(periodDate, 'yyyy-MM');
    } else {
      periodDate = startOfYear(date);
      key = format(periodDate, 'yyyy');
    }

    if (!grouped.has(key)) {
      grouped.set(key, { date: periodDate, income: 0, expense: 0, saving: 0 });
    }

    const group = grouped.get(key)!;
    if (entry.entryType === EntryType.income) {
      group.income += entry.amount;
    } else if (entry.entryType === EntryType.expense) {
      group.expense += entry.amount;
    } else if (entry.entryType === EntryType.saving) {
      group.saving += entry.amount;
    }
  });

  const chartData: ChartDataPoint[] = Array.from(grouped.entries())
    .map(([key, data]) => ({
      period: format(data.date, formatString),
      income: Math.round(data.income * 100) / 100,
      expense: Math.round(data.expense * 100) / 100,
      saving: Math.round(data.saving * 100) / 100,
      sortDate: data.date.getTime(),
    }))
    .sort((a, b) => a.sortDate - b.sortDate)
    .map(({ sortDate, ...rest }) => rest);

  return chartData.slice(-10);
}
