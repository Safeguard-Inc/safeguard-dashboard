import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  abbreviateAddress,
  formatStroopsToXlm,
  formatLedgerTimestamp,
} from '../src/lib/formatters.ts';

describe('Safeguard Dashboard Formatter & Token Card Tests', () => {
  test('abbreviateAddress correctly shortens 56-character Stellar addresses and contract IDs', () => {
    const contractId = 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC';
    const abbreviated = abbreviateAddress(contractId, 6);

    assert.equal(abbreviated, 'CDLZFC...HGCYSC');
    assert.equal(abbreviated.length, 15);
  });

  test('abbreviateAddress preserves short strings smaller than twice chars limit', () => {
    assert.equal(abbreviateAddress('ABCDEF', 4), 'ABCDEF');
    assert.equal(abbreviateAddress('', 4), '');
  });

  test('abbreviateAddress defaults to 4 characters prefix and suffix', () => {
    const account = 'GC5MCMHHMFV7GOQ7DVN7MOTMHGTMVIP3YFQAAVFZ6WKUE6SLGQBVODW4';
    const abbreviated = abbreviateAddress(account);

    assert.equal(abbreviated, 'GC5M...ODW4');
  });

  test('formatStroopsToXlm converts bigint stroops to readable decimal XLM format', () => {
    assert.equal(formatStroopsToXlm(10000000n), '1 XLM');
    assert.equal(formatStroopsToXlm(50500000n), '5.05 XLM');
    assert.equal(formatStroopsToXlm('123456789'), '12.3456789 XLM');
  });

  test('formatLedgerTimestamp produces ISO format timestamp string', () => {
    const ts = 1700000000;
    const formatted = formatLedgerTimestamp(ts);
    assert.ok(formatted.includes('2023-11-14'));
  });
});
