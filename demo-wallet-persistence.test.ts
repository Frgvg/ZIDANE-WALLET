import assert from 'node:assert/strict';
import test from 'node:test';
import { formatBtcAmount } from './btc-amount.ts';
import {
  createUniqueSimulatedTransactionId,
  DEMO_WALLET_STORAGE_KEY,
  getDisplayedTransactions,
  getOrCreatePendingSimulatedTransactionId,
  loadDemoWallet,
  nextSimulatedTransactionTimestamp,
  persistDemoWallet,
  recordSimulatedTransaction,
  type DemoStorage,
  type DemoTransaction,
  type WalletData,
} from './demo-wallet-persistence.ts';

class MemoryStorage implements DemoStorage {
  private values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

const startingBalanceBtc = 0.08431;
const btcUsdPrice = 67_130;
const defaultWallet: WalletData = {
  created: true,
  balanceBtc: startingBalanceBtc,
  sampleFiatValue: startingBalanceBtc * btcUsdPrice,
  simulatedTransactions: [],
  settings: { hideBalance: false, autoLock: true, confirmationStep: true },
};
const sampleTransactions: DemoTransaction[] = [
  {
    id: 'tx-sample',
    label: 'Sample deposit',
    direction: 'in',
    amountBtc: 0.1,
    sampleFiatValue: 6_713,
    date: 'Sample date',
    status: 'Sample',
    addressLabel: 'Sample activity',
  },
];

function send(id: string, createdAt: number, amountBtc: number): DemoTransaction {
  return {
    id,
    label: 'Simulated send',
    direction: 'out',
    amountBtc,
    sampleFiatValue: amountBtc * btcUsdPrice,
    date: 'Just now',
    status: 'Local simulation · not sent',
    addressLabel: 'Demo recipient',
    createdAt,
  };
}

test('simulated transactions survive save and reload with a matching balance', () => {
  const storage = new MemoryStorage();
  const firstSend = recordSimulatedTransaction(
    defaultWallet,
    send('sim-first', 100, 0.01),
    startingBalanceBtc,
    btcUsdPrice,
  );
  assert.equal(firstSend.recorded, true);
  if (!firstSend.recorded) return;

  persistDemoWallet(storage, firstSend.wallet);
  const reloaded = loadDemoWallet(
    storage,
    defaultWallet,
    sampleTransactions.map(({ id }) => id),
    btcUsdPrice,
  );

  assert.equal(reloaded.simulatedTransactions.length, 1);
  assert.equal(reloaded.simulatedTransactions[0]?.id, 'sim-first');
  assert.equal(formatBtcAmount(reloaded.balanceBtc), '0.07431');
  assert.equal(
    formatBtcAmount(reloaded.balanceBtc),
    formatBtcAmount(startingBalanceBtc - reloaded.simulatedTransactions[0]!.amountBtc),
  );
});

test('repeated confirmation with the same transaction ID is idempotent', () => {
  let generatedIdCount = 0;
  const transactionId = getOrCreatePendingSimulatedTransactionId(
    null,
    defaultWallet.simulatedTransactions,
    () => `idempotent-${++generatedIdCount}`,
  );
  const repeatedConfirmationId = getOrCreatePendingSimulatedTransactionId(
    transactionId,
    defaultWallet.simulatedTransactions,
    () => {
      throw new Error('A repeated confirmation must reuse its pending ID.');
    },
  );
  const transaction = send(transactionId, 200, 0.01);
  const first = recordSimulatedTransaction(defaultWallet, transaction, startingBalanceBtc, btcUsdPrice);
  assert.equal(first.recorded, true);
  if (!first.recorded) return;

  const repeatedTransaction = send(repeatedConfirmationId, 200, 0.01);
  const duplicate = recordSimulatedTransaction(first.wallet, repeatedTransaction, startingBalanceBtc, btcUsdPrice);
  assert.equal(repeatedConfirmationId, transactionId);
  assert.equal(generatedIdCount, 1);
  assert.equal(duplicate.recorded, false);
  if (duplicate.recorded) return;
  assert.equal(duplicate.reason, 'duplicate');
  assert.equal(duplicate.wallet.simulatedTransactions.length, 1);
  assert.equal(formatBtcAmount(duplicate.wallet.balanceBtc), '0.07431');
});

test('separate sends get unique IDs and collisions with saved history are retried', () => {
  const existing = [
    send('sim-already-used', 50, 0.005),
    sampleTransactions[0]!,
  ];
  const generatedUuids = ['already-used', 'new-send-one', 'new-send-two'];
  const nextUuid = () => generatedUuids.shift()!;

  const firstId = createUniqueSimulatedTransactionId(existing, nextUuid);
  const secondId = createUniqueSimulatedTransactionId(
    [...existing, send(firstId, 100, 0.01)],
    nextUuid,
  );

  assert.equal(firstId, 'sim-new-send-one');
  assert.equal(secondId, 'sim-new-send-two');
  assert.notEqual(firstId, secondId);
});

test('new simulated sends receive increasing timestamps when the clock ties', () => {
  const existing = [send('sim-existing', 500, 0.01)];
  assert.equal(nextSimulatedTransactionTimestamp(existing, 500), 501);
  assert.equal(nextSimulatedTransactionTimestamp(existing, 501), 501);
});

test('simulated transactions are newest first, with sample transactions kept separate', () => {
  const older = send('sim-older', 100, 0.01);
  const newer = send('sim-newer', 200, 0.02);
  const stored = {
    ...defaultWallet,
    simulatedTransactions: [older, newer],
  };
  const storage = new MemoryStorage();

  persistDemoWallet(storage, stored);
  const persisted = JSON.parse(storage.getItem(DEMO_WALLET_STORAGE_KEY)!);
  assert.equal('transactions' in persisted, false);
  assert.deepEqual(
    persisted.simulatedTransactions.map((transaction: DemoTransaction) => transaction.id),
    ['sim-newer', 'sim-older'],
  );

  const displayed = getDisplayedTransactions(sampleTransactions, stored.simulatedTransactions);
  assert.deepEqual(displayed.map(({ id }) => id), ['sim-newer', 'sim-older', 'tx-sample']);
  assert.equal(displayed.length, 3);
});

test('legacy history preserves non-sample rows and repairs ID collisions without deleting rows', () => {
  const storage = new MemoryStorage();
  storage.setItem(
    DEMO_WALLET_STORAGE_KEY,
    JSON.stringify({
      created: true,
      settings: defaultWallet.settings,
      transactions: [
        sampleTransactions[0],
        send('sim-100', 100, 0.01),
        send('sim-200', 200, 0.02),
        send('sim-200', 200, 0.02),
        send('sim-200-history-1', 250, 0.003),
        send('history-legacy-1', 300, 0.005),
      ],
    }),
  );

  const reloaded = loadDemoWallet(
    storage,
    defaultWallet,
    sampleTransactions.map(({ id }) => id),
    btcUsdPrice,
  );

  assert.deepEqual(
    reloaded.simulatedTransactions.map(({ id }) => id),
    ['history-legacy-1', 'sim-200-history-1', 'sim-200', 'sim-200-history-2', 'sim-100'],
  );
  assert.equal(reloaded.simulatedTransactions.length, 5);
  assert.equal(new Set(reloaded.simulatedTransactions.map(({ id }) => id)).size, 5);
  assert.equal(formatBtcAmount(reloaded.balanceBtc), '0.02631');
  const displayed = getDisplayedTransactions(sampleTransactions, reloaded.simulatedTransactions);
  assert.equal(displayed.length, 6);
  assert.equal(new Set(displayed.map(({ id }) => id)).size, displayed.length);

  persistDemoWallet(storage, reloaded);
  const reloadedAgain = loadDemoWallet(
    storage,
    defaultWallet,
    sampleTransactions.map(({ id }) => id),
    btcUsdPrice,
  );
  assert.deepEqual(
    reloadedAgain.simulatedTransactions.map(({ id }) => id),
    reloaded.simulatedTransactions.map(({ id }) => id),
  );
  assert.equal(formatBtcAmount(reloadedAgain.balanceBtc), '0.02631');
});

test('loads separated and legacy history together without dropping older rows', () => {
  const storage = new MemoryStorage();
  storage.setItem(
    DEMO_WALLET_STORAGE_KEY,
    JSON.stringify({
      created: true,
      settings: defaultWallet.settings,
      simulatedTransactions: [send('sim-shared', 300, 0.02)],
      transactions: [
        sampleTransactions[0],
        send('sim-shared', 100, 0.01),
        send('history-older', 200, 0.005),
      ],
    }),
  );

  const reloaded = loadDemoWallet(
    storage,
    defaultWallet,
    sampleTransactions.map(({ id }) => id),
    btcUsdPrice,
  );

  assert.deepEqual(
    reloaded.simulatedTransactions.map(({ id }) => id),
    ['sim-shared', 'history-older', 'sim-shared-history-1'],
  );
  assert.equal(reloaded.simulatedTransactions.length, 3);
  assert.equal(formatBtcAmount(reloaded.balanceBtc), '0.04931');
  const displayed = getDisplayedTransactions(sampleTransactions, reloaded.simulatedTransactions);
  assert.equal(displayed.length, 4);
  assert.equal(new Set(displayed.map(({ id }) => id)).size, displayed.length);
});

test('overdrawn legacy history is retained, rekeyed, and fails closed for new sends', () => {
  const storage = new MemoryStorage();
  storage.setItem(
    DEMO_WALLET_STORAGE_KEY,
    JSON.stringify({
      created: true,
      settings: defaultWallet.settings,
      transactions: [
        send('sim-overdrawn', 100, 0.05),
        send('sim-overdrawn', 200, 0.05),
      ],
    }),
  );

  const reloaded = loadDemoWallet(
    storage,
    defaultWallet,
    sampleTransactions.map(({ id }) => id),
    btcUsdPrice,
  );
  assert.deepEqual(
    reloaded.simulatedTransactions.map(({ id }) => id),
    ['sim-overdrawn-history-1', 'sim-overdrawn'],
  );
  assert.equal(formatBtcAmount(reloaded.balanceBtc), '-0.01569');
  const displayed = getDisplayedTransactions(sampleTransactions, reloaded.simulatedTransactions);
  assert.equal(new Set(displayed.map(({ id }) => id)).size, displayed.length);

  persistDemoWallet(storage, reloaded);
  const reloadedAgain = loadDemoWallet(
    storage,
    defaultWallet,
    sampleTransactions.map(({ id }) => id),
    btcUsdPrice,
  );
  assert.equal(reloadedAgain.simulatedTransactions.length, 2);
  assert.equal(formatBtcAmount(reloadedAgain.balanceBtc), '-0.01569');

  const deniedSend = recordSimulatedTransaction(
    reloadedAgain,
    send('sim-new-send', 300, 0.001),
    startingBalanceBtc,
    btcUsdPrice,
  );
  assert.equal(deniedSend.recorded, false);
  if (deniedSend.recorded) return;
  assert.equal(deniedSend.reason, 'invalid-history');
  assert.equal(deniedSend.wallet.simulatedTransactions.length, 2);
  assert.equal(formatBtcAmount(deniedSend.wallet.balanceBtc), '-0.01569');
});

test('separated saved history keeps non-prefixed IDs and rekeys collisions with sample IDs', () => {
  const storage = new MemoryStorage();
  storage.setItem(
    DEMO_WALLET_STORAGE_KEY,
    JSON.stringify({
      version: 2,
      created: true,
      settings: defaultWallet.settings,
      simulatedTransactions: [
        send('history-id-1', 300, 0.01),
        send('tx-sample', 200, 0.005),
      ],
    }),
  );

  const reloaded = loadDemoWallet(
    storage,
    defaultWallet,
    sampleTransactions.map(({ id }) => id),
    btcUsdPrice,
  );

  assert.deepEqual(
    reloaded.simulatedTransactions.map(({ id }) => id),
    ['history-id-1', 'tx-sample-history-1'],
  );
  assert.equal(formatBtcAmount(reloaded.balanceBtc), '0.06931');
  const displayed = getDisplayedTransactions(sampleTransactions, reloaded.simulatedTransactions);
  assert.equal(new Set(displayed.map(({ id }) => id)).size, displayed.length);
});

test('history balance and sample estimate stay aligned at one-satoshi precision', () => {
  const oneSatoshiSend = recordSimulatedTransaction(
    defaultWallet,
    send('sim-satoshi', 300, 0.00000001),
    startingBalanceBtc,
    btcUsdPrice,
  );
  assert.equal(oneSatoshiSend.recorded, true);
  if (!oneSatoshiSend.recorded) return;

  assert.equal(formatBtcAmount(oneSatoshiSend.wallet.simulatedTransactions[0]!.amountBtc), '0.00000001');
  assert.equal(formatBtcAmount(oneSatoshiSend.wallet.balanceBtc), '0.08430999');
  assert.equal(
    oneSatoshiSend.wallet.sampleFiatValue,
    oneSatoshiSend.wallet.balanceBtc * btcUsdPrice,
  );
});
