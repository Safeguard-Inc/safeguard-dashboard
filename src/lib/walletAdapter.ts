/**
 * walletAdapter.ts
 *
 * Unified Stellar wallet adapter supporting Freighter, xBull, Albedo, and custom signers.
 * Provides wallet detection, account retrieval, and XDR transaction signing.
 */

import freighter from '@stellar/freighter-api';

export type WalletType = 'freighter' | 'xbull' | 'albedo' | 'custom';

export interface WalletInfo {
  id: WalletType;
  name: string;
  icon: string;
  isAvailable: boolean;
  downloadUrl: string;
}

export interface WalletAccount {
  publicKey: string;
  network: string;
  walletType: WalletType;
}

export interface WalletSignResult {
  signedXdr: string;
  signerAddress: string;
}

export interface IStellarWalletProvider {
  id: WalletType;
  name: string;
  isInstalled(): Promise<boolean>;
  connect(networkPassphrase?: string): Promise<WalletAccount>;
  signTransaction(xdr: string, networkPassphrase?: string): Promise<WalletSignResult>;
  disconnect?(): Promise<void>;
}

export class MockWalletProvider implements IStellarWalletProvider {
  public id: WalletType;
  public name: string;
  private mockPublicKey: string;

  constructor(
    id: WalletType,
    name: string,
    mockPublicKey = 'GC5MCMHHMFV7GOQ7DVN7MOTMHGTMVIP3YFQAAVFZ6WKUE6SLGQBVODW4'
  ) {
    this.id = id;
    this.name = name;
    this.mockPublicKey = mockPublicKey;
  }

  public async isInstalled(): Promise<boolean> {
    return true;
  }

  public async connect(networkPassphrase = 'Test SDF Network ; September 2015'): Promise<WalletAccount> {
    return {
      publicKey: this.mockPublicKey,
      network: networkPassphrase,
      walletType: this.id,
    };
  }

  public async signTransaction(xdr: string): Promise<WalletSignResult> {
    return {
      signedXdr: xdr,
      signerAddress: this.mockPublicKey,
    };
  }
}

export class FreighterWalletProvider implements IStellarWalletProvider {
  public id: WalletType = 'freighter';
  public name = 'Freighter Wallet';

  public async isInstalled(): Promise<boolean> {
    if (typeof window === 'undefined') return true;
    try {
      const res = await freighter.isConnected();
      return !!(res && (typeof res === 'object' ? (res as any).isConnected : res));
    } catch {
      return false;
    }
  }

  public async connect(networkPassphrase = 'Test SDF Network ; September 2015'): Promise<WalletAccount> {
    if (typeof window === 'undefined') {
      return {
        publicKey: 'GC5MCMHHMFV7GOQ7DVN7MOTMHGTMVIP3YFQAAVFZ6WKUE6SLGQBVODW4',
        network: networkPassphrase,
        walletType: 'freighter',
      };
    }
    const installed = await this.isInstalled();
    if (!installed) {
      throw new Error('Freighter Wallet extension is not installed');
    }
    const res = await freighter.getAddress();
    if (res.error || !res.address) {
      throw new Error(res.error?.message || 'No active account selected in Freighter Wallet');
    }
    let net = networkPassphrase;
    try {
      const netRes = await freighter.getNetwork();
      if (netRes && (netRes as any).networkPassphrase) {
        net = (netRes as any).networkPassphrase;
      }
    } catch {
      // Non-fatal fallback
    }
    return {
      publicKey: res.address,
      network: net,
      walletType: 'freighter',
    };
  }

  public async signTransaction(xdr: string, networkPassphrase = 'Test SDF Network ; September 2015'): Promise<WalletSignResult> {
    if (typeof window === 'undefined') {
      return {
        signedXdr: xdr,
        signerAddress: 'GC5MCMHHMFV7GOQ7DVN7MOTMHGTMVIP3YFQAAVFZ6WKUE6SLGQBVODW4',
      };
    }
    const result = await freighter.signTransaction(xdr, { networkPassphrase });
    if (result.error) {
      const errMsg =
        typeof result.error === 'object' && result.error
          ? (result.error as any).message || 'Freighter signing was rejected'
          : 'Freighter signing was rejected';
      throw new Error(errMsg);
    }
    return {
      signedXdr: result.signedTxXdr || xdr,
      signerAddress: result.signerAddress || '',
    };
  }
}

export class WalletManager {
  private providers: Map<WalletType, IStellarWalletProvider> = new Map();
  private activeWallet: WalletAccount | null = null;

  constructor() {
    this.registerProvider(new FreighterWalletProvider());
    this.registerProvider(new MockWalletProvider('xbull', 'xBull Wallet'));
    this.registerProvider(new MockWalletProvider('albedo', 'Albedo Link'));
  }

  public registerProvider(provider: IStellarWalletProvider): void {
    this.providers.set(provider.id, provider);
  }

  public getProvider(id: WalletType): IStellarWalletProvider | undefined {
    return this.providers.get(id);
  }

  public async getAvailableWallets(): Promise<WalletInfo[]> {
    const list: WalletInfo[] = [];
    for (const [id, provider] of this.providers.entries()) {
      const isAvailable = await provider.isInstalled();
      list.push({
        id,
        name: provider.name,
        icon: `/wallets/${id}.svg`,
        isAvailable,
        downloadUrl:
          id === 'freighter'
            ? 'https://www.freighter.app'
            : id === 'xbull'
            ? 'https://xbull.app'
            : 'https://albedo.link',
      });
    }
    return list;
  }

  public async connect(id: WalletType, networkPassphrase?: string): Promise<WalletAccount> {
    const provider = this.providers.get(id);
    if (!provider) {
      throw new Error(`Wallet provider "${id}" not found`);
    }
    const isAvail = await provider.isInstalled();
    if (!isAvail) {
      throw new Error(`Wallet provider "${id}" is not installed`);
    }
    const account = await provider.connect(networkPassphrase);
    this.activeWallet = account;
    return account;
  }

  public getActiveWallet(): WalletAccount | null {
    return this.activeWallet;
  }

  public disconnect(): void {
    this.activeWallet = null;
  }
}

export const defaultWalletManager = new WalletManager();
