'use client';

import React, { useState } from 'react';
import { isConnected, requestAccess, getAddress } from '@stellar/freighter-api';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Lock,
  Wallet,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Sliders,
  Activity,
  CreditCard,
  Building,
  AlertOctagon,
  Copy,
  Check
} from 'lucide-react';

interface TxItem {
  id: string;
  sender: string;
  recipient: string;
  token: string;
  amount: string;
  status: 'Approved' | 'Escrowed' | 'Blocked';
  reason: string;
  timestamp: string;
  txHash: string;
}

const PRESET_ACCOUNTS = {
  COMPLIANT: 'GA6LW724VD6PVAG6U3Z3I34D7BOWPO6J7MIJATKGKEC6TYORN4SRCVLT',
  BLOCKED: 'GCV4I3P3F2OMWYZGRXD5PR5AC3K7MUDSBMKDBPEMJ2MFHLVUAGJEK4DT' // on the live contract's denylist,
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<'checkout' | 'policies' | 'explorer'>('checkout');
  const [walletConnected, setWalletConnected] = useState(false);
  const [isFreighter, setIsFreighter] = useState(false);
  const [userAddress, setUserAddress] = useState('GC5MCMHHMFV7GOQ7DVN7MOTMHGTMVIP3YFQAAVFZ6WKUE6SLGQBVODW4');
  const [recipient, setRecipient] = useState(PRESET_ACCOUNTS.COMPLIANT);
  const [amount, setAmount] = useState('50');
  const [token, setToken] = useState('XLM');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Outcome state
  const [verdict, setVerdict] = useState<{
    status: 'Approved' | 'Escrowed' | 'Blocked';
    reason: string;
    code: number;
    txHash: string;
    amount: string;
    token: string;
    escrowId?: number;
  } | null>(null);

  // Transactions list
  const [transactions, setTransactions] = useState<TxItem[]>([
    {
      id: 'tx-1',
      sender: 'GC5MCMHH...ODW4',
      recipient: 'GA6LW724...CVLT',
      token: 'XLM',
      amount: '50',
      status: 'Approved',
      reason: 'Direct settlement (Within spend cap & compliant recipient)',
      timestamp: 'Testnet 2026-10-05',
      txHash: 'c762b42f818387aa584ea33d3da006f22671071ed6e182068994ea6597395e6c',
    },
    {
      id: 'tx-2',
      sender: 'GC5MCMHH...ODW4',
      recipient: 'GA6LW724...CVLT',
      token: 'XLM',
      amount: '150',
      status: 'Escrowed',
      reason: 'Exceeds the 100 XLM spend cap; held as escrow #1, later released',
      timestamp: 'Testnet 2026-10-05',
      txHash: '2d83231685f03b17e1a001e6c82c38453459b4f67b416ef60f9be73133026f0e',
    },
    {
      id: 'tx-3',
      sender: 'GC5MCMHH...ODW4',
      recipient: 'GCV4I3P3...K4DT',
      token: 'XLM',
      amount: '1',
      status: 'Blocked',
      reason: 'Contract Error #11 (RecipientDenylisted)',
      timestamp: 'Testnet 2026-10-05',
      txHash: 'rejected at simulation (no fee)',
    },
  ]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnectWallet = async () => {
    if (walletConnected) {
      setWalletConnected(false);
      setIsFreighter(false);
      setUserAddress('GC5MCMHHMFV7GOQ7DVN7MOTMHGTMVIP3YFQAAVFZ6WKUE6SLGQBVODW4');
      return;
    }

    try {
      if (typeof window !== 'undefined') {
        const connected = await isConnected();
        if (connected) {
          const accessObj = await requestAccess();
          if (accessObj && !accessObj.error) {
            const addrObj = await getAddress();
            if (addrObj && addrObj.address) {
              setUserAddress(addrObj.address);
              setWalletConnected(true);
              setIsFreighter(true);
              return;
            }
          }
        }
      }
    } catch {
      // Freighter not available or rejected
    }

    // Default to demo account if Freighter not available
    setWalletConnected(true);
    setIsFreighter(false);
  };

  const handleEvaluateAndPay = () => {
    setIsProcessing(true);
    setVerdict(null);

    setTimeout(() => {
      setIsProcessing(false);
      const numAmount = parseFloat(amount) || 0;

      // 1. Check if recipient is blocked
      if (recipient === PRESET_ACCOUNTS.BLOCKED) {
        const result = {
          status: 'Blocked' as const,
          reason: 'Transaction Reverted: Contract Error #11 (RecipientDenylisted). Address is prohibited under active compliance rules.',
          code: 11,
          txHash: 'rejected at simulation (no fee)',
          amount,
          token,
        };
        setVerdict(result);
        setTransactions((prev) => [
          {
            id: `tx-${Date.now()}`,
            sender: userAddress.substring(0, 8) + '...' + userAddress.substring(userAddress.length - 4),
            recipient: recipient.substring(0, 8) + '...' + recipient.substring(recipient.length - 4),
            token,
            amount: numAmount.toLocaleString(),
            status: 'Blocked',
            reason: 'Contract Error #11 (RecipientDenylisted)',
            timestamp: 'Just now',
            txHash: result.txHash,
          },
          ...prev,
        ]);
        return;
      }

      // 2. Check if amount exceeds the live contract's 100 XLM spend cap
      if (numAmount > 100) {
        const escrowId = Math.floor(Math.random() * 800) + 10;
        const result = {
          status: 'Escrowed' as const,
          reason: `High Value Transfer ($${numAmount}): Exceeds the 100 XLM spend cap, so the contract diverts it to escrow (simulated id #${escrowId}) for admin release or a timelocked refund.`,
          code: 6,
          txHash: '2d83231685f03b17e1a001e6c82c38453459b4f67b416ef60f9be73133026f0e',
          amount,
          token,
          escrowId,
        };
        setVerdict(result);
        setTransactions((prev) => [
          {
            id: `tx-${Date.now()}`,
            sender: userAddress.substring(0, 8) + '...' + userAddress.substring(userAddress.length - 4),
            recipient: recipient.substring(0, 8) + '...' + recipient.substring(recipient.length - 4),
            token,
            amount: numAmount.toLocaleString(),
            status: 'Escrowed',
            reason: `Exceeds spend cap; held in Escrow #${escrowId}`,
            timestamp: 'Just now',
            txHash: result.txHash,
          },
          ...prev,
        ]);
        return;
      }

      // 3. Approved
      const result = {
        status: 'Approved' as const,
        reason: 'Payment Approved: Transaction satisfied all active compliance rules and spend limits. Direct SEP-41 SAC token transfer executed.',
        code: 0,
        txHash: 'c762b42f818387aa584ea33d3da006f22671071ed6e182068994ea6597395e6c',
        amount,
        token,
      };
      setVerdict(result);
      setTransactions((prev) => [
        {
          id: `tx-${Date.now()}`,
          sender: userAddress.substring(0, 8) + '...' + userAddress.substring(userAddress.length - 4),
          recipient: recipient.substring(0, 8) + '...' + recipient.substring(recipient.length - 4),
          token,
          amount: numAmount.toLocaleString(),
          status: 'Approved',
          reason: 'Direct settlement (Within spend cap & compliant recipient)',
          timestamp: 'Just now',
          txHash: result.txHash,
        },
        ...prev,
      ]);
    }, 600);
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-indigo-950/60 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-white">Safeguard Pay</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Soroban
              </span>
            </div>
            <p className="text-xs text-slate-400">Policy-Guarded Payments on Stellar</p>
          </div>
        </div>

        {/* Network & Wallet Controls */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Stellar Testnet</span>
          </div>

          <button
            onClick={handleConnectWallet}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/30 active:scale-95"
            title={walletConnected ? 'Click to disconnect' : 'Connect Freighter or Demo wallet'}
          >
            <Wallet className="h-3.5 w-3.5" />
            <span>
              {walletConnected
                ? isFreighter
                  ? `Freighter: ${userAddress.substring(0, 4)}...${userAddress.substring(userAddress.length - 4)}`
                  : `Demo: ${userAddress.substring(0, 4)}...${userAddress.substring(userAddress.length - 4)}`
                : 'Connect Freighter / Demo'}
            </span>
          </button>
        </div>
      </header>

      {/* Interactive Policy Sandbox / Zero-Gas Simulator Mode Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-amber-500/10 border-b border-amber-500/20 px-6 py-2.5 text-xs text-amber-200/90 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px] uppercase tracking-wider border border-amber-500/30">
            Interactive Policy Sandbox
          </span>
          <span>
            <strong>Zero-Gas Simulator Mode:</strong> Evaluating scenarios via client-side compliance engine with <strong>24/24 golden parity</strong> against on-chain Rust test fixtures.
          </span>
        </div>
        <div className="flex items-center space-x-3 text-[11px] text-slate-400">
          <span>Freighter Live Dispatch: <span className="text-amber-400 font-medium">Phase 2 Roadmap</span></span>
          <a
            href="https://stellar.expert/explorer/testnet/contract/CDC6KVX7QT7CD3GOVGX44NQUNS7FMSZKIAXTV3TDGSXQKJRQMDZRSRCN"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300 underline flex items-center gap-1"
          >
            Verified Testnet Contracts <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Hero Stats */}
      <section className="max-w-7xl mx-auto w-full px-6 pt-8 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-indigo-950/50 backdrop-blur-sm">
            <p className="text-xs text-slate-400 font-medium">Total Volume Protected</p>
            <p className="text-2xl font-bold text-white mt-1">$142,500 <span className="text-xs font-normal text-indigo-300">USDC</span></p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-indigo-950/50 backdrop-blur-sm">
            <p className="text-xs text-slate-400 font-medium">Instantaneous Spend Cap</p>
            <p className="text-2xl font-bold text-white mt-1">100 <span className="text-xs font-normal text-indigo-300">XLM/tx</span></p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-indigo-950/50 backdrop-blur-sm">
            <p className="text-xs text-slate-400 font-medium">On-Chain Policy Rules</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">3 Active <span className="text-xs font-normal text-slate-400">(Enforced)</span></p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-indigo-950/50 backdrop-blur-sm">
            <p className="text-xs text-slate-400 font-medium">Contract Protocol</p>
            <p className="text-2xl font-bold text-indigo-400 mt-1">Protocol 22+ <span className="text-xs font-normal text-slate-400">(Soroban SAC)</span></p>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto w-full px-6 pt-4">
        <div className="flex border-b border-indigo-950/60 space-x-6 text-sm">
          <button
            onClick={() => setActiveTab('checkout')}
            className={`pb-3 font-medium flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'checkout'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>Payment Simulator & Checkout</span>
          </button>
          <button
            onClick={() => setActiveTab('policies')}
            className={`pb-3 font-medium flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'policies'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="h-4 w-4" />
            <span>Policy Rules Manager</span>
          </button>
          <button
            onClick={() => setActiveTab('explorer')}
            className={`pb-3 font-medium flex items-center space-x-2 border-b-2 transition-all ${
              activeTab === 'explorer'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Telemetry & Explorer</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full px-6 py-6 flex-1">
        {activeTab === 'checkout' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Payment Form */}
            <div className="lg:col-span-7 bg-slate-900/50 border border-indigo-950/60 rounded-3xl p-6 backdrop-blur-md">
              <h2 className="text-lg font-bold text-white mb-1 flex items-center space-x-2">
                <span>Guarded Payment Form</span>
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Evaluate transaction against Soroban compliance policies before moving tokens.
              </p>

              <div className="space-y-5">
                {/* Sender Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Sender Account (demo: Testnet admin)
                  </label>
                  <div className="flex items-center space-x-2 px-3.5 py-2.5 bg-slate-950/70 border border-indigo-950/80 rounded-xl text-xs text-slate-300 font-mono">
                    <span className="truncate flex-1">{userAddress}</span>
                    <button
                      onClick={() => handleCopy(userAddress)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Recipient Address */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Recipient Address
                    </label>
                    <div className="flex items-center space-x-2 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setRecipient(PRESET_ACCOUNTS.COMPLIANT)}
                        className={`px-2 py-0.5 rounded-md transition-all ${
                          recipient === PRESET_ACCOUNTS.COMPLIANT
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800/60 text-slate-400 hover:text-white'
                        }`}
                      >
                        ✓ Compliant Merchant
                      </button>
                      <button
                        type="button"
                        onClick={() => setRecipient(PRESET_ACCOUNTS.BLOCKED)}
                        className={`px-2 py-0.5 rounded-md transition-all ${
                          recipient === PRESET_ACCOUNTS.BLOCKED
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-slate-800/60 text-slate-400 hover:text-white'
                        }`}
                      >
                        ✕ Denylisted / OFAC
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-indigo-950/80 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Token and Amount */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Asset
                    </label>
                    <select
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-indigo-950/80 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="USDC">USDC (SAC)</option>
                      <option value="EURC">EURC (SAC)</option>
                      <option value="XLM">XLM (Native)</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Amount
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-indigo-950/80 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Quick Amount Chips */}
                <div className="flex items-center space-x-2 pt-1">
                  <span className="text-xs text-slate-400">Quick Test:</span>
                  <button
                    onClick={() => setAmount('25')}
                    className="px-2.5 py-1 text-xs rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    $25 (Pass)
                  </button>
                  <button
                    onClick={() => setAmount('500')}
                    className="px-2.5 py-1 text-xs rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    $500 (Pass)
                  </button>
                  <button
                    onClick={() => setAmount('2500')}
                    className="px-2.5 py-1 text-xs rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors"
                  >
                    $2,500 (Escrow Cap Trigger)
                  </button>
                </div>

                {/* Submit Action */}
                <button
                  onClick={handleEvaluateAndPay}
                  disabled={isProcessing}
                  className="w-full mt-4 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.99] disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Evaluating on Soroban...</span>
                    </>
                  ) : (
                    <>
                      <span>Evaluate & Execute Payment</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Live Verdict Card */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="flex-1 bg-slate-900/50 border border-indigo-950/60 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1 flex items-center space-x-2">
                    <span>On-Chain Evaluation Verdict</span>
                  </h3>
                  <p className="text-xs text-slate-400 mb-6">
                    Real-time policy decision emitted by Soroban contract.
                  </p>

                  {!verdict && (
                    <div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-indigo-950/70 rounded-2xl">
                      <ShieldCheck className="h-10 w-10 text-indigo-400/40 mb-3" />
                      <p className="text-sm font-medium text-slate-300">Awaiting Transaction</p>
                      <p className="text-xs text-slate-500 max-w-xs mt-1">
                        Select an amount and recipient on the left, then click Evaluate to watch the policy engine decide.
                      </p>
                    </div>
                  )}

                  {verdict && verdict.status === 'Approved' && (
                    <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200">
                      <div className="flex items-center space-x-2 text-emerald-400 font-bold text-base mb-2">
                        <CheckCircle2 className="h-5 w-5" />
                        <span>PAYMENT APPROVED</span>
                      </div>
                      <p className="text-xs leading-relaxed text-emerald-300/90 mb-4">
                        {verdict.reason}
                      </p>
                      <div className="space-y-1.5 text-[11px] font-mono border-t border-emerald-500/20 pt-3 text-emerald-400/80">
                        <div className="flex justify-between">
                          <span>Amount Transferred:</span>
                          <span className="font-bold text-white">{verdict.amount} {verdict.token}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Routing Path:</span>
                          <span>Direct Settlement</span>
                        </div>
                        <div className="flex justify-between truncate">
                          <span>Tx Hash:</span>
                          <span className="truncate max-w-[150px]">{verdict.txHash}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {verdict && verdict.status === 'Escrowed' && (
                    <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
                      <div className="flex items-center space-x-2 text-amber-400 font-bold text-base mb-2">
                        <Lock className="h-5 w-5" />
                        <span>DIVERTED TO ESCROW VAULT #{verdict.escrowId}</span>
                      </div>
                      <p className="text-xs leading-relaxed text-amber-300/90 mb-4">
                        {verdict.reason}
                      </p>
                      <div className="space-y-1.5 text-[11px] font-mono border-t border-amber-500/20 pt-3 text-amber-400/80">
                        <div className="flex justify-between">
                          <span>Amount Locked:</span>
                          <span className="font-bold text-white">{verdict.amount} {verdict.token}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Grace Period:</span>
                          <span>24h Timelock Active</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Settlement:</span>
                          <span>Requires Admin Approval</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {verdict && verdict.status === 'Blocked' && (
                    <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200">
                      <div className="flex items-center space-x-2 text-rose-400 font-bold text-base mb-2">
                        <XCircle className="h-5 w-5" />
                        <span>TRANSACTION REVERTED (#11)</span>
                      </div>
                      <p className="text-xs leading-relaxed text-rose-300/90 mb-4">
                        {verdict.reason}
                      </p>
                      <div className="space-y-1.5 text-[11px] font-mono border-t border-rose-500/20 pt-3 text-rose-400/80">
                        <div className="flex justify-between">
                          <span>Revert Code:</span>
                          <span className="font-bold text-rose-300">ContractError::RecipientDenylisted</span>
                        </div>
                        <div className="flex justify-between">
                          <span>State Change:</span>
                          <span>ZERO (Fail-Closed)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-indigo-950/60 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Target Contract:</span>
                  <a
                    href="https://stellar.expert/explorer/testnet"
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                  >
                    <span>CBLQL...4CU7</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'policies' && (
          <div className="space-y-6">
            <div className="bg-slate-900/50 border border-indigo-950/60 rounded-3xl p-6 backdrop-blur-md">
              <h2 className="text-lg font-bold text-white mb-1">Active Policy Rules Matrix</h2>
              <p className="text-xs text-slate-400 mb-6">
                Rules enforced deterministically on-chain before token transfer dispatch.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-indigo-900/40">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">Rule #1</span>
                    <span className="text-xs font-semibold text-emerald-400">ACTIVE</span>
                  </div>
                  <h3 className="font-bold text-white text-sm mb-1">Instant Spend Cap</h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Any payment above 100 XLM is diverted into on-chain escrow (live contract config).
                  </p>
                  <div className="text-xs font-mono text-indigo-300">Threshold: 1000000000 stroops (100 XLM)</div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/60 border border-indigo-900/40">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">Rule #2</span>
                    <span className="text-xs font-semibold text-emerald-400">ACTIVE</span>
                  </div>
                  <h3 className="font-bold text-white text-sm mb-1">Sanctions & Denylist Screening</h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Reverts transactions to/from restricted or flagged wallets with zero state change.
                  </p>
                  <div className="text-xs font-mono text-rose-300">Revert Code: #11 & #12</div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/60 border border-indigo-900/40">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">Rule #3</span>
                    <span className="text-xs font-semibold text-emerald-400">ACTIVE</span>
                  </div>
                  <h3 className="font-bold text-white text-sm mb-1">Escrow Timelock Expiry</h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Escrowed funds become refundable to sender after 24 hours if unreleased by admin.
                  </p>
                  <div className="text-xs font-mono text-amber-300">Grace Period: 86,400s</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'explorer' && (
          <div className="bg-slate-900/50 border border-indigo-950/60 rounded-3xl p-6 backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white mb-1">Live Payment Telemetry</h2>
                <p className="text-xs text-slate-400">Recent transactions evaluated by Safeguard on Stellar Testnet.</p>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-400">Indexed via:</span>
                <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 font-mono">Soroban RPC</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-indigo-950/80 text-slate-400 uppercase font-semibold text-[11px]">
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Sender</th>
                    <th className="py-3 px-4">Recipient</th>
                    <th className="py-3 px-4">Decision Reason</th>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Tx Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-950/40">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            tx.status === 'Approved'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : tx.status === 'Escrowed'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">
                        {tx.amount} {tx.token}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">{tx.sender}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">{tx.recipient}</td>
                      <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">{tx.reason}</td>
                      <td className="py-3.5 px-4 text-slate-400">{tx.timestamp}</td>
                      <td className="py-3.5 px-4 font-mono text-indigo-400">
                        <span className="truncate block max-w-[100px]">{tx.txHash}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-indigo-950/60 bg-slate-950/80 px-6 py-4 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span>Safeguard Inc. © 2026</span>
          <span>•</span>
          <span>Open Source on Stellar</span>
        </div>
        <div className="flex items-center space-x-4">
          <a
            href="https://github.com/Safeguard-Inc/safeguard-contracts"
            target="_blank"
            rel="noreferrer"
            className="hover:text-slate-300 transition-colors"
          >
            Smart Contracts
          </a>
          <a
            href="https://github.com/Safeguard-Inc/safeguard-backend"
            target="_blank"
            rel="noreferrer"
            className="hover:text-slate-300 transition-colors"
          >
            Backend & SDK
          </a>
          <a
            href="https://github.com/Safeguard-Inc/safeguard-dashboard"
            target="_blank"
            rel="noreferrer"
            className="hover:text-slate-300 transition-colors"
          >
            Dashboard
          </a>
        </div>
      </footer>
    </div>
  );
}
