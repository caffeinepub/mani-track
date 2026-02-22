import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { TrendingUp, TrendingDown, PiggyBank, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from './ui/button';
import { useDeleteFinanceEntry } from '../hooks/useFinanceQueries';
import { toast } from 'sonner';
import type { AggregatedEntry } from '../utils/financeAggregation';

interface FinanceSectionProps {
  title: string;
  entries: AggregatedEntry[];
  type: 'income' | 'expense' | 'saving';
  timePeriod: 'daily' | 'monthly' | 'yearly';
}

export function FinanceSection({ title, entries, type, timePeriod }: FinanceSectionProps) {
  const Icon = type === 'income' ? TrendingUp : type === 'expense' ? TrendingDown : PiggyBank;
  const colorClass =
    type === 'income' ? 'text-income' : type === 'expense' ? 'text-expense' : 'text-saving';
  const bgClass =
    type === 'income'
      ? 'bg-income/10 border-income/20'
      : type === 'expense'
        ? 'bg-expense/10 border-expense/20'
        : 'bg-saving/10 border-saving/20';

  const deleteEntryMutation = useDeleteFinanceEntry();

  const formatPeriodLabel = (date: Date) => {
    if (timePeriod === 'daily') return format(date, 'MMM dd, yyyy');
    if (timePeriod === 'monthly') return format(date, 'MMMM yyyy');
    return format(date, 'yyyy');
  };

  const handleDelete = async (entryId: string, category: string) => {
    try {
      await deleteEntryMutation.mutateAsync(entryId);
      toast.success(`${category} entry deleted successfully`);
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete entry');
    }
  };

  return (
    <Card className={`border ${bgClass}`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${colorClass}`}>
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No entries yet</p>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {entries.map((entry, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg bg-card border border-border hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-medium">{formatPeriodLabel(entry.date)}</span>
                    <span className={`text-lg font-bold ${colorClass}`}>
                      ₹{entry.total.toFixed(2)}
                    </span>
                  </div>
                  {entry.entries.length > 0 && (
                    <div className="space-y-1 mt-2 pt-2 border-t border-border/50">
                      {entry.entries.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center text-xs text-muted-foreground group"
                        >
                          <span className="truncate max-w-[120px]">{item.category}</span>
                          <div className="flex items-center gap-2">
                            <span>₹{item.amount.toFixed(2)}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleDelete(item.id, item.category)}
                              disabled={deleteEntryMutation.isPending}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
