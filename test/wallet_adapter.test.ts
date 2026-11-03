import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { WalletManager, MockWalletProvider } from '../src/lib/walletAdapter.ts';
import type { IStellarWalletProvider, WalletAccount, WalletSignResult } from '../src/lib/walletAdapter.ts';

describe('Stellar Wallet Adapter & Manager Tests', () => {
  it('discovers supported wallets and default availability', async () => {
    const manager = new WalletManager();
    const wallets = await manager.getAvailableWallets();

    assert.equal(wallets.length, 3);
    const freighter = wallets.find((w) => w.id === 'freighter');
    assert.ok(freighter);
    assert.equal(freighter.name, 'Freighter Wallet');
    assert.equal(freighter.isAvailable, true);
    assert.ok(freighter.downloadUrl.includes('freighter.app'));

    const xbull = wallets.find((w) => w.id === 'xbull');
    assert.ok(xbull);
    assert.equal(xbull.name, 'xBull Wallet');

    const albedo = wallets.find((w) => w.id === 'albedo');
    assert.ok(albedo);
    assert.equal(albedo.name, 'Albedo Link');
  });

  it('connects to wallet and tracks active account state', async () => {
    const manager = new WalletManager();
    assert.equal(manager.getActiveWallet(), null);

    const account = await manager.connect('freighter', 'Test SDF Network ; September 2015');
    assert.equal(account.walletType, 'freighter');
    assert.ok(account.publicKey.startsWith('G'));
    assert.equal(manager.getActiveWallet()?.publicKey, account.publicKey);

    // Disconnect clears state
    manager.disconnect();
    assert.equal(manager.getActiveWallet(), null);
  });

  it('allows registering custom wallet providers and signing transactions', async () => {
    const manager = new WalletManager();

    class CustomHardwareWalletProvider implements IStellarWalletProvider {
      public id = 'custom' as const;
      public name = 'Ledger Hardware Signer';

      public async isInstalled(): Promise<boolean> {
        return true;
      }

      public async connect(network = 'Public Global Stellar Network ; September 2015'): Promise<WalletAccount> {
        return {
          publicKey: 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7',
          network,
          walletType: 'custom',
        };
      }

      public async signTransaction(xdr: string): Promise<WalletSignResult> {
        return {
          signedXdr: `${xdr}_ledger_signed`,
          signerAddress: 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7',
        };
      }
    }

    manager.registerProvider(new CustomHardwareWalletProvider());
    const provider = manager.getProvider('custom');
    assert.ok(provider);

    const account = await manager.connect('custom');
    assert.equal(account.walletType, 'custom');
    assert.equal(account.publicKey, 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7');

    const signRes = await provider.signTransaction('AAAA_XDR_PAYLOAD');
    assert.equal(signRes.signedXdr, 'AAAA_XDR_PAYLOAD_ledger_signed');
  });

  it('throws error when connecting to unregistered or unavailable provider', async () => {
    const manager = new WalletManager();
    await assert.rejects(
      async () => {
        await manager.connect('unregistered' as any);
      },
      { message: 'Wallet provider "unregistered" not found' }
    );
  });
});
