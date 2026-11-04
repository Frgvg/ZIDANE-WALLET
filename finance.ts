import { Feather } from '@expo/vector-icons';

export type TransactionType = 'expense' | 'income';
export type CurrencyCode = 'XOF';

export interface CategoryDefinition {
  id: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}

export const EXPENSE_CATEGORIES = [
  { id: 'groceries', label: 'Groceries', icon: 'shopping-cart' },
  { id: 'dining', label: 'Dining', icon: 'coffee' },
  { id: 'transport', label: 'Transport', icon: 'truck' },
  { id: 'housing', label: 'Home', icon: 'home' },
  { id: 'bills', label: 'Bills', icon: 'zap' },
  { id: 'shopping', label: 'Shopping', icon: 'shopping-bag' },
  { id: 'health', label: 'Health', icon: 'heart' },
  { id: 'entertainment', label: 'Fun', icon: 'film' },
  { id: 'education', label: 'Education', icon: 'book-open' },
  { id: 'other', label: 'Other', icon: 'more-horizontal' },
] as const satisfies readonly CategoryDefinition[];

export const INCOME_CATEGORIES = [
  { id: 'salary', label: 'Salary', icon: 'briefcase' },
  { id: 'freelance', label: 'Freelance', icon: 'code' },
  { id: 'gift', label: 'Gift', icon: 'gift' },
  { id: 'other-income', label: 'Other', icon: 'dollar-sign' },
] as const satisfies readonly CategoryDefinition[];

export type CategoryId =
  | (typeof EXPENSE_CATEGORIES)[number]['id']
  | (typeof INCOME_CATEGORIES)[number]['id'];

export type Category = (typeof EXPENSE_CATEGORIES)[number] | (typeof INCOME_CATEGORIES)[number];

export function getCategories(type: TransactionType): readonly Category[] {
  return type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
}

export function getCategory(categoryId: CategoryId | string): CategoryDefinition {
  return (
    [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].find(
      (category) => category.id === categoryId,
    ) ?? EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1]
  );
}

export function formatMoney(amount: number, currency: CurrencyCode = 'XOF'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatShortDate(date: string): string {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function currentMonthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function isInCurrentMonth(date: string, now = new Date()): boolean {
  return date.slice(0, 7) === currentMonthKey(now);
}

export function monthLabel(date = new Date()): string {
  return new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(date);
}

export function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

