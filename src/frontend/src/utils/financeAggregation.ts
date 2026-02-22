import type { FinanceEntry } from '../backend';

export interface AggregatedEntry {
  date: Date;
  total: number;
  entries: Array<{
    id: string;
    category: string;
    amount: number;
  }>;
}

export function aggregateByPeriod(
  entries: FinanceEntry[],
  period: 'daily' | 'monthly' | 'yearly'
): AggregatedEntry[] {
  const grouped = new Map<string, AggregatedEntry>();

  entries.forEach((entry) => {
    const date = new Date(Number(entry.date));
    let key: string;

    if (period === 'daily') {
      key = date.toISOString().split('T')[0];
    } else if (period === 'monthly') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    } else {
      key = String(date.getFullYear());
    }

    if (!grouped.has(key)) {
      grouped.set(key, {
        date: new Date(date),
        total: 0,
        entries: [],
      });
    }

    const group = grouped.get(key)!;
    group.total += entry.amount;
    group.entries.push({
      id: entry.id,
      category: entry.category,
      amount: entry.amount,
    });
  });

  return Array.from(grouped.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
}
