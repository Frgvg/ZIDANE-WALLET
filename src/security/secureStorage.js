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

  const existingMnemonic =
    await SecureStore.getItemAsync(MNEMONIC_KEY);

  if (existingMnemonic) {
    throw new Error('A recovery phrase already exists.');
  }

  await SecureStore.setItemAsync(
    MNEMONIC_KEY,
    normalizedMnemonic
  );
}

// Read the saved recovery phrase.
export async function getMnemonic() {
  return await SecureStore.getItemAsync(MNEMONIC_KEY);
}

// Check whether a recovery phrase exists.
export async function hasMnemonic() {
  const mnemonic = await SecureStore.getItemAsync(MNEMONIC_KEY);
  return Boolean(mnemonic);
}

// Delete the saved recovery phrase.
export async function deleteMnemonic() {
  await SecureStore.deleteItemAsync(MNEMONIC_KEY);
}