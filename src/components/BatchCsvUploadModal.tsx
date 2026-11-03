'use client';

import React, { useState } from 'react';
import { parseBatchCsvText, BatchCsvRow, BatchCsvSummary } from '../lib/batchCsvUpload';

export interface BatchCsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitBatch: (rows: BatchCsvRow[]) => Promise<void>;
}

export function BatchCsvUploadModal({ isOpen, onClose, onSubmitBatch }: BatchCsvUploadModalProps) {
  const [csvContent, setCsvContent] = useState('');
  const [parsedData, setParsedData] = useState<{ rows: BatchCsvRow[]; summary: BatchCsvSummary } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleTextChange = (text: string) => {
    setCsvContent(text);
    if (text.trim().length > 0) {
      setParsedData(parseBatchCsvText(text));
    } else {
      setParsedData(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      handleTextChange(text || '');
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (!parsedData || parsedData.summary.validCount === 0) return;
    setIsSubmitting(true);
    try {
      const validOnly = parsedData.rows.filter((r) => r.isValid);
      await onSubmitBatch(validOnly);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-100 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>📁</span> Enterprise Batch Disbursement CSV Upload
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="my-4 space-y-4 overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Select CSV File or Paste RFC 4180 Content
            </label>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-slate-800 file:text-cyan-400 hover:file:bg-slate-700 cursor-pointer"
            />
          </div>

          <textarea
            value={csvContent}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="recipient,amount,token,memo&#10;GA6LW724VD6PVAG6U3Z3I34D7BOWPO6J7MIJATKGKEC6TYORN4SRCVLT,150,XLM,Payroll Sept"
            rows={4}
            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />

          {parsedData && (
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="rounded-xl border border-slate-800 bg-slate-800/40 p-2.5">
                  <div className="text-xs text-slate-400">Total Rows</div>
                  <div className="text-lg font-bold">{parsedData.summary.totalRows}</div>
                </div>
                <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-2.5">
                  <div className="text-xs text-emerald-400">Valid</div>
                  <div className="text-lg font-bold text-emerald-300">{parsedData.summary.validCount}</div>
                </div>
                <div className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-2.5">
                  <div className="text-xs text-rose-400">Invalid</div>
                  <div className="text-lg font-bold text-rose-300">{parsedData.summary.invalidCount}</div>
                </div>
                <div className="rounded-xl border border-cyan-900/50 bg-cyan-950/20 p-2.5">
                  <div className="text-xs text-cyan-400">Est. Volume</div>
                  <div className="text-lg font-bold text-cyan-300">{parsedData.summary.totalVolume}</div>
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/40">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 sticky top-0 text-slate-400 font-medium">
                    <tr>
                      <th className="p-2">#</th>
                      <th className="p-2">Recipient</th>
                      <th className="p-2">Amount</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {parsedData.rows.map((row) => (
                      <tr key={row.index} className={row.isValid ? 'hover:bg-slate-800/30' : 'bg-rose-950/20'}>
                        <td className="p-2 font-mono text-slate-400">{row.index}</td>
                        <td className="p-2 font-mono truncate max-w-[140px]">{row.recipient}</td>
                        <td className="p-2 font-mono">{row.amount} {row.token}</td>
                        <td className="p-2">
                          {row.isValid ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400">
                              Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-500/10 text-rose-400" title={row.errorMessage}>
                              {row.errorMessage || 'Invalid'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !parsedData || parsedData.summary.validCount === 0}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-md disabled:opacity-50"
          >
            {isSubmitting ? 'Processing Batch...' : `Disburse ${parsedData?.summary.validCount || 0} Payments`}
          </button>
        </div>
      </div>
    </div>
  );
}
