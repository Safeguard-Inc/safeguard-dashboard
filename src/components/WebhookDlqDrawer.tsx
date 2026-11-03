import React, { useState, useMemo } from 'react';
import {
  DeadLetterItem,
  formatRelativeFailureTime,
  classifyErrorSeverity,
  filterDlqItems,
} from '../lib/webhookDlqDisplay';

interface WebhookDlqDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: DeadLetterItem[];
  onReplayAll: () => Promise<void> | void;
  onClearAll: () => Promise<void> | void;
  isActionPending?: boolean;
}

export const WebhookDlqDrawer: React.FC<WebhookDlqDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onReplayAll,
  onClearAll,
  isActionPending = false,
}) => {
  const [search, setSearch] = useState<string>('');
  const filtered = useMemo(() => filterDlqItems(items, search), [items, search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/75 backdrop-blur-sm p-0 text-slate-100">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full p-6 shadow-2xl flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">📭</span>
              <div>
                <h3 className="text-base font-semibold text-white">Webhook Dead Letter Queue</h3>
                <span className="text-[11px] text-slate-400">
                  {items.length} failed delivery {items.length === 1 ? 'attempt' : 'attempts'} archived
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Search Filter */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by URL, error, or subscription..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Items List */}
          <div className="overflow-y-auto max-h-[calc(100vh-280px)] space-y-2.5 pr-1">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                {items.length === 0
                  ? 'Dead letter queue is currently empty. All deliveries healthy!'
                  : 'No items match your filter criteria.'}
              </div>
            ) : (
              filtered.map((item, idx) => {
                const severity = classifyErrorSeverity(item.error);
                const time = formatRelativeFailureTime(item.failedAt);

                return (
                  <div
                    key={`${item.subscriptionId}-${idx}`}
                    className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-blue-400">
                        {item.eventType}
                      </span>
                      <span className="text-[10px] text-slate-500">{time}</span>
                    </div>

                    <div className="font-mono text-xs text-slate-200 truncate" title={item.url}>
                      {item.url}
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800/60">
                      <span className={`px-1.5 py-0.5 rounded ${severity.badgeClass}`}>
                        {severity.label}
                      </span>
                      <span className="text-slate-400">
                        Retries exhausted: {item.retryCount}
                      </span>
                    </div>

                    <div className="text-[10px] text-rose-400 font-mono truncate" title={item.error}>
                      Error: {item.error}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-800 flex gap-2.5">
          <button
            type="button"
            onClick={onClearAll}
            disabled={items.length === 0 || isActionPending}
            className="flex-1 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 disabled:opacity-40 text-xs font-semibold text-slate-300 transition"
          >
            Clear DLQ
          </button>
          <button
            type="button"
            onClick={onReplayAll}
            disabled={items.length === 0 || isActionPending}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-xs font-semibold text-white transition shadow-lg shadow-blue-900/30"
          >
            {isActionPending ? 'Replaying...' : 'Replay All'}
          </button>
        </div>
      </div>
    </div>
  );
};
