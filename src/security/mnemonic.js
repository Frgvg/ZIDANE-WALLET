import { validateMnemonic as validateBip39 } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';

// Validate an English BIP39 recovery phrase.
export function validateRecoveryPhrase(mnemonic) {
  if (typeof mnemonic !== 'string') {
    return false;
  }

  const normalized = mnemonic
    .normalize('NFKD')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

  const words = normalized.split(' ');

  // Zidane Wallet supports 12-word and 24-word phrases.
  if (words.length !== 12 && words.length !== 24) {
    return false;
  }

  // Check the BIP39 words and checksum.
  return validateBip39(normalized, wordlist);
}