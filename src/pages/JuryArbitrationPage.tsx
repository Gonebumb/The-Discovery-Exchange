import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  FileCheck2,
  Lock,
  RefreshCw,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Users,
} from 'lucide-react';

interface JuryCandidate {
  id: string;
  label: string;
  state: string;
  hasConflict: boolean;
  conflictReason?: string;
}

const SAMPLE_OWNER_JURY_POOL: JuryCandidate[] = [
  { id: 'OWN-104', label: 'Owner #0104 — Public School Parent', state: 'OH', hasConflict: false },
  { id: 'OWN-118', label: 'Owner #0118 — Retired Shop Teacher', state: 'TX', hasConflict: false },
  {
    id: 'OWN-142',
    label: 'Owner #0142 — Related to Disputing Party',
    state: 'CA',
    hasConflict: true,
    conflictReason: 'Article 6.2 Family/Financial Conflict — Auto-Recused',
  },
  { id: 'OWN-179', label: 'Owner #0179 — Auto Technician', state: 'PA', hasConflict: false },
  { id: 'OWN-205', label: 'Owner #0205 — Elementary Educator', state: 'GA', hasConflict: false },
  { id: 'OWN-231', label: 'Owner #0231 — Registered Nurse', state: 'MI', hasConflict: false },
  { id: 'OWN-264', label: 'Owner #0264 — High School Science Teacher', state: 'NC', hasConflict: false },
  { id: 'OWN-288', label: 'Owner #0288 — Small Business Owner', state: 'CO', hasConflict: false },
  {
    id: 'OWN-311',
    label: 'Owner #0311 — Same Property Silo Vendor',
    state: 'FL',
    hasConflict: true,
    conflictReason: 'Article 6.2 Related-Party Contract — Auto-Recused',
  },
  { id: 'OWN-340', label: 'Owner #0340 — School Bus Driver', state: 'IL', hasConflict: false },
  { id: 'OWN-367', label: 'Owner #0367 — Civil Engineer', state: 'WA', hasConflict: false },
  { id: 'OWN-392', label: 'Owner #0392 — Librarian & Parent', state: 'AZ', hasConflict: false },
  { id: 'OWN-415', label: 'Owner #0415 — Electrician', state: 'TN', hasConflict: false },
  { id: 'OWN-449', label: 'Owner #0449 — Community Volunteer', state: 'MN', hasConflict: false },
];

