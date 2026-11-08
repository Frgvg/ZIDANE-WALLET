import * as SecureStore from 'expo-secure-store';
import { validateRecoveryPhrase } from './mnemonic';

const MNEMONIC_KEY = 'zidane_wallet_mnemonic_v1';

// Save a valid recovery phrase securely.
export async function saveMnemonic(mnemonic) {
  if (typeof mnemonic !== 'string') {
    throw new Error('A valid recovery phrase is required.');
  }

  const normalizedMnemonic = mnemonic
    .normalize('NFKD')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

  if (!validateRecoveryPhrase(normalizedMnemonic)) {
    throw new Error('Invalid recovery phrase.');
  }

  try {
    const existingMnemonic =
      await SecureStore.getItemAsync(MNEMONIC_KEY);

    if (existingMnemonic) {
      throw new Error('A recovery phrase already exists.');
    }

    await SecureStore.setItemAsync(
      MNEMONIC_KEY,
      normalizedMnemonic
    );
  } catch (error) {
    if (error.message === 'A recovery phrase already exists.') {
      throw error;
    }

    throw new Error('Unable to save the recovery phrase securely.');
  }
}

// Read the saved recovery phrase.
export async function getMnemonic() {
  try {
    return await SecureStore.getItemAsync(MNEMONIC_KEY);
  } catch {
    throw new Error('Unable to retrieve the recovery phrase securely.');
  }
}

// Check whether a recovery phrase exists.
export async function hasMnemonic() {
  const mnemonic = await getMnemonic();
  return Boolean(mnemonic);
}

// Delete the saved recovery phrase.
export async function deleteMnemonic() {
  try {
    await SecureStore.deleteItemAsync(MNEMONIC_KEY);
  } catch {
    throw new Error('Unable to delete the recovery phrase securely.');
  }
}