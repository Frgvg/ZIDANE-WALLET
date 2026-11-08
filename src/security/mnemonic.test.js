import { describe, expect, test } from 'vitest';
import { validateRecoveryPhrase } from './mnemonic';

describe('Zidane Wallet recovery phrase validation', () => {
  const valid12Words = Array(11).fill('abandon').concat('about').join(' ');

  const valid24Words = Array(23).fill('abandon').concat('art').join(' ');

  test('accepts a valid 12-word recovery phrase', () => {
    expect(validateRecoveryPhrase(valid12Words)).toBe(true);
  });

  test('accepts a valid 24-word recovery phrase', () => {
    expect(validateRecoveryPhrase(valid24Words)).toBe(true);
  });

  test('rejects an invalid checksum', () => {
    const invalidPhrase = Array(12).fill('abandon').join(' ');
    expect(validateRecoveryPhrase(invalidPhrase)).toBe(false);
  });

  test('rejects a phrase with the wrong number of words', () => {
    expect(validateRecoveryPhrase('abandon about')).toBe(false);
  });

  test('rejects words outside the BIP39 English list', () => {
    const invalidPhrase = Array(11).fill('notaword').concat('about').join(' ');
    expect(validateRecoveryPhrase(invalidPhrase)).toBe(false);
  });

  test('rejects non-string input', () => {
    expect(validateRecoveryPhrase(null)).toBe(false);
    expect(validateRecoveryPhrase(123)).toBe(false);
  });
});