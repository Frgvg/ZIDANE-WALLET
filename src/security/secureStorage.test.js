import { describe, expect, test, vi, beforeEach } from 'vitest';

const { getItemAsync, setItemAsync, deleteItemAsync } = vi.hoisted(() => ({
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
  deleteItemAsync: vi.fn(),
}));

vi.mock('expo-secure-store', () => ({
  getItemAsync,
  setItemAsync,
  deleteItemAsync,
}));

import {
  saveMnemonic,
  getMnemonic,
  hasMnemonic,
  deleteMnemonic,
} from './secureStorage';

describe('Zidane Wallet secure storage', () => {
  const validMnemonic =
    'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';

  beforeEach(() => {
    vi.clearAllMocks();
    getItemAsync.mockResolvedValue(null);
    setItemAsync.mockResolvedValue(undefined);
    deleteItemAsync.mockResolvedValue(undefined);
  });

  test('saves a valid recovery phrase', async () => {
    await saveMnemonic(validMnemonic);

    expect(setItemAsync).toHaveBeenCalledWith(
      'zidane_wallet_mnemonic_v1',
      validMnemonic
    );
  });

  test('rejects an invalid recovery phrase', async () => {
    await expect(
      saveMnemonic('invalid recovery phrase')
    ).rejects.toThrow('Invalid recovery phrase.');

    expect(setItemAsync).not.toHaveBeenCalled();
  });

  test('rejects saving when a recovery phrase already exists', async () => {
    getItemAsync.mockResolvedValue(validMnemonic);

    await expect(
      saveMnemonic(validMnemonic)
    ).rejects.toThrow('A recovery phrase already exists.');

    expect(setItemAsync).not.toHaveBeenCalled();
  });

  test('retrieves the saved recovery phrase', async () => {
    getItemAsync.mockResolvedValue(validMnemonic);

    await expect(getMnemonic()).resolves.toBe(validMnemonic);
  });

  test('returns true when a recovery phrase exists', async () => {
    getItemAsync.mockResolvedValue(validMnemonic);

    await expect(hasMnemonic()).resolves.toBe(true);
  });

  test('returns false when no recovery phrase exists', async () => {
    getItemAsync.mockResolvedValue(null);

    await expect(hasMnemonic()).resolves.toBe(false);
  });

  test('deletes the saved recovery phrase', async () => {
    await deleteMnemonic();

    expect(deleteItemAsync).toHaveBeenCalledWith(
      'zidane_wallet_mnemonic_v1'
    );
  });
});
