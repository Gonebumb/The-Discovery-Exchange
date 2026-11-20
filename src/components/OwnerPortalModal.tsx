import React, { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  Coins,
  FolderLock,
  Lock,
  LogOut,
  Receipt,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  Wallet,
} from 'lucide-react';
import { PrivateVaultPortal } from './PrivateVaultPortal';

interface TradeReceiptSummary {
  receiptId: string;
  itemTitle: string;
  totalCents: number;
  sellerCashCents: number;
  sellerEquityCents: number;
  buyerEquityCents: number;
  mode: string;
  executedAtUtc: string;
}

interface OwnerSession {
  ownerUuid: string;
  email: string;
  stateCode: string;
  votingWeight: number;
  accumulationBalanceUsd: number;
  sellerCashBalanceUsd?: number;
  dbcBalance: number;
  productionRealMoneyHold?: boolean;
  recentReceipts?: TradeReceiptSummary[];
}

export const OwnerPortalPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [stateCode, setStateCode] = useState('OH');
  const [isAdultVerified, setIsAdultVerified] = useState(false);
  const [acceptedCharterV10, setAcceptedCharterV10] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sessionOwner, setSessionOwner] = useState<OwnerSession | null>(null);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [isRefreshingWallet, setIsRefreshingWallet] = useState(false);
  const [showVaultLogin, setShowVaultLogin] = useState(false);

  const loadWalletSession = useCallback(async (token: string) => {
    setIsRefreshingWallet(true);
    try {
      const walletRes = await fetch('/api/wallets/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (walletRes.ok) {
        const walletData = (await walletRes.json()) as OwnerSession;
        setSessionOwner(walletData);
        return;
      }
      if (walletRes.status === 401) {
        localStorage.removeItem('tdex_owner_token');
        setSessionOwner(null);
        return;
      }
      const meRes = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (meRes.ok) {
        const ownerData = (await meRes.json()) as OwnerSession;
        setSessionOwner(ownerData);
      } else {
        localStorage.removeItem('tdex_owner_token');
      }
    } catch {
      // Ignore offline network errors on initial check
    } finally {
      setIsRefreshingWallet(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('tdex_owner_token');
    if (!token) return;
    void loadWalletSession(token);
  }, [loadWalletSession]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const body =
        mode === 'register'
          ? { email, password, fullName, stateCode, isAdultVerified, acceptedCharterV10 }
          : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Authentication failed.');
        return;
      }
      localStorage.setItem('tdex_owner_token', data.token);
      setSessionOwner(data.owner);
      if (data.ledgerReceipt) setReceiptId(data.ledgerReceipt);
      if (data.token) {
        void loadWalletSession(data.token);
      }
    } catch {
      // Fallback local preview if running static without Node server
      setSessionOwner({
        ownerUuid: 'OWNER-PREVIEW-V10',
        email,
        stateCode,
        votingWeight: 1,
        accumulationBalanceUsd: 0,
        sellerCashBalanceUsd: 0,
        dbcBalance: 0,
      });
      setReceiptId('TDX-2026-PREVIEW');
    }
  };

  const handleSignOut = async () => {
    const token = localStorage.getItem('tdex_owner_token');
    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
      localStorage.removeItem('tdex_owner_token');
    }
    setSessionOwner(null);
    setReceiptId(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#081d38] text-white rounded-2xl border-2 border-[#dfa62a] p-6 sm:p-8 space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#dfa62a]">
          Article 1.1 &amp; Article 4.1 &bull; Ownership-First Architecture (No Bosses, Only Owners)
        </span>
        <h1 className="font-serif text-2xl sm:text-4xl font-bold">
          Owner Registration &amp; Kitchen-Table Center
        </h1>
        <p className="text-sm text-slate-200 max-w-3xl leading-relaxed">
          Sign in below to walk through the <strong>One Human Owner = One Vote</strong> portal, sample 50/25/25 wallets, and append-only ledger (demo accounts carry zero live funds).
        </p>
      </div>

      {sessionOwner ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified Walkthrough Session &bull; 1 Human = 1 Vote</span>
              </div>
              <h2 className="font-serif text-xl font-bold text-[#081d38]">
                {sessionOwner.email} ({sessionOwner.stateCode})
              </h2>
              <p className="text-xs font-mono text-slate-500">
                ID: {sessionOwner.ownerUuid} {receiptId ? `• Ledger Receipt: ${receiptId}` : ''}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={isRefreshingWallet}
                onClick={() => {
                  const token = localStorage.getItem('tdex_owner_token');
                  if (token) void loadWalletSession(token);
                }}
                className="px-3 py-2 bg-[#fbfaf7] hover:bg-amber-50 border border-slate-200 text-[#081d38] text-xs font-bold rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingWallet ? 'animate-spin' : ''}`} />
                <span>Refresh Wallet</span>
              </button>
              <button
                type="button"
                onClick={handleSignOut}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#fbfaf7] border border-slate-200">
              <div className="text-xs text-slate-500 inline-flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-[#081d38]" />
                <span>Constitutional Voting Power</span>
              </div>
              <div className="text-2xl font-mono font-bold text-[#081d38] mt-1">
                1 Human = {sessionOwner.votingWeight} Vote
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Locked by Article 4.1</div>
            </div>

            <div className="p-4 rounded-xl bg-[#fbfaf7] border border-slate-200">
              <div className="text-xs text-slate-500 inline-flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-emerald-700" />
                <span>25% Property Accumulation</span>
              </div>
              <div className="text-2xl font-mono font-bold text-emerald-700 mt-1">
                ${sessionOwner.accumulationBalanceUsd.toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Segregated Escrow (Article 10.1)</div>
            </div>

            <div className="p-4 rounded-xl bg-[#fbfaf7] border border-slate-200">
              <div className="text-xs text-slate-500 inline-flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-700" />
                <span>50% Marketplace Cash Wallet</span>
              </div>
              <div className="text-2xl font-mono font-bold text-amber-800 mt-1">
                ${(sessionOwner.sellerCashBalanceUsd || 0).toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Seller 50% Proceeds (Art. 12.1)</div>
            </div>

            <div className="p-4 rounded-xl bg-[#fbfaf7] border border-slate-200">
              <div className="text-xs text-slate-500 inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#081d38]" />
                <span>Discovery Brick Coins (DBC)</span>
              </div>
              <div className="text-2xl font-mono font-bold text-[#081d38] mt-1">
                {sessionOwner.dbcBalance.toLocaleString()} DBC
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Post-Deed Units (Article 11.2)</div>
            </div>
          </div>

          {sessionOwner.recentReceipts && sessionOwner.recentReceipts.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#081d38]">
                <Receipt className="w-4 h-4 text-[#dfa62a]" />
                <span>Recent Persisted 50/25/25 Trade Receipts</span>
              </div>
              <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                {sessionOwner.recentReceipts.map((rec) => (
                  <div
                    key={rec.receiptId}
                    className="p-3 bg-[#fbfaf7] flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-[#081d38] break-words">{rec.itemTitle}</div>
                      <div className="font-mono text-[11px] text-slate-500 break-all">
                        {rec.receiptId} &bull; {rec.mode} &bull;{' '}
                        {new Date(rec.executedAtUtc).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px]">
                      <span className="text-slate-700 font-bold">
                        Total: ${(rec.totalCents / 100).toFixed(2)}
                      </span>
                      <span className="text-emerald-700">
                        Cash: ${(rec.sellerCashCents / 100).toFixed(2)}
                      </span>
                      <span className="text-amber-800">
                        Seller 25%: ${(rec.sellerEquityCents / 100).toFixed(2)}
                      </span>
                      <span className="text-sky-800">
                        Buyer 25%: ${(rec.buyerEquityCents / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 max-w-xl mx-auto space-y-5">
          <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg cursor-pointer ${
                mode === 'register' ? 'bg-[#081d38] text-[#dfa62a]' : 'text-slate-700'
              }`}
            >
              Become an Owner (Register)
            </button>
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg cursor-pointer ${
                mode === 'login' ? 'bg-[#081d38] text-[#dfa62a]' : 'text-slate-700'
              }`}
            >
              Owner Sign In
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 inline-flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Legal Full Name (Stored Encrypted in PII Vault Only)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    State / Country Code (For Out-of-State Blind Jury Selection)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={stateCode}
                    onChange={(e) => setStateCode(e.target.value)}
                    placeholder="e.g., OH, TX, CA, KR"
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg"
                  />
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            {mode === 'register' && (
              <div className="space-y-2 text-xs text-slate-700">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAdultVerified}
                    onChange={(e) => setIsAdultVerified(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span>
                    Article 4.5 Age Verification: I confirm I am 18 years or older. (Minors participate in the Public Schools Discovery Awards strictly under Parent/Guardian consent.)
                  </span>
                </label>

                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedCharterV10}
                    onChange={(e) => setAcceptedCharterV10(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span>
                    I accept The Discovery Exchange Constitution (Version 10.0), including One Human Owner = One Vote (Article 4.1) and Zero Bosses (Article 1.2).
                  </span>
                </label>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-[#081d38] hover:bg-[#0f294d] text-[#dfa62a] text-sm font-bold rounded-xl transition-colors cursor-pointer"
            >
              {mode === 'register' ? 'Complete Owner Registration' : 'Sign In as Owner'}
            </button>
          </form>
        </div>
      )}

      {/* Restricted Internal Vault & Audit Log Gate inside Owner Log In Area */}
      <div className="bg-slate-950 text-white border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs font-bold uppercase tracking-wider text-[#dfa62a] inline-flex items-center gap-1.5">
              <FolderLock className="w-4 h-4" />
              <span>Authorized Governance Officers Only</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-white">
              Internal Vault &amp; Audit Log
            </h3>
            <p className="text-xs text-slate-300">
              Restricted portal for Phase 1 Custodian, Internal Arbitration Court, Board Directors
              (with Court Clearance), and AI Oversight.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowVaultLogin((prev) => !prev)}
            className="px-4 py-2 rounded-lg bg-[#dfa62a] hover:bg-[#eab308] text-[#081d38] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <FolderLock className="w-4 h-4" />
            <span>{showVaultLogin ? 'Hide Internal Vault' : 'Open Internal Vault & Audit Log'}</span>
          </button>
        </div>

        {showVaultLogin && <PrivateVaultPortal embedded />}
      </div>
    </div>
  );
};
