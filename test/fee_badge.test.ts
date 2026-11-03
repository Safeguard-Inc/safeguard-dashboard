import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { formatFeeDisplay, getFeeBadgeStyle } from '../src/lib/formatters.ts';

describe('Safeguard Dashboard Network Fee Badge Tests', () => {
  test('formatFeeDisplay correctly converts stroops to localized number and XLM string', () => {
    const formatted1 = formatFeeDisplay(19237);
    assert.equal(formatted1.stroops, '19,237');
    assert.equal(formatted1.xlm, '0.0019237 XLM');

    const formatted2 = formatFeeDisplay('739309');
    assert.equal(formatted2.stroops, '739,309');
    assert.equal(formatted2.xlm, '0.0739309 XLM');
  });

  test('getFeeBadgeStyle returns correct styles and labels for transfer types', () => {
    // Normal direct transfer
    const normal = getFeeBadgeStyle(false, 'normal');
    assert.ok(normal.bg.includes('emerald'));
    assert.equal(normal.label, 'Standard Transfer');

    // Priority surge transfer
    const priority = getFeeBadgeStyle(false, 'priority');
    assert.ok(priority.bg.includes('purple'));
    assert.equal(priority.label, 'Priority Surge');

    // Escrow state rent transfer
    const escrow = getFeeBadgeStyle(true, 'normal');
    assert.ok(escrow.bg.includes('amber'));
    assert.equal(escrow.label, 'Escrow State Rent');
  });
});
