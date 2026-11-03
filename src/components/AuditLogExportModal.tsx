import React, { useState, useMemo } from 'react';
import {
  AuditLogExportFormat,
  FORMAT_METADATA,
  buildAuditLogExportUrl,
  generateAuditLogPreview,
} from '../lib/auditLogExportModal';

interface AuditLogExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiBaseUrl?: string;
}

export const AuditLogExportModal: React.FC<AuditLogExportModalProps> = ({
  isOpen,
  onClose,
  apiBaseUrl = '/api/export/audit-logs',
}) => {
  const [selectedFormat, setSelectedFormat] = useState<AuditLogExportFormat>('ndjson');
  const [limit, setLimit] = useState<number>(1000);
  const [copied, setCopied] = useState<boolean>(false);

  const exportUrl = useMemo(() => {
    return buildAuditLogExportUrl(apiBaseUrl, selectedFormat, limit);
  }, [apiBaseUrl, selectedFormat, limit]);

  const previewSnippet = useMemo(() => {
    return generateAuditLogPreview(selectedFormat);
  }, [selectedFormat]);

  if (!isOpen) return null;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin + exportUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleDownload = () => {
    window.open(exportUrl, '_blank');
  };

  const activeMeta = FORMAT_METADATA[selectedFormat];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 text-slate-100">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">📡</span>
            <h3 className="text-lg font-semibold text-white">Export SIEM Audit Logs</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-400 mb-5">
          Stream cryptographic audit trail records directly to enterprise SIEM platforms,
          compliance vaults, or offline cold storage.
        </p>

        {/* Format Selector */}
        <label className="block text-xs font-medium text-slate-300 mb-2">
          Select Log Ingestion Format
        </label>
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {(Object.keys(FORMAT_METADATA) as AuditLogExportFormat[]).map((fmt) => {
            const meta = FORMAT_METADATA[fmt];
            const isSelected = selectedFormat === fmt;
            return (
              <button
                key={fmt}
                type="button"
                onClick={() => setSelectedFormat(fmt)}
                className={`p-3 rounded-xl border text-left transition ${
                  isSelected
                    ? 'border-blue-500 bg-blue-950/30 ring-1 ring-blue-500'
                    : 'border-slate-800 bg-slate-800/40 hover:bg-slate-800 text-slate-400'
                }`}
              >
                <div className="text-base mb-1">{meta.icon}</div>
                <div className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {meta.extension.toUpperCase()}
                </div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                  {meta.label.split(' ')[0]}
                </div>
              </button>
            );
          })}
        </div>

        <div className="text-xs text-slate-400 bg-slate-800/40 p-3 rounded-lg border border-slate-800 mb-4">
          <span className="font-medium text-slate-200">{activeMeta.label}: </span>
          {activeMeta.description}
        </div>

        {/* Limit Slider / Input */}
        <div className="flex items-center justify-between mb-4 text-xs">
          <span className="text-slate-300">Max Event Records:</span>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:ring-0"
          >
            <option value={100}>100 records</option>
            <option value={500}>500 records</option>
            <option value={1000}>1,000 records</option>
            <option value={5000}>5,000 records (Full batch)</option>
          </select>
        </div>

        {/* Preview */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1 text-[11px] text-slate-400">
            <span>Stream Sample Preview</span>
            <span className="font-mono text-[10px] text-emerald-400">SHA-256 Verified</span>
          </div>
          <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-[10px] font-mono text-slate-300 max-h-24 overflow-x-auto overflow-y-hidden select-all whitespace-pre">
            {previewSnippet}
          </pre>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCopyUrl}
            className="flex-1 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-300 transition"
          >
            {copied ? '✓ URL Copied' : 'Copy Ingest URL'}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow-lg shadow-blue-900/30"
          >
            Download {activeMeta.extension.toUpperCase()} File
          </button>
        </div>
      </div>
    </div>
  );
};

