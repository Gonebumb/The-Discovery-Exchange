import React, { useState } from 'react';
import {
  CheckCircle2,
  KeyRound,
  Lock,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { AUTHORIZED_SUPPLY_CEILING } from '../utils/brickcoinProtocolEngine';

export const PipitoGatekeepingPage: React.FC = () => {
  const [hasMortgageDebt, setHasMortgageDebt] = useState<boolean>(false);
  const [proposedDbcSupply, setProposedDbcSupply] = useState<number>(95_000_000);
  const [deedRecorded, setDeedRecorded] = useState<boolean>(true);
  const [prizeCashInBank, setPrizeCashInBank] = useState<boolean>(true);
  const [humanWitnessSigned, setHumanWitnessSigned] = useState<boolean>(true);

  const gateChecks = [
    {
      id: 'GATE_1_DEBT_FREE',
      title: 'Gate 1: 100% Debt-Free Isolated Silo Rule (Article 10.6)',
      passed: !hasMortgageDebt,
      failReason: 'PIPITO_HALT: Any bank mortgage, HELOC, or property lien is constitutionally prohibited.',
      passReason: 'CLEARED: Zero mortgage debt or hidden lien attached to property silo.',
    },
    {
      id: 'GATE_2_DBC_CAP',
      title: 'Gate 2: 100,000,000 DBC Hard Cap & Deed-First Rule (Articles 11.2 & 11.7)',
      passed: proposedDbcSupply <= AUTHORIZED_SUPPLY_CEILING && deedRecorded,
      failReason:
        proposedDbcSupply > AUTHORIZED_SUPPLY_CEILING
          ? 'PIPITO_HALT: Proposed DBC supply exceeds 100,000,000 unit hard ceiling.'
          : 'PIPITO_HALT: Property DBC cannot be issued before official deed recording.',
      passReason: `CLEARED: ${proposedDbcSupply.toLocaleString()} DBC within 100M cap & deed recorded.`,
    },
    {
      id: 'GATE_3_FUNDED_FIRST',
      title: 'Gate 3: Funded-First Prize Escrow Rule (Article 13.1)',
      passed: prizeCashInBank,
      failReason: 'PIPITO_HALT: Unfunded prize claims are blocked until 100% of cash is verified in escrow.',
      passReason: 'CLEARED: Prize payout cash is 100% verified inside segregated Trust account.',
    },
    {
      id: 'GATE_4_HUMAN_WITNESS',
      title: 'Gate 4: Four-Step DILOS Separation & Human Witness Sign-Off (Article 7.3)',
      passed: humanWitnessSigned,
      failReason: 'PIPITO_HALT: AI cannot finalize commits alone. Mandatory Independent Human Witness signature missing.',
      passReason: 'CLEARED: Concierge → Columbo → Pipito → Independent Human Witness complete.',
    },
  ];

  const allGatesCleared = gateChecks.every((g) => g.passed);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#081d38] text-white rounded-2xl border-2 border-[#dfa62a] p-6 sm:p-8 space-y-4 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#dfa62a] inline-flex items-center gap-1.5">
            <KeyRound className="w-4 h-4" />
            <span>Articles 7.1, 7.3, 7.4 &amp; Q77 &bull; DILOS Stage 3 Constitutional Gatekeeper</span>
          </span>
          <span className="px-3 py-1 bg-white/10 border border-[#dfa62a]/40 text-[#dfa62a] text-xs font-bold rounded">
            Fail-Closed Protection
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-1">
          <div className="md:col-span-7 space-y-3">
            <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight">
              AI Pipito Internal Gatekeeping
            </h1>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              Under <strong>Articles 7.1, 7.3 &amp; 7.4</strong>, AI Pipito is our fail-closed Constitutional Gatekeeper. Before any ledger commit reaches an <strong>Independent Human Witness</strong>, Pipito verifies every boundary rule—halting automatically if anyone tries to borrow against a property, exceed 100,000,000 DBC, or bypass human verification.
            </p>
          </div>
          <div className="md:col-span-5">
            <div className="rounded-xl overflow-hidden border-2 border-[#dfa62a] bg-slate-900 aspect-[16/9]">
              <img
                src="/src/assets/images/card_pipito_three_keys_1794487609493.jpg"
                alt="AI Pipito Constitutional Gatekeeper"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Fail-Closed Constitutional Gate Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="font-serif text-xl font-bold text-[#081d38]">
            Test Pipito&rsquo;s Fail-Closed Gates
          </h2>
          <p className="text-xs text-slate-600">
            Toggle any constitutional invariant below to observe how Pipito immediately halts unsafe or non-compliant commits before human sign-off.
          </p>

          <div className="space-y-3 text-xs">
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#fbfaf7] border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={hasMortgageDebt}
                onChange={(e) => setHasMortgageDebt(e.target.checked)}
                className="mt-0.5"
              />
              <span>
                <strong>Simulate Rule Violation:</strong> Attach a 30% bank mortgage or lien to property silo (Violates Art. 10.6)
              </span>
            </label>

            <div className="p-3 rounded-xl bg-[#fbfaf7] border border-slate-200 space-y-1.5">
              <label className="font-bold text-[#081d38] block">
                Total DBC Supply Check (Max 100,000,000):
              </label>
              <input
                type="number"
                step={1_000_000}
                value={proposedDbcSupply}
                onChange={(e) => setProposedDbcSupply(Number(e.target.value) || 0)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-mono text-xs"
              />
            </div>

            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#fbfaf7] border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={deedRecorded}
                onChange={(e) => setDeedRecorded(e.target.checked)}
                className="mt-0.5"
              />
              <span>Official Property Deed Recorded Before Property DBC (Art. 11.2)</span>
            </label>

            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#fbfaf7] border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={prizeCashInBank}
                onChange={(e) => setPrizeCashInBank(e.target.checked)}
                className="mt-0.5"
              />
              <span>100% Prize Cash Verified in Escrow Bank Account (Art. 13.1)</span>
            </label>

            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#fbfaf7] border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={humanWitnessSigned}
                onChange={(e) => setHumanWitnessSigned(e.target.checked)}
                className="mt-0.5"
              />
              <span>Independent Human Witness Final Sign-Off Present (Art. 7.3)</span>
            </label>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div
            className={`p-4 rounded-xl border-2 flex items-center justify-between gap-3 ${
              allGatesCleared
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-red-50 border-red-300 text-red-950'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {allGatesCleared ? (
                <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0" />
              ) : (
                <ShieldAlert className="w-6 h-6 text-red-700 shrink-0" />
              )}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider">
                  Pipito Gate Decision
                </div>
                <div className="font-serif text-lg font-bold">
                  {allGatesCleared ? 'GATE_CLEARED — Ready for Human Witness' : 'GATE_HALTED — Fail-Closed Stop Active'}
                </div>
              </div>
            </div>
            <span className="font-mono text-xs font-bold px-3 py-1 rounded bg-white border border-current">
              {allGatesCleared ? '4 / 4 CLEARED' : 'BLOCKED'}
            </span>
          </div>

          <div className="space-y-3">
            {gateChecks.map((gate) => (
              <div
                key={gate.id}
                className={`p-4 rounded-xl border space-y-1 ${
                  gate.passed
                    ? 'bg-[#fbfaf7] border-slate-200'
                    : 'bg-red-50/70 border-red-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#081d38]">{gate.title}</span>
                  {gate.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-700 shrink-0" />
                  )}
                </div>
                <p className={`text-xs ${gate.passed ? 'text-slate-600' : 'text-red-800 font-semibold'}`}>
                  {gate.passed ? gate.passReason : gate.failReason}
                </p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-[#081d38] text-white text-xs flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-[#dfa62a] shrink-0 mt-0.5" />
            <span>
              <strong>Article 7.3 Non-Collusion Rule:</strong> Concierge handles privacy/intake, Columbo verifies arithmetic/conflicts, Pipito enforces written constitutional locks, and an Independent Human Witness co-signs every financial or governance commit.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