export const JuryArbitrationPage: React.FC = () => {
  const [seatedJury, setSeatedJury] = useState<JuryCandidate[]>(
    SAMPLE_OWNER_JURY_POOL.filter((c) => !c.hasConflict).slice(0, 12)
  );
  const [recusedLog, setRecusedLog] = useState<JuryCandidate[]>(
    SAMPLE_OWNER_JURY_POOL.filter((c) => c.hasConflict)
  );
  const [stopAuthorityTriggered, setStopAuthorityTriggered] = useState(false);

  const handleSimulateJuryDraw = () => {
    const shuffled = [...SAMPLE_OWNER_JURY_POOL].sort(() => Math.random() - 0.5);
    const conflicted = shuffled.filter((c) => c.hasConflict);
    const clean = shuffled.filter((c) => !c.hasConflict).slice(0, 12);
    setRecusedLog(conflicted);
    setSeatedJury(clean);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner — Consistent Compact Layout */}
      <div className="bg-[#081d38] text-white rounded-2xl border-2 border-[#dfa62a] p-6 sm:p-8 space-y-4 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#dfa62a] inline-flex items-center gap-1.5">
            <Scale className="w-4 h-4" />
            <span>Articles 5.3, 6, 7, 16 &amp; 17 &bull; Checks, Balances &amp; Human Review</span>
          </span>
          <span className="px-3 py-1 bg-emerald-500/15 border border-emerald-400/50 text-emerald-300 text-xs font-bold rounded">
            12-Person Human Jury &bull; Dissolves After Verdict
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-1">
          <div className="md:col-span-7 space-y-3">
            <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight">
              12-Person Owner Review Jury &amp; DILOS Accountability
            </h1>
            <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
              Disputes and rule audits operate under <strong>Article 5.3</strong> and <strong>Article 17</strong>: a <strong>12-person Owner Review Jury</strong> is drawn via an auditable random process with conflict-of-interest screening, mandatory recusal, and removal rules, dissolving immediately after publishing findings.
            </p>
          </div>
          <div className="md:col-span-5">
            <div className="rounded-xl overflow-hidden border-2 border-[#dfa62a] bg-slate-950 aspect-[16/9]">
              <img
                src="/src/assets/images/arbitration_board_hero_1794963227628.jpg"
                alt="Internal Arbitration Board — 12-Person Owner Review Jury & Constitutional Fairness"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4-Step DILOS Separation of Powers */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="space-y-1">
          <h2 className="font-serif text-xl font-bold text-[#081d38]">
            The 4-Step DILOS Separation of Powers (Article 7.1, 7.3 &amp; 16.1)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            No single human or AI can ever investigate, gatekeep, and approve an action from start to finish.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-xl bg-[#fbfaf7] border border-slate-200 space-y-1.5">
            <div className="font-bold text-[#081d38] inline-flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-[#b47d12]" />
              <span>1. Concierge (Front-Door Intake)</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              Assigns sequential <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">TDX-</code> tracking numbers and strips private student/Owner PII before saving records.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#fbfaf7] border border-slate-200 space-y-1.5">
            <div className="font-bold text-[#081d38] inline-flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-[#b47d12]" />
              <span>2. Columbo (Investigator AI)</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              Organizes evidence, verifies <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">50/25/25</code> and <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">70/30</code> arithmetic, and flags duplicates or conflicts—never acting as judge.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#fbfaf7] border border-slate-200 space-y-1.5">
            <div className="font-bold text-[#081d38] inline-flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#b47d12]" />
              <span>3. Pipito (Gatekeeper AI)</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              Audits hard constitutional gates (100M DBC cap, debt-free rule, deed-before-DBC, verified escrow) and halts any failing record.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
            <div className="font-bold text-emerald-950 inline-flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-700" />
              <span>4. Independent Human Witness</span>
            </div>
            <p className="text-emerald-900 leading-relaxed">
              A conflict-free human witness (and 12-Owner Jury when applicable) reviews and signs off before any commit to the append-only ledger.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive 12-Person Conflict-Screened Jury Draw Simulator */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#081d38]">
              12-Person Owner Review Jury &amp; Conflict Recusal Simulator (Article 5.3 &amp; 6.2)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Any Owner with a financial, family, or vendor conflict is automatically recused or removed for cause before deliberation begins (illustrative sample profiles only).
            </p>
          </div>
          <button
            type="button"
            onClick={handleSimulateJuryDraw}
            className="px-4 py-2 bg-[#081d38] hover:bg-[#0f2b52] text-[#dfa62a] text-xs font-bold rounded-lg inline-flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Draw New 12-Owner Jury</span>
          </button>
        </div>

        {recusedLog.length > 0 && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1 text-xs text-amber-950">
            <div className="font-bold inline-flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              <span>Mandatory Conflict Recusal Log (Article 6.2):</span>
            </div>
            {recusedLog.map((r) => (
              <div key={r.id}>
                &bull; <strong>{r.label}</strong> ({r.state}) &mdash; {r.conflictReason}
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {seatedJury.map((juror, idx) => (
            <div
              key={juror.id}
              className="p-3.5 rounded-lg bg-[#fbfaf7] border border-slate-200 flex items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-6 h-6 rounded-full bg-[#081d38] text-[#dfa62a] font-bold flex items-center justify-center shrink-0 tabular-nums">
                  {idx + 1}
                </span>
                <span className="font-medium text-slate-900 truncate">{juror.label}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-200/70 text-[#081d38] font-mono font-bold shrink-0">
                {juror.state}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Stop Authority, Whistleblowers & External Court Rights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-serif text-lg font-bold text-[#081d38] inline-flex items-center gap-1.5">
              <ShieldAlert className="w-5 h-5 text-[#b47d12]" />
              <span>Emergency Stop Authority &amp; Whistleblowers (Article 6.4 &amp; 7.5)</span>
            </h3>
            <button
              type="button"
              onClick={() => setStopAuthorityTriggered((prev) => !prev)}
              className={`px-3 py-1 rounded text-xs font-bold cursor-pointer shrink-0 ${
                stopAuthorityTriggered
                  ? 'bg-red-700 text-white'
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
            >
              {stopAuthorityTriggered ? 'PAUSE ACTIVE' : 'Test Stop Authority'}
            </button>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            Any compliance officer or two unrelated Owner Board seat holders can immediately pause any transaction for a credible legal, fraud, safety, or security concern. Confidential whistleblower reports carry strict anti-retaliation protections, and no AI can ever bypass a pause.
          </p>

          {stopAuthorityTriggered && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-900 inline-flex items-center gap-2 w-full">
              <CheckCircle2 className="w-4 h-4 text-red-700 shrink-0" />
              <span>Transaction Paused (Article 7.5): Frozen pending review by a disinterested human panel.</span>
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
          <h3 className="font-serif text-lg font-bold text-[#081d38] inline-flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <span>No Private Court &amp; External Law Preserved (Articles 16.4 &amp; 17.2)</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            An internal Owner Review Jury facilitates fair, transparent community review—it never exercises governmental authority, never denies access to public courts where prohibited by law, never waives nonwaivable rights, and never blocks subpoenas, regulators, or law enforcement.
          </p>
        </div>
      </div>
    </div>
  );
};
