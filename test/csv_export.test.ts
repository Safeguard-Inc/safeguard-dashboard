import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  escapeCsvField,
  formatItemsAsCsv,
  generateCsvFilename,
} from '../src/lib/csvExport.ts';
import type { CsvColumn } from '../src/lib/csvExport.ts';

describe('Client-Side CSV Export Utility Tests', () => {
  it('escapes fields with commas, double quotes, and line breaks', () => {
    assert.equal(escapeCsvField('hello'), 'hello');
    assert.equal(escapeCsvField('hello, world'), '"hello, world"');
    assert.equal(escapeCsvField('quote "test" here'), '"quote ""test"" here"');
    assert.equal(escapeCsvField('line\nbreak'), '"line\nbreak"');
    assert.equal(escapeCsvField(null), '');
    assert.equal(escapeCsvField(undefined), '');
    assert.equal(escapeCsvField(12345), '12345');
  });

  it('formats arbitrary objects into standard CSV table with headers', () => {
    interface TxItem {
      id: string;
      recipient: string;
      amount: number;
      token: string;
      notes: string;
    }

    const items: TxItem[] = [
      {
        id: 'tx-1',
        recipient: 'GA6LW724VD6PVAG6U3Z3I34D7BOWPO6J7MIJATKGKEC6TYORN4SRCVLT',
        amount: 150.5,
        token: 'XLM',
        notes: 'Monthly payroll, employee #1',
      },
      {
        id: 'tx-2',
        recipient: 'GC5MCMHHMFV7GOQ7DVN7MOTMHGTMVIP3YFQAAVFZ6WKUE6SLGQBVODW4',
        amount: 200,
        token: 'USDC',
        notes: 'Bonus payment "Q3"',
      },
    ];

    const columns: CsvColumn<TxItem>[] = [
      { header: 'ID', accessor: 'id' },
      { header: 'Recipient', accessor: 'recipient' },
      { header: 'Amount', accessor: (item) => `${item.amount} ${item.token}` },
      { header: 'Notes', accessor: 'notes' },
    ];

    const csv = formatItemsAsCsv(items, columns);
    const lines = csv.split('\n');

    assert.equal(lines.length, 3);
    assert.equal(lines[0], 'ID,Recipient,Amount,Notes');
    assert.ok(lines[1].includes('"Monthly payroll, employee #1"'));
    assert.ok(lines[1].includes('150.5 XLM'));
    assert.ok(lines[2].includes('"Bonus payment ""Q3"""'));
  });

  it('generates unique filename with timestamp and prefix', () => {
    const filename = generateCsvFilename('safeguard-transactions');
    assert.ok(filename.startsWith('safeguard-transactions-'));
    assert.ok(filename.endsWith('.csv'));
  });
});
