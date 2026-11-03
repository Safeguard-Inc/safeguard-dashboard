import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CANONICAL_POLICY_RULES,
  sortRulesByPrecedence,
  getRuleBadgeStyle,
  type PolicyRuleDefinition,
} from '../src/lib/policyRules.ts';

describe('Safeguard Dashboard Policy Rule Precedence Tests', () => {
  it('canonical policy rules have strictly increasing precedence from 1 to 6', () => {
    assert.equal(CANONICAL_POLICY_RULES.length, 6);
    for (let i = 0; i < CANONICAL_POLICY_RULES.length; i++) {
      assert.equal(CANONICAL_POLICY_RULES[i].precedence, i + 1);
    }

    assert.equal(CANONICAL_POLICY_RULES[0].category, 'SANCTIONS');
    assert.equal(CANONICAL_POLICY_RULES[1].category, 'ACCOUNT_STATUS');
    assert.equal(CANONICAL_POLICY_RULES[2].category, 'DENYLIST');
    assert.equal(CANONICAL_POLICY_RULES[3].category, 'SPEND_CAP');
    assert.equal(CANONICAL_POLICY_RULES[4].category, 'JURISDICTION');
    assert.equal(CANONICAL_POLICY_RULES[5].category, 'ALLOWLIST');
  });

  it('sortRulesByPrecedence correctly orders arbitrary disordered rules', () => {
    const unordered: PolicyRuleDefinition[] = [
      {
        id: 'r4',
        category: 'SPEND_CAP',
        name: 'Spend Cap',
        description: '',
        precedence: 4,
        action: 'FLAG',
        enabled: true,
      },
      {
        id: 'r1',
        category: 'SANCTIONS',
        name: 'Sanctions',
        description: '',
        precedence: 1,
        action: 'BLOCK',
        enabled: true,
      },
      {
        id: 'r3',
        category: 'DENYLIST',
        name: 'Denylist',
        description: '',
        precedence: 3,
        action: 'BLOCK',
        enabled: true,
      },
    ];

    const sorted = sortRulesByPrecedence(unordered);
    assert.deepEqual(
      sorted.map((r) => r.precedence),
      [1, 3, 4]
    );
    assert.deepEqual(
      sorted.map((r) => r.category),
      ['SANCTIONS', 'DENYLIST', 'SPEND_CAP']
    );
  });

  it('getRuleBadgeStyle returns styling with bg, text, and border for every category', () => {
    const categories = [
      'SANCTIONS',
      'ACCOUNT_STATUS',
      'DENYLIST',
      'SPEND_CAP',
      'JURISDICTION',
      'ALLOWLIST',
    ] as const;

    for (const cat of categories) {
      const style = getRuleBadgeStyle(cat);
      assert.ok(style.bg.startsWith('bg-'));
      assert.ok(style.text.startsWith('text-'));
      assert.ok(style.border.startsWith('border-'));
    }
  });
});
