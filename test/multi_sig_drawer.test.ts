import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateProgressPercentage,
  canActiveUserSign,
  formatSigningThresholdBadge,
  type DrawerMultiSigTx,
} from '../src/lib/multiSigDrawer.ts';

describe('MultiSig Signing Drawer Domain Logic Tests', () => {
  const alice = 'GA6LW724VD6PVAG6U3Z3I342OKAQ6CVT5AC4YIN6STMV5Y5REB335AD3';
  const bob = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
  const charlie = 'GC5MCMHHMFV7GOQ7DVN7MOTMHGTMVIP3YFQAAVFZ6WKUE6SLGQBVODW4';

  const mockTx: DrawerMultiSigTx = {
    id: 'tx-msig-1',
    txXdr: 'mock-xdr',
    operationLevel: 'medium',
    currentWeight: 1,
    requiredWeight: 3,
    isReady: false,
    signers: [
      { publicKey: alice, weight: 1, hasSigned: true },
      { publicKey: bob, weight: 2, hasSigned: false },
      { publicKey: charlie, weight: 1, hasSigned: false },
    ],
  };

  test('calculates threshold progress percentage accurately', () => {
    assert.equal(calculateProgressPercentage(1, 3), 33);
    assert.equal(calculateProgressPercentage(3, 3), 100);
    assert.equal(calculateProgressPercentage(4, 3), 100); // capped at 100
    assert.equal(calculateProgressPercentage(0, 3), 0);
  });

  test('determines if active user is an eligible unsigned signer', () => {
    // Alice already signed
    assert.equal(canActiveUserSign(mockTx, alice), false);

    // Bob is an authorized signer who has not yet signed
    assert.equal(canActiveUserSign(mockTx, bob), true);

    // Stranger is not on the signer list
    assert.equal(canActiveUserSign(mockTx, 'GSTRANGER11111111111111111111111111111111111111111'), false);

    // When tx is ready, signing is complete
    assert.equal(canActiveUserSign({ ...mockTx, isReady: true }, bob), false);
  });

  test('formats signing threshold badge correctly based on readiness', () => {
    const pendingBadge = formatSigningThresholdBadge(mockTx);
    assert.match(pendingBadge.label, /1 \/ 3 Weights Collected/);
    assert.match(pendingBadge.bgClass, /amber/);

    const readyBadge = formatSigningThresholdBadge({ ...mockTx, isReady: true, currentWeight: 3 });
    assert.match(readyBadge.label, /Threshold Met/);
    assert.match(readyBadge.bgClass, /emerald/);
  });
});
