import * as SecureStore from 'expo-secure-store';

const MNEMONIC_KEY = 'zidane_wallet_mnemonic_v1';

// Save the recovery phrase securely on this device.
export async function saveMnemonic(mnemonic) {
  if (typeof mnemonic !== 'string' || !mnemonic.trim()) {
    throw new Error('A valid recovery phrase is required.');
  }

  const existingMnemonic = await SecureStore.getItemAsync(MNEMONIC_KEY);

  if (existingMnemonic) {
    throw new Error(
      'A recovery phrase already exists. Delete it before saving another one.'
    );
  }

  await SecureStore.setItemAsync(MNEMONIC_KEY, mnemonic.trim());
}

// Read the saved recovery phrase.
export async function getMnemonic() {
  return await SecureStore.getItemAsync(MNEMONIC_KEY);
}

// Check whether a recovery phrase is saved.
export async function hasMnemonic() {
  const mnemonic = await SecureStore.getItemAsync(MNEMONIC_KEY);
  return Boolean(mnemonic);
}

// Delete the saved recovery phrase.
export async function deleteMnemonic() {
  await SecureStore.deleteItemAsync(MNEMONIC_KEY);
}