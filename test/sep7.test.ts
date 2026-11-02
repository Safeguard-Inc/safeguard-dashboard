import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { generateSep7PaymentUri } from '../src/lib/sep7.ts';

describe('Safeguard Dashboard SEP-0007 URI Tests', () => {
  const DESTINATION = 'GA6LW724VD6PVAG6U3Z3I34D7BOWPO6J7MIJATKGKEC6TYORN4SRCVLT';

  test('generates valid SEP-0007 pay URI for native XLM', () => {
    const uri = generateSep7PaymentUri({
      destination: DESTINATION,
      amount: '50.5',
    });
    assert.ok(uri.startsWith('web+stellar:pay?'));
    assert.ok(uri.includes(`destination=${DESTINATION}`));
    assert.ok(uri.includes('amount=50.5'));
    assert.ok(!uri.includes('asset_code')); // omitted for native XLM
  });

  test('generates valid SEP-0007 URI with custom asset and issuer', () => {
    const uri = generateSep7PaymentUri({
      destination: DESTINATION,
      amount: '100',
      assetCode: 'USDC',
      assetIssuer: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
    });
    assert.ok(uri.includes('asset_code=USDC'));
    assert.ok(
      uri.includes(
        'asset_issuer=GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5'
      )
    );
  });

  test('includes memo and memo_type parameter when specified', () => {
    const uri = generateSep7PaymentUri({
      destination: DESTINATION,
      amount: '25',
      memo: 'invoice-99',
      memoType: 'MEMO_TEXT',
    });
    assert.ok(uri.includes('memo=invoice-99'));
    assert.ok(uri.includes('memo_type=MEMO_TEXT'));
  });

  test('throws error when destination is missing or whitespace', () => {
    assert.throws(() => generateSep7PaymentUri({ destination: '' }), {
      message: 'Destination account is required for SEP-0007 URI',
    });
  });
});
