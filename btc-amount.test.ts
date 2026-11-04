import assert from 'node:assert/strict';
import test from 'node:test';
import {
  formatBtcAmount,
  formatSatoshis,
  parseBtcAmountToSatoshis,
  prepareDemoSend,
  prepareDemoSendFromSatoshis,
} from './btc-amount.ts';

test('parses BTC decimals into exact satoshi integers', () => {
  assert.equal(parseBtcAmountToSatoshis('1'), 100_000_000n);
  assert.equal(parseBtcAmountToSatoshis('0.1'), 10_000_000n);
  assert.equal(parseBtcAmountToSatoshis('.00000001'), 1n);
  assert.equal(parseBtcAmountToSatoshis('0.08431000'), 8_431_000n);
  assert.equal(parseBtcAmountToSatoshis(' 0.25 '), 25_000_000n);
});

test('rejects empty, zero, negative, malformed, and sub-satoshi inputs', () => {
  for (const input of ['', '   ', '0', '0.00000000', '-0.1', '+0.1', '1e-8', '0x10', '1,2', 'NaN', 'Infinity', '0.000000001', '.']) {
    assert.equal(prepareDemoSend(input, 0.08431).ok, false, `expected ${JSON.stringify(input)} to be rejected`);
  }
});

test('rejects a send above the available sample balance', () => {
  assert.deepEqual(prepareDemoSend('0.08431001', 0.08431), {
    ok: false,
    reason: 'exceeds-balance',
  });
});

test('accepts the full balance and leaves exactly zero', () => {
  const result = prepareDemoSend('0.08431', 0.08431);
  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.amountSatoshis, 8_431_000n);
  assert.equal(formatBtcAmount(result.amountBtc), '0.08431');
  assert.equal(result.balanceAfterBtc, 0);
});

test('preserves the exact one-satoshi amount through review and balance calculation', () => {
  const result = prepareDemoSend('.00000001', 0.08431);
  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(result.amountSatoshis, 1n);
  assert.equal(formatSatoshis(result.amountSatoshis), '0.00000001');
  assert.equal(formatBtcAmount(result.amountBtc), '0.00000001');
  assert.equal(formatBtcAmount(result.balanceAfterBtc), '0.08430999');
});

test('revalidates the exact reviewed amount against the current balance', () => {
  assert.deepEqual(prepareDemoSendFromSatoshis(8_431_001n, 0.08431), {
    ok: false,
    reason: 'exceeds-balance',
  });
  assert.deepEqual(prepareDemoSendFromSatoshis(0n, 0.08431), {
    ok: false,
    reason: 'invalid-amount',
  });
});

test('does not round an invalid balance into a sendable amount', () => {
  assert.deepEqual(prepareDemoSend('0.01', Number.NaN), {
    ok: false,
    reason: 'invalid-balance',
  });
  assert.deepEqual(prepareDemoSend('0.01', 0.000000001), {
    ok: false,
    reason: 'invalid-balance',
  });
});

test('formats a recovered negative demo balance without losing satoshi precision', () => {
  assert.equal(formatBtcAmount(-0.01569), '-0.01569');
});
