import { useGetAllFinanceEntries } from '../hooks/useFinanceQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from './ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Loader2, BarChart3 } from 'lucide-react';
import { formatChartData } from '../utils/chartDataFormatter';

interface ComparisonChartProps {
  timePeriod: 'daily' | 'monthly' | 'yearly';
  onTimePeriodChange: (period: 'daily' | 'monthly' | 'yearly') => void;
}

const chartConfig = {
  income: {
    label: 'Income',
    color: 'oklch(var(--income))',
  },
  expense: {
    label: 'Expenses',
    color: 'oklch(var(--expense))',
  },
  saving: {
    label: 'Savings',
    color: 'oklch(var(--saving))',
  },
};

export function ComparisonChart({ timePeriod, onTimePeriodChange }: ComparisonChartProps) {
  const { data: entries = [], isLoading } = useGetAllFinanceEntries();

  const chartData = formatChartData(entries, timePeriod);

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
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Financial Comparison
            </CardTitle>
            <CardDescription>Compare income, expenses, and savings over time</CardDescription>
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
        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No data available for the selected period</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="period"
                  className="text-xs"
                  tick={{ fill: 'oklch(var(--muted-foreground))' }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: 'oklch(var(--muted-foreground))' }}
                  tickFormatter={(value) => `₹${value}`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="var(--color-expense)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="saving" fill="var(--color-saving)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
