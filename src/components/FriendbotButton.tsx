'use client';

import { useState } from 'react';

const FRIENDBOT_URL = 'https://friendbot.stellar.org';

interface FriendbotButtonProps {
  address: string;
}

export function FriendbotButton({ address }: FriendbotButtonProps) {
  const [funding, setFunding] = useState(false);
  const [status, setStatus] = useState<'idle' | 'funding' | 'success' | 'error'>('idle');

  async function handleFund() {
    if (!address) return;
    setFunding(true);
    setStatus('funding');
    try {
      const res = await fetch($FRIENDBOT_URL/?addr=, {
        method: 'GET',
      });
      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    } finally {
      setFunding(false);
    }
  }

  return (
    <button
      onClick={handleFund}
      disabled={funding || !address}
      className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {status === 'funding' ? 'Funding...' : status === 'success' ? 'Funded!' : status === 'error' ? 'Retry' : 'Get test XLM'}
    </button>
  );
}