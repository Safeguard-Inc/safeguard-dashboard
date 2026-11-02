'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';

export interface NetworkConfigOption {
  id: 'testnet' | 'futurenet' | 'standalone';
  name: string;
  rpcUrl: string;
  networkPassphrase: string;
  explorerUrl: string;
  badgeClass: string;
}

export const SUPPORTED_NETWORKS: NetworkConfigOption[] = [
  {
    id: 'testnet',
    name: 'Stellar Testnet',
    rpcUrl: 'https://soroban-testnet.stellar.org',
    networkPassphrase: 'Test SDF Network ; September 2015',
    explorerUrl: 'https://stellar.expert/explorer/testnet',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  {
    id: 'futurenet',
    name: 'Stellar Futurenet',
    rpcUrl: 'https://rpc-futurenet.stellar.org',
    networkPassphrase: 'Test SDF Future Network ; October 2022',
    explorerUrl: 'https://stellar.expert/explorer/futurenet',
    badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  },
  {
    id: 'standalone',
    name: 'Local Standalone',
    rpcUrl: 'http://localhost:8000/soroban/rpc',
    networkPassphrase: 'Standalone Network ; February 2017',
    explorerUrl: 'http://localhost:8000',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
];

interface NetworkSwitcherProps {
  onNetworkChange?: (network: NetworkConfigOption) => void;
}

export default function NetworkSwitcher({ onNetworkChange }: NetworkSwitcherProps) {
  const [selectedId, setSelectedId] = useState<string>('testnet');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('safeguard_selected_network');
      if (saved && SUPPORTED_NETWORKS.some((n) => n.id === saved)) {
        setSelectedId(saved);
        const match = SUPPORTED_NETWORKS.find((n) => n.id === saved);
        if (match && onNetworkChange) {
          onNetworkChange(match);
        }
      }
    } catch {
      // localStorage may be unavailable or disabled
    }
  }, [onNetworkChange]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentNetwork =
    SUPPORTED_NETWORKS.find((n) => n.id === selectedId) || SUPPORTED_NETWORKS[0];

  const handleSelect = (net: NetworkConfigOption) => {
    setSelectedId(net.id);
    setIsOpen(false);
    try {
      localStorage.setItem('safeguard_selected_network', net.id);
    } catch {
      // ignore storage failure
    }
    if (onNetworkChange) {
      onNetworkChange(net);
    }
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select Stellar Network"
        className="flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900/80 border border-indigo-950/80 text-slate-200 hover:border-indigo-600/50 hover:bg-slate-800/80 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
      >
        <Globe className="h-3.5 w-3.5 text-indigo-400" />
        <span className="font-semibold">{currentNetwork.name}</span>
        <ChevronDown
          className={`h-3 w-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900/95 border border-indigo-950/80 shadow-2xl backdrop-blur-xl z-50 p-2 space-y-1 focus:outline-none animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-indigo-950/40">
            Target Soroban Network
          </div>
          {SUPPORTED_NETWORKS.map((net) => {
            const isSelected = net.id === selectedId;
            return (
              <button
                key={net.id}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(net)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors ${
                  isSelected
                    ? 'bg-indigo-600/20 text-white font-semibold border border-indigo-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span>{net.name}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full border ${net.badgeClass}`}
                    >
                      {net.id}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate max-w-[170px] mt-0.5">
                    {net.rpcUrl}
                  </p>
                </div>
                {isSelected && <Check className="h-4 w-4 text-indigo-400 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

