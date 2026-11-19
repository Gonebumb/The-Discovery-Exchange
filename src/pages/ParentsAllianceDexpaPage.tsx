import React, { useState } from 'react';
import { Building2, CheckCircle2, Lock, ShieldCheck } from 'lucide-react';

export const ParentsAllianceDexpaPage: React.FC = () => {
  const [propertyPrice, setPropertyPrice] = useState<number>(500000);
  const [monthlyNetRent, setMonthlyNetRent] = useState<number>(4500);

  const fullNuggetValue = propertyPrice / 1000;
  const fractionalGrainValue = fullNuggetValue / 20;
  const owners70Share = monthlyNetRent * 0.7;
  const prize30Share = monthlyNetRent * 0.3;

  return (
    <div className="space-y-6">
      {/* Header Banner — Consistent Compact Layout */}
      <div className="bg-[#081d38] text-white rounded-2xl border-2 border-[#dfa62a] p-6 sm:p-8 space-y-4 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#dfa62a] inline-flex items-center gap-1.5">
            <Building2 className="w-4 h-4" />
            <span>Articles 2.1, 9, 10 &amp; 11 &bull; Debt-Free Real Estate &amp; Inflation Defense</span>
          </span>
          <span className="px-3 py-1 bg-emerald-500/15 border border-emerald-400/50 text-emerald-300 text-xs font-bold rounded">
            100% Debt-Free &bull; Isolated Silo Title
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-1">
          <div className="md:col-span-7 space-y-3">
            <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight">
              The Discovery Exchange Parents Alliance (DEXPA) — Debt-Free Property Silos
            </h1>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              DEXPA lets participating families pool 25% marketplace property credits into <strong>100% debt-free, income-producing residential real estate</strong> governed on an equal One-Owner, One-Vote basis—defending working family savings from inflation forever.
            </p>
          </div>
          <div className="md:col-span-5">
            <div className="rounded-xl overflow-hidden border-2 border-[#dfa62a] bg-slate-950 aspect-[16/9]">
              <img
                src="/assets/aistudio/image-gen-2_10__abd1c3d6.webp"
                alt="The Discovery Exchange Parents Alliance — Defending family savings from inflation"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Non-Custodial Open Project Notice */}
      <div
        role="region"
        aria-label="Open Project Non-Custodial Notice"
        className="tdex-prelaunch-banner w-full bg-[#061529] text-white border-2 border-[#dfa62a] rounded-xl px-4 sm:px-6 py-3 text-center text-xs sm:text-[13px] leading-snug shadow-xs"
      >
        <div className="font-bold text-[#fcd34d] uppercase tracking-wide mb-0.5">
          OPEN PROJECT UNDER ACTIVE REVIEW &amp; BUILD — ZERO MONEY HANDLING BY TDEX
        </div>
        <div>
          The Discovery Exchange (TDEX) <strong>NEVER</strong> holds, pools, collects, or touches any money. Families can begin setting up and building their own segregated property-accumulation balances inside their own licensed payment processor wallets (such as PayPal or an authorized financial partner) right away. When TDEX matches a debt-free property to buyers, TDEX opens a licensed third-party escrow directly on the seller’s side and gives buyers a set window to fund that seller-side escrow straight from their own regulated wallets.
        </div>
      </div>

      {/* Interactive 1,000-Nugget Silo & 70/30 Rent Calculator */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#081d38]">
              Interactive Silo Calculator: 1,000 Nuggets &amp; 70/30 Rent Split
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Every debt-free building sits inside its own isolated silo divided into 1,000 equal Nuggets under Article 9.1.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: '$250k Duplex', price: 250000, rent: 2400 },
              { label: '$500k Fourplex', price: 500000, rent: 4500 },
              { label: '$1M Apartment', price: 1000000, rent: 9000 },
            ].map((tier) => (
              <button
                key={tier.price}
                type="button"
                onClick={() => {
                  setPropertyPrice(tier.price);
                  setMonthlyNetRent(tier.rent);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                  propertyPrice === tier.price
                    ? 'bg-[#081d38] text-[#dfa62a]'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                }`}
              >
                {tier.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#fbfaf7] border border-slate-200">
            <div className="text-xs text-slate-500">Debt-Free Purchase Price (0% Debt)</div>
            <div className="text-2xl font-mono font-bold text-[#081d38] mt-1 tabular-nums">
              ${propertyPrice.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Article 10.6 Zero-Debt Rule</div>
          </div>

          <div className="p-4 rounded-xl bg-[#fbfaf7] border border-slate-200">
            <div className="text-xs text-slate-500">1 Full Nugget (1 / 1,000th Share)</div>
            <div className="text-2xl font-mono font-bold text-emerald-700 mt-1 tabular-nums">
              ${fullNuggetValue.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              1/20th Fractional Grain: ${fractionalGrainValue.toLocaleString()}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#fbfaf7] border border-slate-200">
            <div className="text-xs text-slate-500">70% Monthly Net Rent to Silo Owners</div>
            <div className="text-2xl font-mono font-bold text-[#081d38] mt-1 tabular-nums">
              ${owners70Share.toLocaleString()}/mo
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Article 11.3 Clean Net Split</div>
          </div>

          <div className="p-4 rounded-xl bg-[#081d38] text-white border border-slate-800">
            <div className="text-xs text-[#dfa62a]">30% Monthly Net Rent to Public Schools Awards</div>
            <div className="text-2xl font-mono font-bold text-emerald-300 mt-1 tabular-nums">
              ${prize30Share.toLocaleString()}/mo
            </div>
            <div className="text-[11px] text-slate-300 mt-1">Article 11.3 Permanent Endowment</div>
          </div>
        </div>
      </div>

      {/* 4 Constitutional Property & Escrow Protections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
          <h3 className="font-serif text-lg font-bold text-[#081d38] inline-flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#b47d12]" />
            <span>1. Isolated Property Silos (Article 9.1)</span>
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            Each building is titled to one identified legal silo entity. Owners of Building A hold rights only in Building A—meaning a repair, vacancy, or legal issue on one property can never spill over to threaten another building or the Prize fund.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
          <h3 className="font-serif text-lg font-bold text-[#081d38] inline-flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-[#b47d12]" />
            <span>2. 100% Debt-Free Purchases (Article 10.6)</span>
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            Zero mortgages, zero bank loans, and zero liens. Because there is no bank debt, no lender can ever foreclose on community buildings during an economic downturn or wipe out Owner equity.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
          <h3 className="font-serif text-lg font-bold text-[#081d38] inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>3. 60-Second Failed-Deal Refund Protection (Article 10.5)</span>
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            If a pooled property purchase fails to close for any reason, the system submits a 100% refund instruction within 60 seconds of verified failure so family accumulation balances are never trapped.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
          <h3 className="font-serif text-lg font-bold text-[#081d38]">
            4. Honest Risk &amp; Tax Disclosures (Articles 15.1 &amp; 15.3)
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            Net rental cash is distributed only after actual taxes, insurance, maintenance, and reserves are paid first—and the 70% Owner property silos are kept strictly separate from the 30% charitable Public Schools Awards foundation.
          </p>
        </div>
      </div>
    </div>
  );
};
