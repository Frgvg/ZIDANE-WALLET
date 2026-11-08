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
    await expect(saveMnemonic('invalid recovery phrase'))
      .rejects.toThrow('Invalid recovery phrase.');
    expect(setItemAsync).not.toHaveBeenCalled();
  });

  test('prevents overwriting an existing recovery phrase', async () => {
    getItemAsync.mockResolvedValue(validMnemonic);

    await expect(saveMnemonic(validMnemonic))
      .rejects.toThrow('A recovery phrase already exists.');

    expect(setItemAsync).not.toHaveBeenCalled();
  });

  test('handles storage read errors when saving', async () => {
    getItemAsync.mockRejectedValue(new Error('Storage failure'));

    await expect(saveMnemonic(validMnemonic))
      .rejects.toThrow('Unable to save the recovery phrase securely.');
  });

  test('handles storage write errors', async () => {
    setItemAsync.mockRejectedValue(new Error('Storage failure'));

    await expect(saveMnemonic(validMnemonic))
      .rejects.toThrow('Unable to save the recovery phrase securely.');
  });

  test('retrieves the saved recovery phrase', async () => {
    getItemAsync.mockResolvedValue(validMnemonic);

    await expect(getMnemonic()).resolves.toBe(validMnemonic);
  });

  test('handles retrieval errors', async () => {
    getItemAsync.mockRejectedValue(new Error('Storage failure'));

    await expect(getMnemonic())
      .rejects.toThrow('Unable to retrieve the recovery phrase securely.');
  });

  test('returns true when a recovery phrase exists', async () => {
    getItemAsync.mockResolvedValue(validMnemonic);

    await expect(hasMnemonic()).resolves.toBe(true);
  });

  test('returns false when no recovery phrase exists', async () => {
    getItemAsync.mockResolvedValue(null);

    await expect(hasMnemonic()).resolves.toBe(false);
  });

  test('does not mistake storage errors for an empty wallet', async () => {
    getItemAsync.mockRejectedValue(new Error('Storage failure'));

    await expect(hasMnemonic())
      .rejects.toThrow('Unable to retrieve the recovery phrase securely.');
  });

  test('deletes the saved recovery phrase', async () => {
    await deleteMnemonic();

    expect(deleteItemAsync).toHaveBeenCalledWith(
      'zidane_wallet_mnemonic_v1'
    );
  });

  test('handles deletion errors', async () => {
    deleteItemAsync.mockRejectedValue(new Error('Storage failure'));

    await expect(deleteMnemonic())
      .rejects.toThrow('Unable to delete the recovery phrase securely.');
  });
});