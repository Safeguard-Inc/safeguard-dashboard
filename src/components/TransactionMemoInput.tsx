import React from 'react';
import { DashboardMemoType, validateDashboardMemo } from '../lib/memoInput';

interface TransactionMemoInputProps {
  type: DashboardMemoType;
  value: string;
  onTypeChange: (type: DashboardMemoType) => void;
  onValueChange: (value: string) => void;
}

export const TransactionMemoInput: React.FC<TransactionMemoInputProps> = ({
  type,
  value,
  onTypeChange,
  onValueChange,
}) => {
  const validation = validateDashboardMemo(type, value);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-300">
          Stellar Payment Memo (Optional)
        </label>
        {validation.bytesLimit && (
          <span
            className={`text-[11px] font-mono ${
              validation.isValid ? 'text-slate-400' : 'text-rose-400 font-semibold'
            }`}
          >
            {validation.bytesUsed || 0} / {validation.bytesLimit} bytes
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <select
          value={type}
          onChange={(e) => onTypeChange(e.target.value as DashboardMemoType)}
          className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
        >
          <option value="none">No Memo</option>
          <option value="text">MEMO_TEXT</option>
          <option value="id">MEMO_ID</option>
          <option value="hash">MEMO_HASH</option>
          <option value="return">MEMO_RETURN</option>
        </select>

        {type !== 'none' && (
          <div className="relative flex-1">
            <input
              type="text"
              value={value}
              onChange={(e) => onValueChange(e.target.value)}
              placeholder={
                type === 'text'
                  ? 'Invoice #1024 / order ref (max 28 bytes)'
                  : type === 'id'
                  ? 'e.g. 1002345 (unsigned 64-bit int)'
                  : '32-byte hex string (64 characters)'
              }
              className={`w-full bg-slate-950 border rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none font-mono ${
                validation.isValid
                  ? 'border-slate-700 focus:border-blue-500'
                  : 'border-rose-600 focus:border-rose-500'
              }`}
            />
            {value && (
              <button
                type="button"
                onClick={() => onValueChange('')}
                className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>

      {!validation.isValid && validation.error && (
        <p className="text-[11px] text-rose-400 mt-1">{validation.error}</p>
      )}
    </div>
  );
};
