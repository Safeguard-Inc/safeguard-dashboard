'use client';

import React, { useState, useEffect } from 'react';
import { getQrCodeImageUrl } from '../lib/sep7';
export { getQrCodeImageUrl };

export interface Sep7QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  uri: string;
  amount?: string;
  token?: string;
  destination: string;
}



export function Sep7QrModal({
  isOpen,
  onClose,
  uri,
  amount,
  token = 'XLM',
  destination,
}: Sep7QrModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(uri);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const qrUrl = getQrCodeImageUrl(uri, 240);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-semibold text-slate-100">
              Mobile Wallet Checkout (SEP-0007)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-lg leading-none p-1"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col items-center py-6">
          <div className="p-3 bg-white rounded-xl shadow-inner border border-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              alt="SEP-0007 Payment QR Code"
              width={240}
              height={240}
              className="rounded-lg"
            />
          </div>

          <p className="text-xs text-slate-400 mt-4 text-center">
            Scan with <strong className="text-slate-200 font-semibold">LOBSTR</strong>,{' '}
            <strong className="text-slate-200 font-semibold">Freighter Mobile</strong>, or any
            SEP-0007 compatible Stellar wallet.
          </p>

          {amount && (
            <div className="mt-3 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400">
              Amount: {amount} {token}
            </div>
          )}
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handleCopy}
            className="w-full py-2 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700/50 flex items-center justify-center gap-2"
          >
            {copied ? '✓ URI Copied to Clipboard' : 'Copy SEP-0007 URI'}
          </button>
          <a
            href={uri}
            className="block text-center w-full py-2 px-4 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            Open in Installed Wallet
          </a>
        </div>
      </div>
    </div>
  );
}
