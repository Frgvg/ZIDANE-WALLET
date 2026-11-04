import { btcToSatoshis, satoshisToBtc } from './btc-amount.ts';

export type DemoTransaction = {
  id: string;
  label: string;
  direction: 'in' | 'out';
  amountBtc: number;
  sampleFiatValue: number;
  date: string;
  status: string;
  addressLabel: string;
  createdAt?: number;
};

export type DemoSettings = {
  hideBalance: boolean;
  autoLock: boolean;
  confirmationStep: boolean;
};

export type WalletData = {
  created: boolean;
  balanceBtc: number;
  sampleFiatValue: number;
  simulatedTransactions: DemoTransaction[];
  settings: DemoSettings;
};

export interface DemoStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const DEMO_WALLET_STORAGE_KEY = 'zidane-demo-wallet';
const STORAGE_VERSION = 2;

export function sortSimulatedTransactions(
  transactions: readonly DemoTransaction[],
): DemoTransaction[] {
  return [...transactions].sort(
    (left, right) => (right.createdAt ?? 0) - (left.createdAt ?? 0),
  );
}

export function createUniqueSimulatedTransactionId(
  existingTransactions: readonly Pick<DemoTransaction, 'id'>[],
  createUuid: () => string,
): string {
  const existingIds = new Set(existingTransactions.map(({ id }) => id));

  for (let attempt = 0; attempt < 32; attempt += 1) {
    const uuid = createUuid();
    if (!uuid) continue;
    const candidate = `sim-${uuid}`;
    if (!existingIds.has(candidate)) return candidate;
  }

  throw new Error('Unable to generate a unique simulated transaction ID.');
}

export function getOrCreatePendingSimulatedTransactionId(
  pendingId: string | null,
  existingTransactions: readonly Pick<DemoTransaction, 'id'>[],
  createUuid: () => string,
): string {
  return pendingId ?? createUniqueSimulatedTransactionId(existingTransactions, createUuid);
}

export function nextSimulatedTransactionTimestamp(
  existingTransactions: readonly Pick<DemoTransaction, 'createdAt'>[],
  now = Date.now(),
): number {
  const newestTimestamp = existingTransactions.reduce((newest, transaction) => {
    const timestamp = transaction.createdAt;
    return typeof timestamp === 'number' && Number.isFinite(timestamp)
      ? Math.max(newest, timestamp)
      : newest;
  }, 0);

  return Math.max(now, newestTimestamp + 1);
}

export function getDisplayedTransactions(
  sampleTransactions: readonly DemoTransaction[],
  simulatedTransactions: readonly DemoTransaction[],
): DemoTransaction[] {
  return [...sortSimulatedTransactions(simulatedTransactions), ...sampleTransactions];
}

export function deriveDemoBalance(
  startingBalanceBtc: number,
  simulatedTransactions: readonly DemoTransaction[],
): number | null {
  const startingSatoshis = btcToSatoshis(startingBalanceBtc);
  if (startingSatoshis === null) return null;

  let balanceSatoshis = startingSatoshis;
  const chronologicalTransactions = sortSimulatedTransactions(simulatedTransactions)
    .sort((left, right) => (left.createdAt ?? 0) - (right.createdAt ?? 0));

  for (const transaction of chronologicalTransactions) {
    const amountSatoshis = btcToSatoshis(transaction.amountBtc);
    if (amountSatoshis === null || amountSatoshis <= 0n) return null;

    if (transaction.direction === 'out') {
      balanceSatoshis -= amountSatoshis;
    } else {
      balanceSatoshis += amountSatoshis;
    }
  }

  return balanceSatoshis < 0n
    ? -satoshisToBtc(-balanceSatoshis)
    : satoshisToBtc(balanceSatoshis);
}

export type RecordDemoTransactionResult =
  | { wallet: WalletData; recorded: true }
  | { wallet: WalletData; recorded: false; reason: 'duplicate' | 'invalid-transaction' | 'invalid-history' };

export function recordSimulatedTransaction(
  wallet: WalletData,
  transaction: DemoTransaction,
  startingBalanceBtc: number,
  btcUsdPrice: number,
): RecordDemoTransactionResult {
  if (!transaction.id.trim()) {
    return { wallet, recorded: false, reason: 'invalid-transaction' };
  }
  if (wallet.simulatedTransactions.some((existing) => existing.id === transaction.id)) {
    return { wallet, recorded: false, reason: 'duplicate' };
  }

  const simulatedTransactions = sortSimulatedTransactions([
    transaction,
    ...wallet.simulatedTransactions,
  ]);
  const balanceBtc = deriveDemoBalance(startingBalanceBtc, simulatedTransactions);
  if (balanceBtc === null || balanceBtc < 0) {
    return { wallet, recorded: false, reason: 'invalid-history' };
  }

  return {
    wallet: {
      ...wallet,
      simulatedTransactions,
      balanceBtc,
      sampleFiatValue: balanceBtc * btcUsdPrice,
    },
    recorded: true,
  };
}

