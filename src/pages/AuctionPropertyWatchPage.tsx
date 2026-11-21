import React, { useState } from 'react';
import { Building2, Calculator, Gavel, Lock, ShieldCheck } from 'lucide-react';
import {
  computeArticle12RentSplitCents,
  computeAuctionSpreadCarrierCents,
} from '../utils/brickcoinProtocolEngine';

const SILO_WATCHLIST = [
  {
    siloId: 'SILO #OH-01',
    city: 'Cleveland West Side — 4-Unit Residential',
    targetDiscountBand: '25% Below Market Appraisal',
    nuggetCount: '1,000 Nuggets ($500 target per Nugget)',
    status: 'Debt-Free Silo Model · 70% Owners / 30% Prize',
  },
  {
    siloId: 'SILO #NV-02',
    city: 'Las Vegas East Valley — 6-Unit Courtyard',
    targetDiscountBand: '22% Below Market Appraisal',
    nuggetCount: '1,000 Nuggets ($650 target per Nugget)',
    status: 'Debt-Free Silo Model · 70% Owners / 30% Prize',
  },
  {
    siloId: 'SILO #TX-03',
    city: 'Houston Eastside — 8-Unit Brick Complex',
    targetDiscountBand: '28% Below Market Appraisal',
    nuggetCount: '1,000 Nuggets ($350 target per Nugget)',
    status: 'Debt-Free Silo Model · 70% Owners / 30% Prize',
  },
];

export const AuctionPropertyWatchPage: React.FC = () => {
  const [appraisedUsd, setAppraisedUsd] = useState<number>(500_000);
  const [discountPct, setDiscountPct] = useState<number>(25);
  const [monthlyNetRentUsd, setMonthlyNetRentUsd] = useState<number>(4500);

  const spread = computeAuctionSpreadCarrierCents(
    Math.round(Math.max(50_000, appraisedUsd) * 100),
    Math.min(30, Math.max(20, discountPct))
  );
  const rentSplit = computeArticle12RentSplitCents(
    Math.round(Math.max(100, monthlyNetRentUsd) * 100)
  );

  return (
    <div className="space-y-6">
      <div className="bg-[#081d38] text-white rounded-2xl border-2 border-[#dfa62a] p-6 sm:p-8 space-y-3 shadow-md">
        <span className="text-xs font-bold uppercase tracking-wider text-[#dfa62a] inline-flex items-center gap-1.5">
          <Gavel className="w-4 h-4" />
          <span>Channel #17 &bull; Articles 9.1, 9.4, 9.5, 10.5 &amp; 10.6</span>
        </span>
        <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight">
          Upcoming Courthouse Auctions &amp; Debt-Free Silo Watch
        </h1>
        <p className="text-sm text-slate-200 max-w-3xl leading-relaxed">
          Pooled 25% Marketplace property balances target bank-owned residential auctions at <strong>20%–30% below appraised value</strong>—bought <strong>100% cash and debt-free</strong> inside isolated legal silos (1,000 equal Nuggets each). Clean net rent splits <strong>70% to Silo Owners</strong> and <strong>30% to The National Discovery Awards</strong>.
        </p>
      </div>

      {/* Non-Custodial Open Project Notice */}
      <div
        role="region"
        aria-label="Open Project Non-Custodial Notice"
        className="tdex-prelaunch-banner w-full bg-white text-[#9A6B0A] border-2 border-[#dfa62a] rounded-xl px-4 sm:px-6 py-3 text-center text-xs sm:text-[13px] leading-snug shadow-xs"
      >
        <div className="font-bold text-[#B47D12] uppercase tracking-wide mb-0.5">
          TDEX is Building Something New.
        </div>
        <div className="font-semibold text-[#9A6B0A]">
          Your money always stays in your accounts. The Discovery Exchange (TDEX) never holds or collects your funds. Instead, you save up for a home in your own PayPal or personal account. When TDEX finds the property that’s a match, you send your funds straight to a licensed escrow company to close the deal safely.
        </div>
      </div>

      {/* Auction Spread & 70/30 Calculator */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#b47d12]">
          <Calculator className="w-4 h-4" />
          <span>Constitutional Auction Discount (20%–30%) &amp; 70/30 Yield Model</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Appraised Market Value (USD)</label>
            <input
              type="number"
              min={50000}
              step={25000}
              value={appraisedUsd}
              onChange={(e) => setAppraisedUsd(Math.max(50000, Number(e.target.value) || 50000))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">
              Courthouse Auction Discount ({discountPct}% — Locked 20%–30%)
            </label>
            <input
              type="range"
              min={20}
              max={30}
              step={1}
              value={discountPct}
              onChange={(e) => setDiscountPct(Number(e.target.value))}
              className="w-full accent-[#081d38] mt-2 cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Est. Monthly Net Rent (USD)</label>
            <input
              type="number"
              min={100}
              step={100}
              value={monthlyNetRentUsd}
              onChange={(e) => setMonthlyNetRentUsd(Math.max(100, Number(e.target.value) || 100))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 tabular-nums">
          <div className="p-4 rounded-xl bg-[#fbfaf7] border border-slate-200">
            <div className="text-[11px] font-bold uppercase text-slate-500">100% Debt-Free Cash Price</div>
            <div className="text-xl font-mono font-bold text-[#081d38] mt-1">
              ${(spread.acquisitionPriceCents / 100).toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Zero bank mortgages</div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <div className="text-[11px] font-bold uppercase text-amber-900">Instant Auction Equity Cushion</div>
            <div className="text-xl font-mono font-bold text-[#b47d12] mt-1">
              ${(spread.dbcCarriedSpreadCents / 100).toLocaleString()}
            </div>
            <div className="text-[11px] text-amber-800 mt-1">{spread.discountPct}% discount below market appraisal</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold uppercase text-[#081d38]">70% Silo Owners / Mo</div>
            <div className="text-xl font-mono font-bold text-[#081d38] mt-1">
              ${(rentSplit.owners70Cents / 100).toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-600 mt-1">Clean net rent after taxes, insurance &amp; repairs</div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="text-xs font-bold uppercase text-emerald-900">30% Public Schools Awards Pool / Mo</div>
            <div className="text-xl font-mono font-bold text-emerald-800 mt-1">
              ${(rentSplit.k12Prize30Cents / 100).toFixed(2)}
            </div>
            <div className="text-[11px] text-emerald-700 mt-1">Split 15% Educators / 15% Students &amp; Tools</div>
          </div>
        </div>
      </div>

      {/* Watchlist */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#081d38]" />
          <h2 className="font-serif text-xl font-bold text-[#081d38]">
            Target Isolated Property Silos (1,000 Nuggets Each)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SILO_WATCHLIST.map((silo) => (
            <div key={silo.siloId} className="p-4 rounded-xl bg-[#fbfaf7] border border-slate-200 space-y-2 text-xs">
              <div className="font-mono font-bold text-[#b47d12]">{silo.siloId}</div>
              <div className="font-serif text-base font-bold text-[#081d38]">{silo.city}</div>
              <div className="text-slate-700">{silo.targetDiscountBand}</div>
              <div className="text-slate-600">{silo.nuggetCount}</div>
              <div className="pt-2 border-t border-slate-200 flex items-center gap-1.5 text-emerald-800 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>{silo.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
