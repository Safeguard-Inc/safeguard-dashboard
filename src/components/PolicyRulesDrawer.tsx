'use client';

import React from 'react';
import {
  sortRulesByPrecedence,
  getRuleBadgeStyle,
  CANONICAL_POLICY_RULES,
  type PolicyRuleDefinition,
} from '../lib/policyRules';

interface PolicyRulesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  rules?: PolicyRuleDefinition[];
}

export const PolicyRulesDrawer: React.FC<PolicyRulesDrawerProps> = ({
  isOpen,
  onClose,
  rules = CANONICAL_POLICY_RULES,
}) => {
  if (!isOpen) return null;

  const sortedRules = sortRulesByPrecedence(rules);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="policy-drawer-title"
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="w-full max-w-md h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col text-white p-6">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 id="policy-drawer-title" className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span className="p-1 bg-indigo-500/10 text-indigo-400 rounded-md text-xs">🛡️ Rules</span>
              Policy Precedence Inspector
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Soroban sequential evaluation order (fail-closed model)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close drawer"
          >
            ✕
          </button>
        </div>

        {/* Rule List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
          {sortedRules.map((rule) => {
            const badgeStyle = getRuleBadgeStyle(rule.category);
            return (
              <div
                key={rule.id}
                className="p-3.5 bg-slate-800/40 border border-slate-800 hover:border-slate-700/80 rounded-xl transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">
                      #{rule.precedence}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                    >
                      {rule.category}
                    </span>
                  </div>
                  <div>
                    {rule.action === 'BLOCK' && (
                      <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                        BLOCK
                      </span>
                    )}
                    {rule.action === 'FLAG' && (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                        FLAG / ESCROW
                      </span>
                    )}
                    {rule.action === 'ALLOW' && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                        ALLOW
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-100 flex items-center justify-between">
                    {rule.name}
                    <span
                      className={`text-[11px] ${
                        rule.enabled ? 'text-emerald-400 font-medium' : 'text-slate-500'
                      }`}
                    >
                      {rule.enabled ? '● Active' : '○ Inactive'}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {rule.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Drawer Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Contract: SafeguardPolicy</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
