import React from 'react';
import { TransactionFilterCriteria } from '../lib/searchFilter';

interface TransactionSearchFilterProps {
  criteria: TransactionFilterCriteria;
  onChange: (criteria: TransactionFilterCriteria) => void;
  availableTokens?: string[];
  totalResults?: number;
}

export const TransactionSearchFilter: React.FC<TransactionSearchFilterProps> = ({
  criteria,
  onChange,
  availableTokens = ['USDC', 'XLM', 'EURC'],
  totalResults,
}) => {
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...criteria, query: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...criteria, status: e.target.value });
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...criteria, token: e.target.value });
  };

  const handleReset = () => {
    onChange({
      query: '',
      status: 'all',
      token: 'all',
      minAmount: undefined,
      maxAmount: undefined,
    });
  };

  const hasActiveFilters = Boolean(
    (criteria.query && criteria.query.trim()) ||
    (criteria.status && criteria.status !== 'all') ||
    (criteria.token && criteria.token !== 'all')
  );

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 mb-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
      <div className="flex-1 relative">
        <input
          type="text"
          value={criteria.query || ''}
          onChange={handleQueryChange}
          placeholder="Filter by tx hash, sender G..., recipient G..., or ID..."
          className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
        {criteria.query && (
          <button
            onClick={() => onChange({ ...criteria, query: '' })}
            className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={criteria.status || 'all'}
          onChange={handleStatusChange}
          className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="disputed">Disputed</option>
          <option value="executed">Executed</option>
          <option value="rejected">Rejected</option>
        </select>

        <select
          value={criteria.token || 'all'}
          onChange={handleTokenChange}
          className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Tokens</option>
          {availableTokens.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            Reset
          </button>
        )}

        {totalResults !== undefined && (
          <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-400 font-mono">
            {totalResults} {totalResults === 1 ? 'result' : 'results'}
          </span>
        )}
      </div>
    </div>
  );
};
