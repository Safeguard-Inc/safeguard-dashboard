import React, { useState } from 'react';
import {
  TokenSpendCapEntry,
  formatCapDisplay,
  validateSpendCapInput,
} from '../lib/tokenSpendCapModal';

interface TokenSpendCapModalProps {
  isOpen: boolean;
  tokens: TokenSpendCapEntry[];
  defaultCapStroops: string;
  onClose: () => void;
  onSaveTokenCap: (contractId: string, capStroops: string) => Promise<void> | void;
  onRemoveTokenCap: (contractId: string) => Promise<void> | void;
  isActionPending?: boolean;
}

export const TokenSpendCapModal: React.FC<TokenSpendCapModalProps> = ({
  isOpen,
  tokens,
  defaultCapStroops,
  onClose,
  onSaveTokenCap,
  onRemoveTokenCap,
  isActionPending,
}) => {
  const [selectedToken, setSelectedToken] = useState<TokenSpendCapEntry | null>(null);
  const [inputVal, setInputVal] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectToken = (token: TokenSpendCapEntry) => {
    setSelectedToken(token);
    if (token.capAmountStroops) {
      const units = Number(BigInt(token.capAmountStroops)) / 10_000_000;
      setInputVal(units.toString());
    } else {
      setInputVal('');
    }
    setValidationError(null);
  };

  const handleSave = async () => {
    if (!selectedToken) return;
    const val = validateSpendCapInput(inputVal);
    if (!val.isValid || !val.stroops) {
      setValidationError(val.error || 'Invalid cap');
      return;
    }
    await onSaveTokenCap(selectedToken.contractId, val.stroops);
    setSelectedToken(null);
  };

  const handleResetToDefault = async (contractId: string) => {
    await onRemoveTokenCap(contractId);
    if (selectedToken?.contractId === contractId) {
      setSelectedToken(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 text-slate-100">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">💰</span>
            <h3 className="text-lg font-semibold text-white">Per-Token Spend Caps</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          Configure individual spend caps for SAC tokens. Any transaction exceeding the asset's cap is routed to Escrow.
        </p>

        <div className="space-y-2 mb-5">
          {tokens.map((t) => {
            const capInfo = formatCapDisplay(t.capAmountStroops, defaultCapStroops);
            const isSelected = selectedToken?.contractId === t.contractId;

            return (
              <div
                key={t.contractId}
                onClick={() => handleSelectToken(t)}
                className={`p-3 rounded-lg border cursor-pointer transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-blue-950/40 border-blue-600'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-white">{t.symbol}</span>
                    {capInfo.isOverride ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-900/50 text-blue-300 border border-blue-700">
                        Custom
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        Global Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{capInfo.text}</p>
                </div>

                <div className="flex items-center gap-2">
                  {t.isCustom && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResetToDefault(t.contractId);
                      }}
                      className="text-xs text-rose-400 hover:underline px-2 py-1"
                    >
                      Reset
                    </button>
                  )}
                  <span className="text-xs text-slate-500">Edit ✎</span>
                </div>
              </div>
            );
          })}
        </div>

        {selectedToken && (
          <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 mb-5">
            <h4 className="text-xs font-semibold text-white mb-2">
              Edit Cap for {selectedToken.symbol}
            </h4>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="e.g. 500 (in token units)"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleSave}
                disabled={isActionPending}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
              >
                Save
              </button>
            </div>
            {validationError && (
              <p className="text-[11px] text-rose-400 mt-1">{validationError}</p>
            )}
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
