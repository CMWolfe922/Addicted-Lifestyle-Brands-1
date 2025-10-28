import * as bip39 from "bip39";
import * as rippleKeypairs from "ripple-keypairs";
import CryptoJS from "crypto-js";

export interface GeneratedWallet {
  xrpAddress: string;
  seedPhrase: string;
  encryptedSeedPhrase: string;
}

export class WalletService {
  private static readonly ENCRYPTION_KEY = process.env.WALLET_ENCRYPTION_KEY || "default-development-key-change-in-production";

  static generateWallet(): GeneratedWallet {
    // Generate 24-word BIP39 mnemonic for user-friendly backup
    const mnemonic = bip39.generateMnemonic(256);
    
    // Generate XRP wallet using ripple-keypairs with entropy from BIP39 seed
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const entropy = seed.slice(0, 16); // Use first 16 bytes as entropy
    
    // Generate XRP seed and derive keypair
    const xrpSeed = rippleKeypairs.generateSeed({ entropy: entropy });
    const keypair = rippleKeypairs.deriveKeypair(xrpSeed);
    const xrpAddress = rippleKeypairs.deriveAddress(keypair.publicKey);
    
    const encryptedSeedPhrase = this.encryptSeedPhrase(mnemonic);

    return {
      xrpAddress,
      seedPhrase: mnemonic,
      encryptedSeedPhrase,
    };
  }

  static encryptSeedPhrase(seedPhrase: string): string {
    return CryptoJS.AES.encrypt(seedPhrase, this.ENCRYPTION_KEY).toString();
  }

  static decryptSeedPhrase(encryptedSeedPhrase: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedSeedPhrase, this.ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  static validateSeedPhrase(seedPhrase: string): boolean {
    return bip39.validateMnemonic(seedPhrase);
  }

  static recoverWallet(seedPhrase: string): { xrpAddress: string } | null {
    if (!this.validateSeedPhrase(seedPhrase)) {
      return null;
    }

    try {
      const seed = bip39.mnemonicToSeedSync(seedPhrase);
      const seedHex = seed.toString("hex").slice(0, 32);
      const keypair = rippleKeypairs.deriveKeypair(seedHex);
      const xrpAddress = rippleKeypairs.deriveAddress(keypair.publicKey);

      return { xrpAddress };
    } catch (error) {
      return null;
    }
  }
}
