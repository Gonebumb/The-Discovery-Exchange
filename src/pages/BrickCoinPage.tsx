import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Coins,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import {
  AUTHORIZED_SUPPLY_CEILING,
  CONSTITUTIONAL_DBC_POOLS,
  VestingRegistryStateShard,
  VestingSchedule,
  runCompleteBrickCoinVerificationSuite,
} from '../utils/brickcoinProtocolEngine';

export const BrickCoinPage: React.FC = () => {
  const [simBlockHeight, setSimBlockHeight] = useState<number>(500);
  const [simProportionalHold, setSimProportionalHold] = useState<boolean>(true);
  const [simGlobalQuarantine, setSimGlobalQuarantine] = useState<boolean>(false);

  const verificationReport = useMemo(() => runCompleteBrickCoinVerificationSuite(), []);

  const liveVesting = useMemo(() => {
    const vShard = new VestingRegistryStateShard();
    const walletId = 'OWNER_SILO_WALLET_01';
    const totalLot = 10000;
    const sched = new VestingSchedule('LOT_ALPHA_1', totalLot, 0, 100, 1000);
    const registry = { [walletId]: [sched] };
    const qMap = { [walletId]: simGlobalQuarantine };
    const holdMap = {
      [VestingRegistryStateShard.holdKey(walletId, 'LOT_ALPHA_1')]: simProportionalHold,
    };

    const spendable = vShard.computeSpendableAllowanceFromState(
      registry,
      qMap,
      holdMap,
      walletId,
      simBlockHeight,
      totalLot
    );
    const locked = totalLot - spendable;
    const stateRootHex = vShard.computeRootHashFromState(registry, qMap, holdMap).toHex();

    return {
      totalLot,
      spendable,
      locked,
      stateRootHex,
    };
  }, [simBlockHeight, simProportionalHold, simGlobalQuarantine]);

  return (
    <div className="space-y-6">
      {/* Header Banner — Consistent Compact Layout */}
      <div className="bg-[#081d38] text-white rounded-2xl border-2 border-[#dfa62a] p-6 sm:p-8 space-y-4 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#dfa62a] inline-flex items-center gap-1.5">
            <Coins className="w-4 h-4" />
            <span>Articles 11 &amp; 14 &bull; Schedule A &bull; Deterministic Protocol Engine</span>
          </span>
          <span className="px-3 py-1 bg-emerald-500/15 border border-emerald-400/50 text-emerald-300 text-xs font-bold rounded tabular-nums">
            {AUTHORIZED_SUPPLY_CEILING.toLocaleString()} Hard Cap &bull; {verificationReport.passCount}/
            {verificationReport.totalCount} Dual-QC Checks PASS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-1">
          <div className="md:col-span-7 space-y-3">
            <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight">
              Discovery BrickCoin (DBC) — Constitutional Value-Carrier &amp; Protocol Engine
            </h1>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              Discovery BrickCoin (DBC) is a proposed 100M-capped internal accounting and value-carrier unit linked to recorded debt-free property deeds—<strong>never marketed or sold as a speculative crypto token</strong>.
            </p>
          </div>
          <div className="md:col-span-5">
            <div className="rounded-xl overflow-hidden border-2 border-[#dfa62a] bg-slate-950 aspect-[16/9]">
              <img
                src="/assets/aistudio/brickcoin_hero_fixed.jpg"
                alt="Discovery BrickCoin — Backed up by real estate"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* 3 Core Constitutional Rules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/15 space-y-1">
            <div className="text-xs font-bold uppercase text-[#dfa62a]">1. Immutable Supply Ceiling</div>
            <div className="text-base font-bold text-white tabular-nums">
              {AUTHORIZED_SUPPLY_CEILING.toLocaleString()} DBC Forever
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Strictly capped at 100,000,000 units under Article 11.7. Zero hidden minting, zero dilution, and zero algorithmic inflation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/15 space-y-1">
            <div className="text-xs font-bold uppercase text-emerald-300">2. Deed-Before-DBC Mandate</div>
            <div className="text-base font-bold text-white">Article 11.2 Gate</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Zero property-level DBC may ever be issued until 100% debt-free acquisition closes, county title deed is recorded, and reserves are verified.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-white/15 space-y-1">
            <div className="text-xs font-bold uppercase text-sky-300">3. Zero Vote Buying</div>
            <div className="text-base font-bold text-white">1 Verified Human Owner = 1 Vote</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Under Articles 4.1 &amp; 14.4, holding DBC confers zero extra governance votes—preserving strict human Owner equality forever.
            </p>
          </div>
        </div>
      </div>

      {/* Version 10.0 Schedule A Allocation Breakdown */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#081d38]">
              Version 10.0 Schedule A — Constitutional Supply Allocation Pools
            </h2>
            <p className="text-xs text-slate-600">
              Article 14 Framework: 95% Owner Community &amp; Mission / 3% 50-Year Contributors / 1% Founder / 1% Future AI Reserve
            </p>
          </div>
          <span className="px-3 py-1 rounded bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold tabular-nums">
            Total Authorized: {AUTHORIZED_SUPPLY_CEILING.toLocaleString()} DBC
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CONSTITUTIONAL_DBC_POOLS.map((pool) => (
            <div
              key={pool.key}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold text-slate-500">{pool.key}</span>
                <span className="px-2.5 py-0.5 rounded bg-[#081d38] text-[#dfa62a] text-xs font-bold tabular-nums">
                  {pool.sharePct}% &bull; {pool.allocation.toLocaleString()} DBC
                </span>
              </div>
              <h3 className="font-serif text-base font-bold text-[#081d38]">{pool.label}</h3>
              <p className="text-xs text-slate-700 leading-relaxed">{pool.purpose}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Anti-Dump Vesting & Proportional Hold Simulator (Module 06) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#081d38]">
              Module 06 Interactive Anti-Dump Vesting &amp; Proportional Hold Simulator
            </h2>
            <p className="text-xs text-slate-600">
              Live browser execution of <span className="font-mono">VestingRegistryStateShard</span> (10,000 DBC Lot &bull; Cliff Block 100 &bull; Linear Release through Block 1,000)
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <Lock className="w-3.5 h-3.5" />
            <span>Wide u128 Math &bull; Zero Overflow</span>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>Simulated Ledger Block Height</span>
                <span className="font-mono text-[#081d38] tabular-nums">
                  Block #{simBlockHeight.toLocaleString()}{' '}
                  {simBlockHeight < 100
                    ? '(Pre-Cliff Lock)'
                    : simBlockHeight >= 1000
                      ? '(100% Vested)'
                      : '(Linear Release Window)'}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={1200}
                step={25}
                value={simBlockHeight}
                onChange={(e) => setSimBlockHeight(Number(e.target.value))}
                className="w-full accent-[#081d38]"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
                <span>Block 0 (Start)</span>
                <span>Block 100 (Cliff)</span>
                <span>Block 500 (50%)</span>
                <span>Block 1000 (Full)</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              <label className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simProportionalHold}
                  onChange={(e) => setSimProportionalHold(e.target.checked)}
                  className="mt-0.5 accent-[#081d38]"
                />
                <span className="text-xs text-slate-700 leading-relaxed">
                  <strong className="text-[#081d38] block">
                    Proportional Schedule Hold Cap (Remediated Guard)
                  </strong>
                  Freezes strictly the unvested remainder while preserving already-earned vested allowance for honest Owners.
                </span>
              </label>

              <label className="flex items-start gap-2.5 p-3 rounded-lg border border-amber-200 bg-amber-50/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simGlobalQuarantine}
                  onChange={(e) => setSimGlobalQuarantine(e.target.checked)}
                  className="mt-0.5 accent-[#081d38]"
                />
                <span className="text-xs text-slate-700 leading-relaxed">
                  <strong className="text-amber-950 block">
                    Article 7.5 Emergency Wallet Quarantine Gate
                  </strong>
                  Simulates a dual-board or compliance officer emergency freeze—immediately forcing spendable allowance to 0 DBC pending human review.
                </span>
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="text-xs font-bold uppercase text-emerald-800">
                  Spendable Vested Allowance
                </div>
                <div className="text-2xl font-bold text-emerald-950 tabular-nums mt-1">
                  {liveVesting.spendable.toLocaleString()} DBC
                </div>
                <div className="text-[11px] text-emerald-700 mt-1">
                  Out of {liveVesting.totalLot.toLocaleString()} DBC Lot
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-100 border border-slate-200">
                <div className="text-xs font-bold uppercase text-slate-700">
                  Locked / Unvested Balance
                </div>
                <div className="text-2xl font-bold text-[#081d38] tabular-nums mt-1">
                  {liveVesting.locked.toLocaleString()} DBC
                </div>
                <div className="text-[11px] text-slate-600 mt-1">
                  {simGlobalQuarantine ? 'Quarantine Active (100% Frozen)' : 'Protected Anti-Dump Lock'}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#081d38] text-white border border-[#dfa62a]/60 space-y-1.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#dfa62a]">
                Live Canonical SHA-256 Vesting State Root
              </div>
              <div className="font-mono text-xs break-all text-slate-200">
                {liveVesting.stateRootHex}
              </div>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-white/10">
                Composite Protocol Root:{' '}
                <span className="font-mono text-slate-300 break-all">
                  {verificationReport.compositeStateRootHex}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 22/22 Deterministic Dual-QC Verification Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#081d38]">
              Deterministic Protocol Dual-QC Verification Suite ({verificationReport.passCount}/
              {verificationReport.totalCount} Checks)
            </h2>
            <p className="text-xs text-slate-600">
              Executed live in-browser against <span className="font-mono">brickcoinProtocolEngine.ts</span> covering supply conservation, nonce integrity, vesting math, and Article 11/12 cent splits
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>
              {verificationReport.allPassed ? 'ALL INVARIANTS VERIFIED' : 'CHECK REQUIRED'}
            </span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {verificationReport.checks.map((chk) => (
            <div
              key={chk.id}
              className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#081d38] text-[#dfa62a]">
                    #{String(chk.id).padStart(2, '0')}
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    {chk.category}
                  </span>
                </div>
                <div className="text-xs font-bold text-[#081d38]">{chk.name}</div>
                <p className="text-xs text-slate-600 leading-relaxed">{chk.detail}</p>
              </div>
              <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[11px] font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>{chk.passed ? 'PASS' : 'FAIL'}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
