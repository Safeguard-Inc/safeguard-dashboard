import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatEscrowsAsCsv,
  formatEscrowsAsJson,
  type EscrowExportItem,
} from '../src/lib/escrowExport.ts';

describe('Safeguard Dashboard Escrow Export Tests', () => {
  const sampleItems: EscrowExportItem[] = [
    {
      id: 'escrow-1',
      escrowIndex: 1,
      amount: '150',
      token: 'XLM',
      sender: 'GC5MCMHHMFV7GOQ7DVN7MOTMHGTMVIP3YFQAAVFZ6WKUE6SLGQBVODW4',
      recipient: 'GA6LW724VD6PVAG6U3Z3I34D7BOWPO6J7MIJATKGKEC6TYORN4SRCVLT',
      expiresAt: 1728259200,
      status: 'Pending',
    },
    {
      id: 'escrow-2',
      escrowIndex: 2,
      amount: '500',
      token: 'USDC',
      sender: 'GC5MCMHHMFV7GOQ7DVN7MOTMHGTMVIP3YFQAAVFZ6WKUE6SLGQBVODW4',
      recipient: 'GBZXN7ZSOAC37STEQA5Z2C64JGG7R3V5TKL2AWQKL4R5GY6W6M8A9KJL',
      expiresAt: 1728345600,
      status: 'Released',
    },
  ];

  test('formatEscrowsAsCsv produces formatted CSV with headers and records', () => {
    const csv = formatEscrowsAsCsv(sampleItems);
    const lines = csv.split('\n');
    assert.strictEqual(lines.length, 3);
    assert.strictEqual(
      lines[0],
      'id,escrowIndex,amount,token,sender,recipient,expiresAt,status'
    );
    assert.ok(lines[1].includes('escrow-1,1,150,XLM'));
    assert.ok(lines[2].includes('escrow-2,2,500,USDC'));
  });

  test('formatEscrowsAsJson produces parseable JSON array', () => {
    const jsonStr = formatEscrowsAsJson(sampleItems);
    const parsed = JSON.parse(jsonStr);
    assert.ok(Array.isArray(parsed));
    assert.strictEqual(parsed.length, 2);
    assert.strictEqual(parsed[0].id, 'escrow-1');
    assert.strictEqual(parsed[1].status, 'Released');
  });
});

