import { useState } from 'react';
import { useAddOrUpdateFinanceEntry } from '../hooks/useFinanceQueries';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { PlusCircle, Loader2, CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { EntryType } from '../backend';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function FinanceEntryForm() {
  const [formData, setFormData] = useState({
    id: '',
    amount: '',
    date: new Date(),
    category: '',
    entryType: 'income' as 'income' | 'expense' | 'saving',
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const addOrUpdateEntry = useAddOrUpdateFinanceEntry();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.id.trim()) {
      newErrors.id = 'Entry ID is required';
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }

    try {
      await addOrUpdateEntry.mutateAsync({
        id: formData.id.trim(),
        amount: parseFloat(formData.amount),
        date: BigInt(Math.floor(formData.date.getTime() / 1000)),
        category: formData.category.trim(),
        entryType: EntryType[formData.entryType],
        description: formData.description.trim(),
      });

      toast.success('Finance entry saved successfully');
      setFormData({
        id: '',
        amount: '',
        date: new Date(),
        category: '',
        entryType: 'income',
        description: '',
      });
      setErrors({});
    } catch (error) {
      toast.error('Failed to save finance entry');
      console.error('Error saving entry:', error);
    }
  };

  const handleChange = (field: string, value: string | Date) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlusCircle className="h-5 w-5 text-primary" />
          Add Finance Entry
        </CardTitle>
        <CardDescription>
          Record your income, expenses, or savings with details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="id" className="text-sm font-medium">
                Entry ID *
              </Label>
              <Input
                id="id"
                value={formData.id}
                onChange={(e) => handleChange('id', e.target.value)}
                placeholder="e.g., INC-001"
                className={errors.id ? 'border-destructive' : ''}
              />
              {errors.id && <p className="text-xs text-destructive">{errors.id}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="entryType" className="text-sm font-medium">
                Type *
              </Label>
              <Select
                value={formData.entryType}
                onValueChange={(value) => handleChange('entryType', value)}
              >
                <SelectTrigger id="entryType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="saving">Saving</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium">
                Amount (₹) *
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                placeholder="e.g., 5000"
                className={errors.amount ? 'border-destructive' : ''}
              />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium">
                Date *
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formData.date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => date && handleChange('date', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Category *
            </Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              placeholder="e.g., Salary, Groceries, Investment"
              className={errors.category ? 'border-destructive' : ''}
            />
            {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Add any additional notes..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={addOrUpdateEntry.isPending}>
            {addOrUpdateEntry.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Entry
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
