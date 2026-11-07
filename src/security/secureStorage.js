import * as SecureStore from 'expo-secure-store';

const MNEMONIC_KEY = 'zidane_wallet_mnemonic_v1';

// Save a recovery phrase securely on this device.
export async function saveMnemonic(mnemonic) {
  if (typeof mnemonic !== 'string' || !mnemonic.trim()) {
    throw new Error('A valid recovery phrase is required.');
  }

  await SecureStore.setItemAsync(MNEMONIC_KEY, mnemonic.trim());
}

// Read the saved recovery phrase.
export async function getMnemonic() {
  return await SecureStore.getItemAsync(MNEMONIC_KEY);
}

// Delete the saved recovery phrase.
export async function deleteMnemonic() {
  await SecureStore.deleteItemAsync(MNEMONIC_KEY);
}