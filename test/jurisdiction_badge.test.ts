import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getJurisdictionDisplay,
  formatJurisdictionTooltip,
} from '../src/lib/jurisdictionDisplay.ts';

describe('Jurisdiction Display Formatting Tests', () => {
  it('formats standard compliant jurisdiction with country flag and alpha code', () => {
    const us = getJurisdictionDisplay(840);
    assert.equal(us.alpha2, 'US');
    assert.equal(us.flag, '🇺🇸');
    assert.equal(us.badgeLabel, '🇺🇸 US');
    assert.equal(us.isHighRisk, false);
    assert.ok(us.bgClass.includes('emerald'));

    const tooltip = formatJurisdictionTooltip(840);
    assert.equal(tooltip, '🇺🇸 United States [ISO 3166-1: 840]');
  });

  it('marks high-risk or sanctioned jurisdiction with rose warning styling', () => {
    const kp = getJurisdictionDisplay(408);
    assert.equal(kp.alpha2, 'KP');
    assert.equal(kp.isHighRisk, true);
    assert.ok(kp.badgeLabel.includes('High Risk'));
    assert.ok(kp.bgClass.includes('rose'));
  });

  it('provides safe fallback for unknown jurisdiction codes', () => {
    const fallback = getJurisdictionDisplay(999);
    assert.equal(fallback.alpha2, '??');
    assert.equal(fallback.badgeLabel, 'Jurisdiction #999');
    assert.ok(fallback.bgClass.includes('slate'));
  });
});
