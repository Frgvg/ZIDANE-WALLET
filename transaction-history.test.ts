import assert from 'node:assert/strict';
import test from 'node:test';
import { filterDemoTransactions } from './transaction-history.ts';
import type { DemoTransaction } from './demo-wallet-persistence.ts';

const transactions: DemoTransaction[] = [
  {
    id: 'sim-newest',
    label: 'Simulated send',
    direction: 'out',
    amountBtc: 0.0025,
    sampleFiatValue: 167.825,
    date: 'Just now',
    status: 'Local simulation · not sent',
    addressLabel: 'Sample shop',
    createdAt: 20,
  },
  {
    id: 'tx-sample-in',
    label: 'Demo deposit',
    direction: 'in',
    amountBtc: 0.025,
    sampleFiatValue: 1678.25,
    date: 'Today · 10:42 AM',
    status: 'Sample',
    addressLabel: 'Sample activity',
  },
  {
    id: 'tx-sample-out',
    label: 'Coffee & company',
    direction: 'out',
    amountBtc: 0.0018,
    sampleFiatValue: 120.83,
    date: 'Yesterday · 2:18 PM',
    status: 'Sample',
    addressLabel: 'Demo recipient label',
  },
];

test('history search is case-insensitive and matches labels, IDs, and recipients', () => {
  assert.deepEqual(filterDemoTransactions(transactions, 'COFFEE').map(({ id }) => id), ['tx-sample-out']);
  assert.deepEqual(filterDemoTransactions(transactions, 'sim-newest').map(({ id }) => id), ['sim-newest']);
  assert.deepEqual(filterDemoTransactions(transactions, 'sample shop').map(({ id }) => id), ['sim-newest']);
});

test('direction filters retain the existing newest-first order', () => {
  assert.deepEqual(filterDemoTransactions(transactions, '', 'out').map(({ id }) => id), [
    'sim-newest',
    'tx-sample-out',
  ]);
  assert.deepEqual(filterDemoTransactions(transactions, '', 'in').map(({ id }) => id), ['tx-sample-in']);
});

test('empty search returns all entries without changing the source history', () => {
  const result = filterDemoTransactions(transactions, '   ');
  assert.deepEqual(result.map(({ id }) => id), ['sim-newest', 'tx-sample-in', 'tx-sample-out']);
  assert.equal(transactions.length, 3);
});
