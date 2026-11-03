import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseBatchCsvText,
  validateBatchPaymentRow,
} from '../src/lib/batchCsvUpload.ts';

describe('Batch Payment CSV Parsing & Aggregation Tests', () => {
  it('validates individual payment rows according to Stellar rules', () => {
    // Valid Ed25519 account
    const v1 = validateBatchPaymentRow(
      'GA6LW724VD6PVAG6U3Z3I34D7BOWPO6J7MIJATKGKEC6TYORN4SRCVLT',
      '150.5',
      'XLM'
    );
    assert.equal(v1.isValid, true);

    // Invalid non-Stellar address
    const v2 = validateBatchPaymentRow('0x1234567890abcdef', '100', 'USDC');
    assert.equal(v2.isValid, false);
    assert.ok(v2.errorMessage?.includes('Recipient must be a valid Stellar public key'));

    // Non-positive amount
    const v3 = validateBatchPaymentRow(
      'GA6LW724VD6PVAG6U3Z3I34D7BOWPO6J7MIJATKGKEC6TYORN4SRCVLT',
      '-5',
      'XLM'
    );
    assert.equal(v3.isValid, false);
    assert.ok(v3.errorMessage?.includes('Amount must be a positive number'));
  });

  it('parses multi-row CSV, ignores header, and calculates volume', () => {
    const csv = `recipient,amount,token,memo
GA6LW724VD6PVAG6U3Z3I34D7BOWPO6J7MIJATKGKEC6TYORN4SRCVLT,100,XLM,Sept Pay
GC5MCMHHMFV7GOQ7DVN7MOTMHGTMVIP3YFQAAVFZ6WKUE6SLGQBVODW4,250.75,XLM,Bonus
BAD_KEY,50,XLM,Invalid`;

    const { rows, summary } = parseBatchCsvText(csv);

    assert.equal(rows.length, 3);
    assert.equal(summary.totalRows, 3);
    assert.equal(summary.validCount, 2);
    assert.equal(summary.invalidCount, 1);
    assert.equal(summary.totalVolume, 350.75);
    assert.deepEqual(summary.tokens, ['XLM']);

    assert.equal(rows[0].isValid, true);
    assert.equal(rows[0].memo, 'Sept Pay');
    assert.equal(rows[2].isValid, false);
  });

  it('handles empty input gracefully', () => {
    const { rows, summary } = parseBatchCsvText('');
    assert.equal(rows.length, 0);
    assert.equal(summary.totalRows, 0);
    assert.equal(summary.totalVolume, 0);
  });
});
