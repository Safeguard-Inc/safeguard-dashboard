import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateDisbursementAddress,
  calculateDisbursementPlan,
  type DisbursementItem,
} from '../src/lib/disbursementEngineCard.ts';

test('validateDisbursementAddress correctly checks Stellar public keys', () => {
  const validKey = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
  assert.equal(validateDisbursementAddress(validKey), true);

  assert.equal(validateDisbursementAddress(''), false);
  assert.equal(validateDisbursementAddress('invalid_address'), false);
  assert.equal(validateDisbursementAddress('SBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5'), false); // secret key
  assert.equal(validateDisbursementAddress('GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFL'), false); // too short
});

test('calculateDisbursementPlan computes volume, chunks, and fees properly', () => {
  const items: DisbursementItem[] = [
    { recipient: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5', amount: '100.50', asset: 'USDC' },
    { recipient: 'GCKFJVO4U56WSCUD477755D66FNY375P3TUQZ4I6222N4GDFV6VTR27P', amount: '200.50', asset: 'USDC' },
    { recipient: 'GDRQ3HCSOULH6G6WWRD7B6J3F2WDFCGK3K2C3A7A645UETU3C7C6PQW7', amount: '300.00', asset: 'USDC' },
  ];

  // Chunk size 2 => 2 chunks
  const plan = calculateDisbursementPlan(items, 2);
  assert.equal(plan.totalCount, 3);
  assert.equal(plan.validCount, 3);
  assert.equal(plan.invalidCount, 0);
  assert.equal(plan.totalVolume, 601.00);
  assert.equal(plan.chunkCount, 2);
  assert.equal(plan.estimatedFeeXlm, '0.0020'); // 2 * 10000 / 10000000
});

test('calculateDisbursementPlan handles invalid addresses and empty list', () => {
  const emptyPlan = calculateDisbursementPlan([]);
  assert.equal(emptyPlan.totalCount, 0);
  assert.equal(emptyPlan.validCount, 0);
  assert.equal(emptyPlan.totalVolume, 0);
  assert.equal(emptyPlan.chunkCount, 0);

  const mixedItems: DisbursementItem[] = [
    { recipient: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5', amount: '50.00', asset: 'USDC' },
    { recipient: 'bad_address_format', amount: '25.00', asset: 'USDC' },
  ];

  const mixedPlan = calculateDisbursementPlan(mixedItems, 5);
  assert.equal(mixedPlan.totalCount, 2);
  assert.equal(mixedPlan.validCount, 1);
  assert.equal(mixedPlan.invalidCount, 1);
  assert.equal(mixedPlan.totalVolume, 75.00);
  assert.equal(mixedPlan.chunkCount, 1);
});
