export const SATOSHIS_PER_BTC = 100_000_000n;

export type DemoSendFailure = 'invalid-amount' | 'exceeds-balance' | 'invalid-balance';

export type DemoSendPreparation =
  | {
      ok: true;
      amountSatoshis: bigint;
      amountBtc: number;
      balanceAfterBtc: number;
    }
  | {
      ok: false;
      reason: DemoSendFailure;
    };

/**
 * Parse plain BTC decimal input without floating-point arithmetic.
 * Amounts with more than eight decimal places, exponents, signs, and other
 * non-decimal forms are rejected rather than rounded or coerced.
 */
export function parseBtcAmountToSatoshis(value: string): bigint | null {
  const match = /^(?:(\d+)(?:\.(\d{0,8}))?|\.(\d{1,8}))$/.exec(value.trim());
  if (!match) return null;

  const wholeBtc = match[1] ?? '0';
  const fractionalBtc = match[2] ?? match[3] ?? '';
  return (
    BigInt(wholeBtc) * SATOSHIS_PER_BTC +
    BigInt(fractionalBtc.padEnd(8, '0') || '0')
  );
}

export function satoshisToBtc(satoshis: bigint): number {
  if (satoshis < 0n) throw new RangeError('Satoshi amount cannot be negative.');
  return Number(satoshis) / Number(SATOSHIS_PER_BTC);
}

export function btcToSatoshis(amountBtc: number): bigint | null {
  if (!Number.isFinite(amountBtc) || amountBtc < 0) return null;

  const decimal = amountBtc.toFixed(8);
  if (Number(decimal) !== amountBtc) return null;
  return parseBtcAmountToSatoshis(decimal);
}

export function formatSatoshis(satoshis: bigint): string {
  if (satoshis < 0n) throw new RangeError('Satoshi amount cannot be negative.');

  const wholeBtc = satoshis / SATOSHIS_PER_BTC;
  const fractionalSatoshis = (satoshis % SATOSHIS_PER_BTC)
    .toString()
    .padStart(8, '0')
    .replace(/0+$/, '');

  return fractionalSatoshis ? `${wholeBtc}.${fractionalSatoshis}` : wholeBtc.toString();
}

export function formatBtcAmount(amountBtc: number): string {
  const isNegative = amountBtc < 0;
  const satoshis = btcToSatoshis(Math.abs(amountBtc));
  if (satoshis === null) {
    throw new RangeError('BTC amount must be finite and precise to eight decimal places.');
  }
  return `${isNegative ? '-' : ''}${formatSatoshis(satoshis)}`;
}

export function prepareDemoSendFromSatoshis(
  amountSatoshis: bigint,
  availableBalanceBtc: number,
): DemoSendPreparation {
  if (typeof amountSatoshis !== 'bigint' || amountSatoshis <= 0n) {
    return { ok: false, reason: 'invalid-amount' };
  }

  const availableSatoshis = btcToSatoshis(availableBalanceBtc);
  if (availableSatoshis === null) return { ok: false, reason: 'invalid-balance' };
  if (amountSatoshis > availableSatoshis) {
    return { ok: false, reason: 'exceeds-balance' };
  }

  return {
    ok: true,
    amountSatoshis,
    amountBtc: satoshisToBtc(amountSatoshis),
    balanceAfterBtc: satoshisToBtc(availableSatoshis - amountSatoshis),
  };
}

export function prepareDemoSend(
  amountInput: string,
  availableBalanceBtc: number,
): DemoSendPreparation {
  const amountSatoshis = parseBtcAmountToSatoshis(amountInput);
  if (amountSatoshis === null || amountSatoshis <= 0n) {
    return { ok: false, reason: 'invalid-amount' };
  }
  return prepareDemoSendFromSatoshis(amountSatoshis, availableBalanceBtc);
}
