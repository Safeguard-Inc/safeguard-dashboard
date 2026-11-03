import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatSanctionsStatusBadge,
  isActionableSanction,
  getSanctionsRiskRating,
  type SanctionsScreeningRecord,
} from '../src/lib/sanctionsScreening.ts';

describe('Sanctions Screening Domain Logic Tests', () => {
  test('formats CONFIRMED_MATCH badge with rose styling and critical risk', () => {
    const badge = formatSanctionsStatusBadge('CONFIRMED_MATCH');
    assert.equal(badge.label, 'Confirmed Sanction');
    assert.match(badge.textClass, /rose/);

    const rec: SanctionsScreeningRecord = {
      address: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
      status: 'CONFIRMED_MATCH',
      listId: 'OFAC-SDN',
    };
    assert.equal(isActionableSanction(rec), true);
    assert.equal(getSanctionsRiskRating(rec).rating, 'CRITICAL');
  });

  test('formats FLAGGED badge with amber styling and medium risk', () => {
    const badge = formatSanctionsStatusBadge('FLAGGED');
    assert.equal(badge.label, 'Possible Match');
    assert.match(badge.textClass, /amber/);

    const rec: SanctionsScreeningRecord = {
      address: 'GCEXAMPLEADDRESS11111111111111111111111111111111111111111',
      status: 'FLAGGED',
    };
    assert.equal(isActionableSanction(rec), true);
    assert.equal(getSanctionsRiskRating(rec).rating, 'MEDIUM');
  });

  test('formats CLEAN badge with emerald styling and low risk', () => {
    const badge = formatSanctionsStatusBadge('CLEAN');
    assert.equal(badge.label, 'Clean / Unlisted');
    assert.match(badge.textClass, /emerald/);

    const rec: SanctionsScreeningRecord = {
      address: 'GA6LW724VD6PVAG6U3Z3I342OKAQ6CVT5AC4YIN6STMV5Y5REB335AD3',
      status: 'CLEAN',
    };
    assert.equal(isActionableSanction(rec), false);
    assert.equal(getSanctionsRiskRating(rec).rating, 'LOW');
  });

  test('formats RETIRED badge with slate styling and low risk', () => {
    const badge = formatSanctionsStatusBadge('RETIRED');
    assert.equal(badge.label, 'Sanction Retired');
    assert.match(badge.textClass, /slate/);

    const rec: SanctionsScreeningRecord = {
      address: 'GDYAZQ7E6B23XJTXN2W2K6N3H3Y564L4O5IELJ4LGF6333YXZMND2P4M',
      status: 'RETIRED',
    };
    assert.equal(isActionableSanction(rec), false);
    assert.equal(getSanctionsRiskRating(rec).rating, 'LOW');
  });
});
