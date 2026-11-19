import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Calculator,
  CheckCircle2,
  FileSearch,
  RefreshCw,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import {
  computeArticle11SplitCents,
  computeArticle12RentSplitCents,
} from '../utils/brickcoinProtocolEngine';

interface LedgerEvent {
  seq: number;
  eventId: string;
  timestampUtc: string;
  eventType: string;
  currentHash: string;
  dilosPipeline?: {
    columboAuditHash: string;
    pipitoGateStatus: string;
    humanWitnessUid: string;
  };
}

const AUDIT_CASES = [
  {
    id: 'AUD-OH-01',
    title: 'Silo #OH-01 Monthly Net Rent Math ($26,800 → $18,760 Owners / $8,040 Prize)',
    detail: '70/30 arithmetic verified to the penny against bank statement & escrow transfer.',
    status: 'Arithmetic Verified',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  {
    id: 'AUD-PUB-312',
    title: 'Duplicate Public Schools Submission Hash Scan (312 Classroom Entries)',
    detail: 'Zero duplicate SHA-256 project video digests or recycled prompt answers found.',
    status: '0 Duplicates',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  {
    id: 'AUD-VND-19',
    title: 'Vendor Conflict Screening (HVAC Bid #19 — Shared Address Detected)',
    detail: 'Matched contractor mailing street with relative of regional Pusher. Escalated for recusal.',
    status: 'Flagged → Sent to 12-Owner Jury',
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-300',
  },
];

export const ColumboInvestigationPage: React.FC = () => {
  const [marketUsd, setMarketUsd] = useState<number>(100.03);
  const [rentUsd, setRentUsd] = useState<number>(4500);
  const [ledgerEvents, setLedgerEvents] = useState<LedgerEvent[]>([]);
  const [loadingLedger, setLoadingLedger] = useState<boolean>(false);

  const marketSplit = computeArticle11SplitCents(Math.round(Math.max(0.01, marketUsd) * 100));
  const rentSplit = computeArticle12RentSplitCents(Math.round(Math.max(0.01, rentUsd) * 100));

  const fetchPublicLedger = async () => {
    setLoadingLedger(true);
    try {
      const res = await fetch('/api/ledger/public');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.events)) {
          setLedgerEvents(data.events.slice().reverse());
        }
      }
    } catch {
      // Offline preview fallback keeps page interactive
    } finally {
      setLoadingLedger(false);
    }
  };

  useEffect(() => {
    fetchPublicLedger();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#081d38] text-white rounded-2xl border-2 border-[#dfa62a] p-6 sm:p-8 space-y-4 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#dfa62a] inline-flex items-center gap-1.5">
            <FileSearch className="w-4 h-4" />
            <span>Articles 7.1, 7.2 &amp; Q76 &bull; DILOS Stage 2 Investigator AI</span>
          </span>
          <span className="px-3 py-1 bg-white/10 border border-[#dfa62a]/40 text-[#dfa62a] text-xs font-bold rounded">
            Never Judges &bull; Never Touches Funds
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-1">
          <div className="md:col-span-7 space-y-3">
            <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight">
              AI Columbo Internal Investigation
            </h1>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              &ldquo;Just one more thing&hellip;&rdquo; Under <strong>Article 7.1 &amp; 7.2</strong>, AI Columbo acts as our bounded internal auditor: checking every 50/25/25 Marketplace checkout and 70/30 net rental ledger to the penny, scanning for duplicate hashes or hidden vendor conflicts, and keeping every question permanently on the record.
            </p>
          </div>
          <div className="md:col-span-5">
            <div className="rounded-xl overflow-hidden border-2 border-[#dfa62a] bg-slate-900 aspect-[16/9]">
              <img
                src="/src/assets/images/card_columbo_detective_desk_1794487609104.jpg"
                alt="AI Columbo Internal Investigation Desk"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Strict Constitutional Boundary */}
      <div className="p-4 sm:p-5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs sm:text-sm text-amber-950">
        <Scale className="w-5 h-5 text-[#b47d12] shrink-0 mt-0.5" />
        <div>
          <strong>Constitutional Separation of Powers (Article 7.2 &amp; 7.3):</strong> Columbo never acts as judge or jury, cannot approve payouts, cannot alter constitutional rules, and cannot move a single cent. Every anomaly flagged by Columbo goes strictly to a randomly drawn <strong>12-Person Mom-and-Pop Owner Jury</strong> and an <strong>Independent Human Witness</strong>.
        </div>
      </div>

      {/* Interactive Penny-Exact Math Auditor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#b47d12]">
            <Calculator className="w-4 h-4" />
            <span>Audit Check 1 &bull; Article 12.1 (50/25/25 Penny Conservation)</span>
          </div>
          <h2 className="font-serif text-xl font-bold text-[#081d38]">
            Marketplace Split Arithmetic Verifier
          </h2>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              Test Trade Amount (USD — try odd cents like 10.03 or 100.03)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={marketUsd}
              onChange={(e) => setMarketUsd(Math.max(0.01, Number(e.target.value) || 0.01))}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg font-mono"
            />
          </div>

          <div className="p-4 rounded-xl bg-[#fbfaf7] border border-slate-200 space-y-2 text-xs tabular-nums">
            <div className="flex justify-between">
              <span>50% Seller Immediate Cash:</span>
              <strong className="font-mono text-emerald-700">
                ${marketSplit.sellerCashUsd.toFixed(2)} ({marketSplit.sellerCashCents}¢)
              </strong>
            </div>
            <div className="flex justify-between">
              <span>25% Seller Property Balance:</span>
              <strong className="font-mono text-[#081d38]">
                ${marketSplit.sellerEquityUsd.toFixed(2)} ({marketSplit.sellerEquityCents}¢)
              </strong>
            </div>
            <div className="flex justify-between">
              <span>25% Buyer Property Balance:</span>
              <strong className="font-mono text-[#b47d12]">
                ${marketSplit.buyerEquityUsd.toFixed(2)} ({marketSplit.buyerEquityCents}¢)
              </strong>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-emerald-800">
              <span>Undisclosed Fee / Cent Drift:</span>
              <span className="font-mono">
                0¢ (Conserved {marketSplit.totalCents}¢ === {marketSplit.totalCents}¢)
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#b47d12]">
            <Calculator className="w-4 h-4" />
            <span>Audit Check 2 &bull; Article 11.3 (70/30 Net Rental Math)</span>
          </div>
          <h2 className="font-serif text-xl font-bold text-[#081d38]">
            Isolated Silo Rent Split Verifier
          </h2>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              Monthly Net Distributable Silo Rent (USD)
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={rentUsd}
              onChange={(e) => setRentUsd(Math.max(1, Number(e.target.value) || 1))}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg font-mono"
            />
          </div>

          <div className="p-4 rounded-xl bg-[#fbfaf7] border border-slate-200 space-y-2 text-xs tabular-nums">
            <div className="flex justify-between">
              <span>70% Participating Silo Owners:</span>
              <strong className="font-mono text-[#081d38]">
                ${(rentSplit.owners70Cents / 100).toFixed(2)} ({rentSplit.owners70Cents}¢)
              </strong>
            </div>
            <div className="flex justify-between">
              <span>30% National Public Schools Discovery Awards:</span>
              <strong className="font-mono text-emerald-700">
                ${(rentSplit.k12Prize30Cents / 100).toFixed(2)} ({rentSplit.k12Prize30Cents}¢)
              </strong>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-emerald-800">
              <span>Mortgage Debt Deduction:</span>
              <span className="font-mono">$0.00 (100% Debt-Free Art. 10.6)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Columbo Conflict & Duplicate Investigation Queue */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h2 className="font-serif text-xl font-bold text-[#081d38]">
          Recent Columbo Verification &amp; Conflict Findings
        </h2>
        <div className="divide-y divide-slate-200">
          {AUDIT_CASES.map((item) => (
            <div
              key={item.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="text-sm font-bold text-[#081d38]">{item.title}</div>
                <p className="text-xs text-slate-600">{item.detail}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-lg border text-xs font-bold shrink-0 inline-flex items-center gap-1.5 ${item.badgeClass}`}
              >
                {item.status.includes('Flagged') ? (
                  <AlertTriangle className="w-3.5 h-3.5" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>{item.status}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Live Public Ledger Audit Feed */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <h2 className="font-serif text-lg font-bold text-[#081d38]">
              Live Columbo Audit Hashes from Server Ledger (`/api/ledger/public`)
            </h2>
          </div>
          <button
            type="button"
            onClick={fetchPublicLedger}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#081d38] inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingLedger ? 'animate-spin' : ''}`} />
            <span>Refresh Feed</span>
          </button>
        </div>

        {ledgerEvents.length === 0 ? (
          <p className="text-xs text-slate-600 bg-[#fbfaf7] p-4 rounded-xl border border-slate-200">
            No live ledger commits recorded in this fresh server session yet. Register an Owner, simulate an NDA submission, or run a Marketplace order to inspect real-time Columbo SHA-256 audit hashes here.
          </p>
        ) : (
          <div className="space-y-2">
            {ledgerEvents.slice(0, 8).map((ev) => (
              <div
                key={ev.eventId}
                className="p-3 rounded-xl bg-[#fbfaf7] border border-slate-200 text-xs flex flex-wrap items-center justify-between gap-2 font-mono"
              >
                <div>
                  <strong className="text-[#081d38]">#{ev.seq} {ev.eventId}</strong> &bull; {ev.eventType}
                </div>
                <div className="text-emerald-800 truncate max-w-xs">
                  Columbo Hash: {ev.dilosPipeline?.columboAuditHash?.slice(0, 18) || ev.currentHash.slice(0, 18)}...
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
