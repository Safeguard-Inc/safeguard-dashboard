import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateLedgerLag,
  getLedgerLagDisplay,
} from '../src/lib/ledgerLag.ts';

describe('Ledger Lag Display Domain Tests', () => {
  it('calculates ledger divergence and prevents negative lag numbers', () => {
    assert.equal(calculateLedgerLag(1005, 1000), 5);
    assert.equal(calculateLedgerLag(1000, 1000), 0);
    assert.equal(calculateLedgerLag(1000, 1005), 0); // indexer ahead of poll
  });

  it('assigns synced status for minimal lag (<= 2 ledgers)', () => {
    const s0 = getLedgerLagDisplay(0);
    assert.equal(s0.level, 'synced');
    assert.equal(s0.badgeLabel, 'Consensus Synced');
    assert.equal(s0.lagSeconds, 0);
    assert.ok(s0.bgClass.includes('emerald'));

    const s2 = getLedgerLagDisplay(2);
    assert.equal(s2.level, 'synced');
    assert.equal(s2.lagSeconds, 10);
    assert.ok(s2.badgeLabel.includes('2 ledgers'));
  });

  it('assigns degraded status for moderate lag (3-10 ledgers)', () => {
    const s5 = getLedgerLagDisplay(5);
    assert.equal(s5.level, 'degraded');
    assert.equal(s5.lagSeconds, 25);
    assert.ok(s5.badgeLabel.includes('Catching Up'));
    assert.ok(s5.bgClass.includes('amber'));
  });

  it('assigns desynced status for severe lag (> 10 ledgers)', () => {
    const s15 = getLedgerLagDisplay(15);
    assert.equal(s15.level, 'desynced');
    assert.equal(s15.lagSeconds, 75);
    assert.ok(s15.badgeLabel.includes('Desynced: 15 ledgers'));
    assert.ok(s15.bgClass.includes('rose'));
    assert.ok(s15.dotClass.includes('animate-pulse'));
  });
});
