import type { DemoTransaction } from './demo-wallet-persistence.ts';

export type TransactionDirectionFilter = 'all' | 'in' | 'out';

export function filterDemoTransactions(
  transactions: readonly DemoTransaction[],
  query: string,
  direction: TransactionDirectionFilter = 'all',
): DemoTransaction[] {
  const normalizedQuery = query.trim().toLowerCase();

  return transactions.filter((transaction) => {
    if (direction !== 'all' && transaction.direction !== direction) return false;
    if (!normalizedQuery) return true;

    const searchableText = [
      transaction.id,
      transaction.label,
      transaction.direction,
      transaction.amountBtc.toFixed(8),
      transaction.date,
      transaction.status,
      transaction.addressLabel,
    ].join(' ').toLowerCase();

    return searchableText.includes(normalizedQuery);
  });
}