export function persistDemoWallet(storage: DemoStorage, wallet: WalletData): void {
  storage.setItem(
    DEMO_WALLET_STORAGE_KEY,
    JSON.stringify({
      version: STORAGE_VERSION,
      created: wallet.created,
      settings: wallet.settings,
      simulatedTransactions: sortSimulatedTransactions(wallet.simulatedTransactions),
    }),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeSimulatedTransaction(value: unknown): DemoTransaction | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.id !== 'string' ||
    value.id.trim().length === 0 ||
    typeof value.label !== 'string' ||
    (value.direction !== 'in' && value.direction !== 'out') ||
    typeof value.amountBtc !== 'number' ||
    typeof value.sampleFiatValue !== 'number' ||
    !Number.isFinite(value.sampleFiatValue) ||
    typeof value.date !== 'string' ||
    typeof value.status !== 'string' ||
    typeof value.addressLabel !== 'string'
  ) {
    return null;
  }

  const amountSatoshis = btcToSatoshis(value.amountBtc);
  if (amountSatoshis === null || amountSatoshis <= 0n) return null;

  const legacyTimestamp = /^sim-(\d+)$/.exec(value.id)?.[1];
  const createdAt = typeof value.createdAt === 'number' && Number.isFinite(value.createdAt)
    ? value.createdAt
    : legacyTimestamp
      ? Number(legacyTimestamp)
      : 0;

  return {
    id: value.id,
    label: value.label,
    direction: value.direction,
    amountBtc: value.amountBtc,
    sampleFiatValue: value.sampleFiatValue,
    date: value.date,
    status: value.status,
    addressLabel: value.addressLabel,
    createdAt,
  };
}

function assignUniqueTransactionIds(
  transactions: readonly DemoTransaction[],
  reservedIds: readonly string[],
): DemoTransaction[] {
  const reserved = new Set(reservedIds);
  const originalIds = new Set(transactions.map(({ id }) => id));
  const usedIds = new Set(reservedIds);
  const seenOriginalIds = new Set<string>();

  return transactions.map((transaction) => {
    const originalId = transaction.id;
    const duplicateId = seenOriginalIds.has(originalId);
    seenOriginalIds.add(originalId);
    if (!duplicateId && !reserved.has(originalId)) {
      usedIds.add(originalId);
      return transaction;
    }

    let suffix = 1;
    let id = `${originalId}-history-${suffix}`;
    while (usedIds.has(id) || originalIds.has(id)) {
      suffix += 1;
      id = `${originalId}-history-${suffix}`;
    }
    usedIds.add(id);
    return { ...transaction, id };
  });
}

function mergeSettings(defaults: DemoSettings, value: unknown): DemoSettings {
  if (!isRecord(value)) return defaults;
  return {
    hideBalance: typeof value.hideBalance === 'boolean' ? value.hideBalance : defaults.hideBalance,
    autoLock: typeof value.autoLock === 'boolean' ? value.autoLock : defaults.autoLock,
    confirmationStep: typeof value.confirmationStep === 'boolean'
      ? value.confirmationStep
      : defaults.confirmationStep,
  };
}

export function loadDemoWallet(
  storage: DemoStorage,
  defaults: WalletData,
  sampleTransactionIds: readonly string[],
  btcUsdPrice: number,
): WalletData {
  try {
    const raw = storage.getItem(DEMO_WALLET_STORAGE_KEY);
    if (!raw) return defaults;

    const saved: unknown = JSON.parse(raw);
    if (!isRecord(saved)) return defaults;

    const sampleIds = new Set(sampleTransactionIds);
    const separatedRecords: unknown[] = Array.isArray(saved.simulatedTransactions)
      ? saved.simulatedTransactions
      : [];
    const legacyRecords: unknown[] = Array.isArray(saved.transactions)
      ? saved.transactions.filter(
          (value) => isRecord(value) && typeof value.id === 'string' && !sampleIds.has(value.id),
        )
      : [];
    const transactionRecords = [...separatedRecords, ...legacyRecords];
    const normalizedTransactions = transactionRecords
      .map(normalizeSimulatedTransaction)
      .filter((transaction): transaction is DemoTransaction => transaction !== null);
    const simulatedTransactions = sortSimulatedTransactions(
      assignUniqueTransactionIds(normalizedTransactions, sampleTransactionIds),
    );
    const balanceBtc = deriveDemoBalance(defaults.balanceBtc, simulatedTransactions);
    if (balanceBtc === null) return defaults;

    return {
      ...defaults,
      created: saved.created === true,
      settings: mergeSettings(defaults.settings, saved.settings),
      simulatedTransactions,
      balanceBtc,
      sampleFiatValue: balanceBtc * btcUsdPrice,
    };
  } catch {
    return defaults;
  }
}

export function removeDemoWallet(storage: DemoStorage): void {
  storage.removeItem(DEMO_WALLET_STORAGE_KEY);
}
