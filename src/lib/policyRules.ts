/**
 * policyRules.ts
 *
 * Safeguard on-chain policy rule hierarchy, precedence ordering,
 * and badge styling utilities.
 */

export type RuleCategory =
  | 'SANCTIONS'
  | 'ACCOUNT_STATUS'
  | 'DENYLIST'
  | 'SPEND_CAP'
  | 'JURISDICTION'
  | 'ALLOWLIST';

export interface PolicyRuleDefinition {
  id: string;
  category: RuleCategory;
  name: string;
  description: string;
  precedence: number;
  action: 'BLOCK' | 'FLAG' | 'ALLOW';
  enabled: boolean;
}

export const CANONICAL_POLICY_RULES: PolicyRuleDefinition[] = [
  {
    id: 'rule-sanctions',
    category: 'SANCTIONS',
    name: 'Sanctions List Check',
    description: 'Autonomous evaluation against on-chain OFAC and multilateral sanctions registry',
    precedence: 1,
    action: 'BLOCK',
    enabled: true,
  },
  {
    id: 'rule-status',
    category: 'ACCOUNT_STATUS',
    name: 'Account Freeze Guard',
    description: 'Enforces frozen account flags and inactive lifecycle states before token transfer',
    precedence: 2,
    action: 'BLOCK',
    enabled: true,
  },
  {
    id: 'rule-denylist',
    category: 'DENYLIST',
    name: 'Entity Denylist Verification',
    description: 'Pre-flight screening against prohibited sender and recipient addresses',
    precedence: 3,
    action: 'BLOCK',
    enabled: true,
  },
  {
    id: 'rule-spend-cap',
    category: 'SPEND_CAP',
    name: 'Velocity & Spend Cap Threshold',
    description: 'Routes high-value payments exceeding the single-tx spend limit into timelocked escrow',
    precedence: 4,
    action: 'FLAG',
    enabled: true,
  },
  {
    id: 'rule-jurisdiction',
    category: 'JURISDICTION',
    name: 'Jurisdiction Compliance Guard',
    description: 'Validates cross-border settlement permissions between sender and recipient jurisdictions',
    precedence: 5,
    action: 'BLOCK',
    enabled: true,
  },
  {
    id: 'rule-allowlist',
    category: 'ALLOWLIST',
    name: 'Verified Counterparty Allowlist',
    description: 'Fast-track bypass for accredited institutional counterparties and partner wallets',
    precedence: 6,
    action: 'ALLOW',
    enabled: false,
  },
];

export function sortRulesByPrecedence(rules: PolicyRuleDefinition[]): PolicyRuleDefinition[] {
  return [...rules].sort((a, b) => a.precedence - b.precedence);
}

export function getRuleBadgeStyle(category: RuleCategory): {
  bg: string;
  text: string;
  border: string;
} {
  switch (category) {
    case 'SANCTIONS':
      return { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' };
    case 'ACCOUNT_STATUS':
      return { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' };
    case 'DENYLIST':
      return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' };
    case 'SPEND_CAP':
      return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' };
    case 'JURISDICTION':
      return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' };
    case 'ALLOWLIST':
      return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' };
  }
}
