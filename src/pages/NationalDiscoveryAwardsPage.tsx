import React, { useState } from 'react';
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  Lock,
  RefreshCw,
  Scale,
  ShieldCheck,
  Users,
  Video,
} from 'lucide-react';

type NdaTab = 'charter' | 'distribution' | 'workflow' | 'rubric' | 'nominate';

interface RubricCriterion {
  name: string;
  maxPoints: number;
  description: string;
  antiWealthRule: string;
}

const JUDGING_RUBRIC: RubricCriterion[] = [
  {
    name: '1. Grit, Resourcefulness & Everyday Problem-Solving',
    maxPoints: 3,
    description:
      'Did the student solve a real-world problem using everyday household, garage, or school materials rather than expensive store-bought kits?',
    antiWealthRule:
      'High-budget lab kits receive zero bonus points; $15 garage prototypes compete on equal footing.',
  },
  {
    name: '2. Independent Human Thinking (Defending Intelligence in the AI Age)',
    maxPoints: 3,
    description:
      'Does the 2-minute unedited video and surprise verification prompt prove the student truly understands the logic and did the work themselves?',
    antiWealthRule:
      'AI may be used as a research tool, but passive copy-paste or parental takeover fails immediately.',
  },
  {
    name: '3. Measurable Turnaround & Growth (Lifting Working-Class Students)',
    maxPoints: 2,
    description:
      'Demonstrates perseverance, academic or personal turnaround, or overcoming neighborhood and resource hardships.',
    antiWealthRule:
      'Built specifically for working-class, under-resourced students—not an elitist trophy for privileged straight-A resumes.',
  },
  {
    name: '4. Teachers First & Helping Others Learn',
    maxPoints: 2,
    description:
      'Highlights dedicated public school teacher mentorship and whether the student shared knowledge, tutored peers, or improved their classroom/community.',
    antiWealthRule:
      'Honors both the student breakthrough and the public school educator who refused to give up on them.',
  },
];

const TEN_STEP_WORKFLOW = [
  {
    step: 1,
    title: 'Pool Lock & Public Announcement (Funded-First Rule — Article 13.1)',
    detail:
      'An independent CPA verifies exact cash sitting in escrow. Whether a $250k stepping stone or our $1M Local District / $2.5M State / $10M National pools (goal to reach by 2035), a prize tier opens ONLY after 100% of the cash is in the bank.',
  },
  {
    step: 2,
    title: 'Single-Season Oversight Council Draw (6–10 Owners, 1 Season Lifetime Limit)',
    detail:
      'The system randomly selects 6 to 10 Owners from different states to oversee seasonal logistics. Once the season ends, every council member is permanently barred from ever serving on a Prize Council or Judging Panel again.',
  },
  {
    step: 3,
    title: 'Zero-Cost Open Entry & Teacher Nominations (Article 3.1 & 3.3)',
    detail:
      'Any public school teacher, parent/guardian, or student (with guardian consent under Article 4.5) enters at $0 cost within Elementary (Grades 1–5), Middle (6–8), or High School (9–12) across Applied, Analytical, or Hybrid Discovery.',
  },
  {
    step: 4,
    title: '3-Gate Anti-Cheat Video & Educator Attestation',
    detail:
      'Requires: (a) an unedited 2-minute video demonstration by the student; (b) live on-camera answer to a randomized verification question generated at upload; and (c) digital sign-off from a non-family public school teacher or community mentor.',
  },
  {
    step: 5,
    title: 'DILOS Stage 1 — Concierge Intake & Student PII Stripping (Article 7.1 & 8.4)',
    detail:
      'Concierge assigns a permanent TDX-YYYY-XXXXX tracking ID, verifies guardian consent, and strips all personally identifiable information (name, address, phone, school name, zip code, income) before saving the judging file.',
  },
  {
    step: 6,
    title: 'DILOS Stage 2 — Columbo Evidence & Integrity Audit (Article 7.1)',
    detail:
      'Columbo (Investigator AI) checks for duplicate entries, verifies file integrity, and flags any conflict of interest—without ever scoring, ranking, or judging a student.',
  },
  {
    step: 7,
    title: 'DILOS Stage 3 — Pipito Constitutional Gate Check (Article 7.1 & 7.4)',
    detail:
      'Pipito (Gatekeeper AI) audits hard constitutional rules (verified cash in escrow, guardian consent, zero conflicts). If any gate fails, Pipito halts the record automatically.',
  },
  {
    step: 8,
    title: 'Tier 1 Blind 12-Person Out-of-State Owner Review Jury (Article 5.3)',
    detail:
      'Anonymized packets are scored on the published 10-point rubric by a randomly drawn 12-person human Owner Jury residing outside the student’s state.',
  },
  {
    step: 9,
    title: 'Tier 2 Single-Season Specialist Academy & Independent Human Witness (Article 7.3)',
    detail:
      'Top finalists advance to a rotating single-season panel of 6 to 10 vetted public school teachers and subject specialists. Before any award commits, an Independent Human Witness signs off on the full audit trail.',
  },
  {
    step: 10,
    title: 'Append-Only Ledger Commit, Protected Payout & 30-Day Appeal Window (Article 8.3 & 16.3)',
    detail:
      'Funds disburse via dual human authorization to locked student education trusts/529s, direct teacher honoraria, and classroom grants. All TDX- IDs and scores publish openly with a 30-day human appeal route.',
  },
];

export const NationalDiscoveryAwardsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NdaTab>('charter');

  // Interactive Nomination Preview State (Zero PII Stored — Local Preview Only)
  const [nominationRole, setNominationRole] = useState<'teacher' | 'parent' | 'student'>('teacher');
  const [ageDivision, setAgeDivision] = useState<
    'Elementary (K–5)' | 'Middle School (6–8)' | 'High School (9–12)'
  >('High School (9–12)');
  const [category, setCategory] = useState<
    'Applied Discovery' | 'Analytical Discovery' | 'Hybrid Discovery'
  >('Applied Discovery');
  const [projectTitle, setProjectTitle] = useState('');
  const [projectSummary, setProjectSummary] = useState('');
  const [guardianConsent, setGuardianConsent] = useState(false);
  const [educatorVerified, setEducatorVerified] = useState(false);
  const [randomPrompt, setRandomPrompt] = useState<string>(
    'Explain in 30 seconds what broke during your first test and how you fixed it without buying new parts.'
  );
  const [previewTicket, setPreviewTicket] = useState<string | null>(null);

  const VERIFICATION_PROMPTS = [
    'Explain in 30 seconds what broke during your first test and how you fixed it without buying new parts.',
    'Point to the most important part of your project on camera and explain what would happen if you removed it.',
    'Tell the judges one thing your public school teacher helped you understand while building or researching this project.',
    'Explain how another working-class student could recreate your discovery using low-cost everyday materials.',
  ];

  const handleGeneratePrompt = () => {
    const next =
      VERIFICATION_PROMPTS[Math.floor(Math.random() * VERIFICATION_PROMPTS.length)];
    setRandomPrompt(next);
  };

  const handleSimulateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim() || !guardianConsent || !educatorVerified) return;

    try {
      const res = await fetch('/api/nda/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ageDivision,
          category,
          projectTitle,
          projectDescription: projectSummary,
          videoUrl: 'https://thediscoveryexchange.com/studio/verified-2min-entry',
          verificationPromptAnswer: randomPrompt,
          guardianConsentSigned: guardianConsent,
          educatorWitnessEmail: 'mentor@publicschool.edu',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPreviewTicket(data.trackingId);
        return;
      }
    } catch {
      // Fallback preview when static bundle runs without backend
    }

    const code = Math.floor(10000 + Math.random() * 90000);
    setPreviewTicket(`TDX-2026-${code}`);
  };

  return (
    <div className="space-y-6">
      {/* TOP HERO BANNER */}
      <div className="bg-[#081d38] text-white rounded-2xl border-2 border-[#dfa62a] p-6 sm:p-8 space-y-5 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#dfa62a] inline-flex items-center gap-1.5">
            <Award className="w-4 h-4" />
            <span>Article 3 &amp; Article 13 &bull; Flagship Mission of The Discovery Exchange</span>
          </span>
          <span className="px-3 py-1 bg-amber-400/15 border border-[#dfa62a]/60 text-[#dfa62a] text-xs font-bold rounded">
            TheDiscoveryExchange.com &bull; NationalDiscoveryAwards.com
          </span>
        </div>

        <div className="space-y-2 max-w-4xl">
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-white leading-tight">
            National Discovery Awards (NDA)
          </h1>
          <p className="text-base sm:text-lg font-semibold text-[#dfa62a]">
            Teachers First &amp; Lifting Working-Class, Under-Resourced Public School Students
          </p>
          <p className="text-sm text-slate-200 leading-relaxed">
            <em>&ldquo;Let us sit crooked, but let us talk straight &mdash; upholding honor alongside full compliance with the law.&rdquo;</em>{' '}
            The National Discovery Awards is <strong>not</strong> an elitist trophy contest for wealthy straight-A students with private tutors. It is a debt-free real-estate-funded institution designed to honor great public school teachers and uplift working-class students facing everyday hardships.
          </p>
        </div>

        {/* FUNDED-FIRST ESCROW TRANSPARENCY BAR (ARTICLE 13.1) */}
        <div className="bg-slate-950/85 border border-white/15 rounded-xl p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="space-y-0.5">
            <div className="text-[11px] uppercase tracking-wider font-bold text-emerald-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Article 13.1 Funded-First Rule</span>
            </div>
            <div className="text-lg font-mono font-bold text-white tabular-nums">
              100% Funded-First Rule
            </div>
            <p className="text-[11px] text-slate-400">
              No prize tier opens until 100% of verified cash sits in escrow.
            </p>
          </div>

          <div className="space-y-0.5 md:border-l md:border-white/10 md:pl-4">
            <div className="text-[11px] uppercase tracking-wider font-bold text-[#dfa62a]">
              Permanent Engine (Article 11.3)
            </div>
            <div className="text-lg font-bold text-white">30% Net Debt-Free Rent</div>
            <p className="text-[11px] text-slate-400">
              Zero mortgages, zero corporate sponsors; clean net rental flow.
            </p>
          </div>

          <div className="space-y-0.5 md:border-l md:border-white/10 md:pl-4">
            <div className="text-[11px] uppercase tracking-wider font-bold text-sky-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>Prize Ladder — Goal to Reach by 2035</span>
            </div>
            <div className="text-sm sm:text-base font-bold text-white tabular-nums">
              $1M District &bull; $2.5M State &bull; $10M National
            </div>
            <p className="text-[11px] text-slate-400">
              Goal to reach by 2035 as net rent accumulates in escrow.
            </p>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="bg-white border border-slate-200 rounded-xl p-2 flex flex-wrap gap-2">
        {[
          { id: 'charter', label: '1. Mission & 3 Categories' },
          { id: 'distribution', label: '2. 50-Year Money Split (50/25/15/10)' },
          { id: 'workflow', label: '3. 10-Step Annual Workflow & DILOS' },
          { id: 'rubric', label: '4. 10-Point Anti-Wealth Rubric' },
          { id: 'nominate', label: '5. Anti-Cheat Entry & Prompt Simulator' },
        ].map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as NdaTab)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer text-center max-w-full sm:whitespace-nowrap ${
                active
                  ? 'bg-[#081d38] text-[#dfa62a]'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: MISSION & 3 DISCOVERY FRAMEWORKS */}
      {activeTab === 'charter' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2 shadow-xs">
              <div className="text-xs font-mono font-bold text-[#dfa62a]">01</div>
              <h2 className="font-serif text-lg font-bold text-[#081d38]">
                Applied Discovery (Article 3.3)
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                Hands-on building, mechanical or electrical repairs, physical school and neighborhood improvements, and real-world execution using everyday garage or household materials.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2 shadow-xs">
              <div className="text-xs font-mono font-bold text-[#dfa62a]">02</div>
              <h2 className="font-serif text-lg font-bold text-[#081d38]">
                Analytical Discovery (Article 3.3)
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                Deep structural logic, independent research, fact-checking, coding, and mathematical or scientific problem-solving that sharpens independent human critical thinking.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2 shadow-xs">
              <div className="text-xs font-mono font-bold text-[#dfa62a]">03</div>
              <h2 className="font-serif text-lg font-bold text-[#081d38]">
                Hybrid Discovery (Article 3.3)
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed">
                The proven bridge where sharp analytical verification meets active, hands-on real-world execution—plus peer mentorship and helping classmates learn.
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="font-serif text-xl font-bold text-[#081d38]">
              How Everything Connects: The Closed-Loop 50-Year Engine
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#fbfaf7] border border-slate-200 space-y-1.5">
                <div className="text-xs font-bold text-[#081d38]">1. 50/25/25 Marketplace</div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Families buy and sell household goods (Article 12.1): 50% cash to seller, 25% seller property balance, 25% buyer property balance.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#fbfaf7] border border-slate-200 space-y-1.5">
                <div className="text-xs font-bold text-[#081d38]">2. Debt-Free Property Silos</div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Pooled balances buy residential buildings 100% debt-free (Article 10.6) in isolated silos (Article 9.1)—zero mortgages, zero foreclosure risk.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#fbfaf7] border border-slate-200 space-y-1.5">
                <div className="text-xs font-bold text-[#081d38]">3. 70/30 Net Rental Split</div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Clean net rent after bills splits 70% to silo Owners (fighting inflation) and 30% straight to the National Discovery Awards Trust (Article 11.3).
                </p>
              </div>
              <div className="p-4 rounded-xl bg-[#fbfaf7] border border-slate-200 space-y-1.5">
                <div className="text-xs font-bold text-[#081d38]">4. DBC Liquidity (100M Cap)</div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  After deed recording (Article 11.2), Discovery Brick Coins (DBC) provide a clean exit door while the debt-free buildings fund the Prize forever.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 50-YEAR FINANCIAL DISTRIBUTION SCHEDULE */}
      {activeTab === 'distribution' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#081d38]">
              100% Accounted For: Annual Prize Pool Distribution Formula
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every verified dollar inside the segregated National Discovery Awards Trust Account divides into four strict buckets—leaving zero room for administrative bloat or hoarding.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-[#081d38] text-white border border-[#dfa62a]/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#dfa62a]">
                <span>Bucket A</span>
                <span className="text-lg font-mono">50%</span>
              </div>
              <h3 className="font-serif text-base font-bold">
                Direct Working-Class Student Educational Awards
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Protected inside a locked student education trust or 529 Education Savings account for winning public school students—divided equally across Elementary (1/3), Middle (1/3), and High School (1/3).
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#fbfaf7] border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#081d38]">
                <span>Bucket B</span>
                <span className="text-lg font-mono text-[#b47d12]">25%</span>
              </div>
              <h3 className="font-serif text-base font-bold text-[#081d38]">
                “Teachers First” Direct Educator Honoraria (Article 3.1)
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                Paid directly to the nominating or mentoring public school teachers who guided winning students or pioneered classroom breakthroughs in under-resourced working-class schools.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#fbfaf7] border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#081d38]">
                <span>Bucket C</span>
                <span className="text-lg font-mono text-emerald-700">15%</span>
              </div>
              <h3 className="font-serif text-base font-bold text-[#081d38]">
                Classroom &amp; School Resource Grants
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                Disbursed directly to the winning student’s public school classroom or verified homeschool cooperative strictly for books, lab equipment, tools, and learning supplies.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#fbfaf7] border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#081d38]">
                <span>Bucket D</span>
                <span className="text-lg font-mono text-sky-700">10%</span>
              </div>
              <h3 className="font-serif text-base font-bold text-[#081d38]">
                50-Year Permanent Endowment Reinvestment
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                Returned directly into new debt-free property silo acquisitions so the underlying real estate base compounds every decade across the full 50-year horizon.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs sm:text-sm text-amber-950 leading-relaxed">
            <strong>Alignment with Article 14 &amp; Schedule A (1% / 1% / 3% Pool):</strong> Alongside the 95% Owner mission structure, 3% rewards Extraordinary Contributors gradually over 50 years (~0.06% per year), 1% marks Founder allocation, and 1% honors the Future AI Reserve.
          </div>
        </div>
      )}

      {/* TAB 3: 10-STEP ANNUAL WORKFLOW & DILOS */}
      {activeTab === 'workflow' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div className="space-y-1">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#081d38]">
              Step-by-Step Annual Tournament Assembly Line (Steps 1–10)
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every seasonal cycle follows these ten mandatory gates—combining One-Season Owner Councils, the 4-Step DILOS Pipeline, and Blind Out-of-State Juries.
            </p>
          </div>

          <div className="space-y-3">
            {TEN_STEP_WORKFLOW.map((item) => (
              <div
                key={item.step}
                className="p-4 rounded-xl bg-[#fbfaf7] border border-slate-200 flex items-start gap-4"
              >
                <div className="w-8 h-8 rounded-full bg-[#081d38] text-[#dfa62a] font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {item.step}
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-base font-bold text-[#081d38]">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: 10-POINT ANTI-WEALTH JUDGING RUBRIC */}
      {activeTab === 'rubric' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#081d38] flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#dfa62a]" />
                <span>Published 10-Point Blind Judging Rubric</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Used by every 12-person out-of-state Owner Jury and Single-Season Specialist Panel.
              </p>
            </div>
            <span className="px-3 py-1.5 rounded-lg bg-[#081d38] text-[#dfa62a] text-xs font-bold font-mono">
              10.0 Points Total &bull; 8.5+ Advances to Finals
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {JUDGING_RUBRIC.map((c) => (
              <div
                key={c.name}
                className="p-5 rounded-xl bg-[#fbfaf7] border border-slate-200 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif text-base font-bold text-[#081d38]">{c.name}</h3>
                  <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-900 text-xs font-mono font-bold shrink-0">
                    {c.maxPoints} pts
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{c.description}</p>
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-950">
                  <strong>Anti-Elitism Safeguard:</strong> {c.antiWealthRule}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ANTI-CHEAT SUBMISSION & LIVE VIDEO PROMPT SIMULATOR */}
      {activeTab === 'nominate' && (
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-3 text-xs sm:text-sm text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong>Interactive Entry Walkthrough (Article 13.1 &amp; 13.2):</strong> Walk through Concierge PII stripping and test a live randomized 2-minute video verification prompt below.
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <form
              onSubmit={handleSimulateEntry}
              className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Submitter Role</label>
                  <select
                    value={nominationRole}
                    onChange={(e) =>
                      setNominationRole(e.target.value as 'teacher' | 'parent' | 'student')
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="teacher">Public School Teacher</option>
                    <option value="parent">Parent / Guardian</option>
                    <option value="student">Public School Student (With Consent)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">Age Division</label>
                  <select
                    value={ageDivision}
                    onChange={(e) =>
                      setAgeDivision(
                        e.target.value as
                          | 'Elementary (K–5)'
                          | 'Middle School (6–8)'
                          | 'High School (9–12)'
                      )
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="Elementary (K–5)">Elementary (K–5)</option>
                    <option value="Middle School (6–8)">Middle School (6–8)</option>
                    <option value="High School (9–12)">High School (9–12)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Discovery Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(
                        e.target.value as
                          | 'Applied Discovery'
                          | 'Analytical Discovery'
                          | 'Hybrid Discovery'
                      )
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="Applied Discovery">Applied Discovery</option>
                    <option value="Analytical Discovery">Analytical Discovery</option>
                    <option value="Hybrid Discovery">Hybrid Discovery</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Discovery / Classroom Breakthrough Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., $18 PVC & Fishing-Line Hand Helper for Arthritic Grandparents"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Plain-English Summary (Do Not Enter Student Name, Address, or School Name)
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the problem solved, everyday materials used, and how the public school teacher mentored the student..."
                  value={projectSummary}
                  onChange={(e) => setProjectSummary(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              {/* Surprise Video Verification Prompt Generator */}
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#dfa62a] inline-flex items-center gap-1.5">
                    <Video className="w-4 h-4" />
                    <span>Live Surprise 2-Minute Video Prompt (Anti-Cheat Gate)</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleGeneratePrompt}
                    className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>New Random Prompt</span>
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 italic">&ldquo;{randomPrompt}&rdquo;</p>
              </div>

              <div className="space-y-2 pt-1 text-xs text-slate-700">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={guardianConsent}
                    onChange={(e) => setGuardianConsent(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span>
                    <strong>Parent / Guardian Consent (Article 4.5 &amp; 13.2):</strong> I confirm parent or guardian permission for this walkthrough entry (full consent verification applies for live student prize submissions).
                  </span>
                </label>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={educatorVerified}
                    onChange={(e) => setEducatorVerified(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span>
                    <strong>Non-Family Public School Educator Attestation:</strong> A non-family teacher or mentor attests this is the student’s own authentic work.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={!guardianConsent || !educatorVerified}
                className="px-5 py-2.5 bg-[#081d38] hover:bg-[#0f2b52] disabled:opacity-40 text-[#dfa62a] text-xs sm:text-sm font-bold rounded-lg inline-flex items-center gap-2 cursor-pointer"
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>Simulate DILOS Concierge Intake</span>
              </button>
            </form>

            {/* Right Column: Live DILOS Pipeline Output */}
            <div className="lg:col-span-5 bg-[#081d38] text-white rounded-xl border border-[#dfa62a]/50 p-6 space-y-4">
              <div className="flex items-center justify-between gap-2 border-b border-white/15 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#dfa62a]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>DILOS Blind Judging Packet</span>
                </div>
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-white/10 text-emerald-300 font-bold">
                  {previewTicket || 'AWAITING SIMULATION'}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-white/10">
                  <span className="text-slate-300">Student Name &amp; Address:</span>
                  <span className="font-mono font-bold text-emerald-300">
                    STRIPPED BY CONCIERGE
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-white/10">
                  <span className="text-slate-300">School &amp; Zip Code:</span>
                  <span className="font-mono font-bold text-emerald-300">
                    STRIPPED BY CONCIERGE
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-white/10">
                  <span className="text-slate-300">Division &amp; Track:</span>
                  <span className="font-semibold text-white">
                    {ageDivision} &bull; {category}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-white/10">
                  <span className="text-slate-300">Next Pipeline Step:</span>
                  <span className="font-semibold text-[#dfa62a]">
                    Columbo Audit &rarr; Pipito Gate &rarr; 12-Owner Jury
                  </span>
                </div>
              </div>

              {previewTicket && (
                <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-400/40 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Anonymized Packet Created: {previewTicket}</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    Ready for blind scoring by a randomly selected 12-person out-of-state Owner Jury under the 10-point rubric.
                  </p>
                </div>
              )}

              <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-400">
                <FileCheck2 className="w-3.5 h-3.5 shrink-0" />
                <span>Article 7.1, 7.3 &amp; 8.4: Zero AI decision-making; Independent Human Witness commits every award.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
