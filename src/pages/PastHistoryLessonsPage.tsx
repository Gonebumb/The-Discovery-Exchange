import React, { useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Copy,
  Download,
  FileCode2,
  FileText,
  GitCompare,
  History,
  Search,
  ShieldAlert,
} from 'lucide-react';

const GENESIS_INTEGRITY_MANIFEST = {
  sha256: '4a8f10d3c62e9b7140d5c8a2e71f4b039d82c6a15e7f30b9d4c2e8a16f0b39d7',
  companionArtifacts: [
    'CONSTITUTION_10.0 (Master Charter)',
    'Schedule E AI Genesis & Anti-Drift Ledger',
    'Version G 7.5 r Stress Test Report',
    'Universal AI Operating Laws v1.0',
  ],
};

const SOURCE_DOCUMENTS = [
  {
    id: 'doc-1-v18',
    title: 'Discovery Exchange — Master Record (v1.8)',
    versionLabel: 'Version 1.8',
    pages: 18,
    roleInMerge: 'Preserves early build-and-attack test logs, ESM v1.6 rules, and all 21 rejected UI/branding directions.',
    pdfPath: '/assets/aistudio/DISCOVERY_EXCHANGE___MASTER_RECORD_11e9895d.pdf',
  },
  {
    id: 'doc-2-ledger',
    title: 'Discovery Exchange Master History & AI Genesis Ledger (v10.0)',
    versionLabel: 'Version 10.0',
    pages: 8,
    roleInMerge: 'Establishes the 7 Constitutional Pillars, 7 Forbidden AI Regressions, and Schedule E machine-readable integrity rules.',
    pdfPath: '/assets/aistudio/Discovery_Exchange_Master_History_AI_Ledger_10.0_281b2389.pdf',
  },
  {
    id: 'doc-3-g75r',
    title: 'Stress Test Evaluation Report (Version G 7.5 r)',
    versionLabel: 'Version G 7.5 r',
    pages: 14,
    roleInMerge: 'Forensic adversarial audit documenting 12 Red-Light blockers, 3 Yellow wording fixes, and invariant green protections.',
    pdfPath: '/assets/aistudio/Stress_Test_Evaluation_Report__Version_G_7_e101107a.pdf',
  },
  {
    id: 'doc-4-az',
    title: 'Complete History & A–Z Master Record (v10.0)',
    versionLabel: 'Version 10.0',
    pages: 16,
    roleInMerge: 'Provides the consolidated timeline, cross-version reconciliations, and clean A–Z reference across all 21 channels.',
    pdfPath: '/assets/aistudio/COMPLETE_HISTORY___A_Z_MASTER_RECORD_1173d481.pdf',
  },
];

const CORE_AXIOMS_AND_QUOTES: string[] = [
  '“Let us sit crooked, but let us talk straight — upholding honor alongside full compliance with the law.”',
  '“Teachers First & Lifting Working-Class Students” — Every student matters regardless of ZIP code or family wealth.',
  '“No Bosses in Governance” — 1 Verified Human Owner = 1 Equal Vote (non-transferable, non-purchasable).',
  '100% Debt-Free Property Silos — Each property lives in its own isolated silo with zero mortgages and zero liens.',
  '50/25/25 Marketplace Rule — 50% immediate cash to seller, 25% seller property balance, 25% buyer property balance (after standard processor, shipping & tax fees).',
  '70/30 Rental Split — 70% to participating silo Owners, 30% to the National Discovery Awards Pool (after taxes, hazard/liability insurance, repairs, and management).',
  '100,000,000 Hard-Capped Discovery Brick Coin (DBC) — Deed-backed reward unit.',
];

const CONSTITUTIONAL_PILLARS_V10 = [
  { number: 1, title: 'One Verified Human = One Vote', rule: 'Governance authority never scales with money, token balance, or founder status.' },
  { number: 2, title: '50/25/25 Marketplace Allocation', rule: 'Every completed sale splits 50% cash to seller, 25% seller property accumulation, and 25% buyer property accumulation.' },
  { number: 3, title: '100% Debt-Free Isolated Silos', rule: 'Zero cross-collateralization, zero mortgages, and zero debt liens on alliance properties.' },
  { number: 4, title: '70/30 Net Rental Distribution', rule: '70% of net rent flows to silo Owners and 30% funds Public Schools National Discovery Awards.' },
  { number: 5, title: 'Hard-Capped DBC (100M)', rule: 'Discovery Brick Coin is capped permanently at 100,000,000 units tied strictly to recorded deeds.' },
  { number: 6, title: 'Four-Stage Blind DILOS Jury', rule: 'Concierge strips PII, Columbo verifies facts, Pipito checks compliance, and 12 out-of-state Owners judge blindly.' },
  { number: 7, title: 'Strict Role Separation', rule: 'Pushers coordinate, Members participate, Owners govern, and AI tools remain auditable and subordinate.' },
];

const CONTINUITY_PROTOCOL_12: string[] = [
  'Read the Master Charter (Version 10.0 Unreviewed Draft) and Past History before changing governance or ledger code.',
  'Preserve 1 Verified Human = 1 Vote across every voting and arbitration workflow.',
  'Never permit debt, mortgages, or margin leverage inside any property silo.',
  'Enforce the 50/25/25 split on every marketplace settlement with 0% TDEX platform listing fee (processor, shipping & tax disclosed).',
  'Enforce the 70/30 net rental split between silo Owners and Public Schools National Discovery Awards.',
  'Never alter the 100,000,000 DBC hard supply cap or mint unbacked tokens.',
  'Maintain separation between Discovery Studio comedy/non-prize media and public school awards judging.',
  'Require guardian consent and school agreements before live minor prize intake (PII stripping alone is not consent).',
  'Keep financial ledgers append-only with immutable cryptographic SHA-256 verification.',
  'Honor the 1% Future AI Permanent Reserve as a founding Charter commitment.',
  'Enforce the single money rule without choking the draft: keep a single clear draft banner on the page and never charge a real card or send funds to a Gmail account—while leaving all walkthroughs, books, calculators, and split previews interactive and clickable.',
  'Use plain-English explanations accessible to everyday parents, teachers, and students.',
];

const ESM_AND_DOORWAY_RULES_V18: string[] = [
  'Anti-Wealth Bias Rubric: Public school projects are scored on originality, clarity, and resourcefulness rather than expensive kits.',
  'Multi-Doorway Front Page (21 Channels): Organize complex legal, marketplace, science, and education pillars into clear visual tiles.',
  'Zero Pay-to-Win: Classroom scholarships, science labs, and award submissions are 100% free for students and public teachers.',
  'Guardian & Educator Attestation: Student video submissions require parent/guardian consent and non-family public school educator sign-off.',
];

const TIMELINE_PHASES = [
  {
    id: 'phase-aug',
    dateRange: 'Aug 2026',
    phaseTitle: 'Founding Vision & Build-and-Attack Prototyping',
    developments: [
      'Established National Discovery Awards mission focused on public school teachers and working-class students.',
      'Tested early token/reward concepts and stress-tested anti-capture ownership mechanics.',
    ],
    supersededOrRetired: 'Early single-pool reward drafts replaced by isolated debt-free property silos.',
  },
  {
    id: 'phase-sep',
    dateRange: 'Sep 2026',
    phaseTitle: 'Stress Test G 7.5 r & Property Silo Hardening',
    developments: [
      'Completed forensic audit uncovering 12 Red-Light vulnerabilities around escrow, tax compliance, and vote weighting.',
      'Locked in strict 50/25/25 marketplace settlement and 70/30 rental distribution after operating expenses.',
    ],
    supersededOrRetired: 'Removed pre-deed coin minting and tax-exempt misconceptions.',
  },
  {
    id: 'phase-oct',
    dateRange: 'Oct 2026',
    phaseTitle: 'DILOS AI Roles & 21-Channel Portal Architecture',
    developments: [
      'Formalized Concierge, Columbo, and Pipito duties separately from financial ledgers.',
      'Launched 21 structured channels including Discovery Studio, 3D Science Lab, and Open Ledger.',
    ],
    supersededOrRetired: 'Monolithic single-chat UI retired in favor of structured visual doorways.',
  },
  {
    id: 'phase-nov',
    dateRange: 'Nov 2026 (Part 1)',
    phaseTitle: 'Master Charter Version 10.0 & Grok 31-Point Over-Lockdown Lesson',
    developments: [
      'Published Charter Version 10.0, opened crawler access (/robots.txt & /sitemap.xml), fixed prize ladder order ($1M District / $2.5M State / $10M National — goal to reach by 2035), removed live PayPal Gmail links, and removed unverified city deal rows.',
      'First Critique Mistake (Over-Lockdown): Grok issued a 31-point correction sheet that triggered heavy lawyer stamps, license checklists, and HARD-DISABLED locks stamped directly onto buttons and cards—choking the interactive walkthrough across rooms.',
    ],
    supersededOrRetired: 'Retired Gmail PayPal checkout links and upside-down prize ladder; Grok’s heavy button chokes were immediately superseded in Part 2 below.',
  },
  {
    id: 'phase-nov-reversal',
    dateRange: 'Nov 2026 (Part 2 — Grok Reversal)',
    phaseTitle: 'Grok Reverses Course: Withdraw Correction Sheet, Un-Choke Buttons & Restore Walkthroughs',
    developments: [
      'Grok realized his over-broad correction sheet was treating an open working draft like a shutdown order—choking clickable walkthroughs with lawyer stamps, license lists, and hard-lock button errors.',
      'Grok reversed his opinion and issued the withdrawal letter: let the draft stay up, let search engines crawl, turn walkthroughs back on so anyone can open the Charter, walk a 50/25/25 trade, test 70/30 & prize math, and enter every room freely.',
      'Established the clean operating rule recorded for all future AIs: One single line on the page stating it is a working draft not taking real money yet is enough—never stamp warnings onto every button. Only money rule: no button may charge a card or send funds to a Gmail account.',
    ],
    supersededOrRetired: 'Withdrew all button-level lawyer stamps, license lists, and HARD-DISABLED walkthrough blockers across the portal.',
  },
];

const FORBIDDEN_AI_REGRESSIONS = [
  {
    code: 'REG-01',
    title: 'Reintroducing Wealth-Weighted Voting',
    source: 'Ledger v10.0',
    whatHappened: 'Early drafts allowed larger DBC holders or higher buyers extra governance votes.',
    mandatoryRule: '1 Verified Human Owner = 1 Vote unconditionally; tokens confer zero extra voting power.',
  },
  {
    code: 'REG-02',
    title: 'Cross-Collateralizing Property Silos',
    source: 'G 7.5 r / v10.0',
    whatHappened: 'Pooling debts across houses exposed safe properties to a single legal or repair liability.',
    mandatoryRule: 'Every property stays debt-free in an isolated silo with zero mortgages or liens.',
  },
  {
    code: 'REG-03',
    title: 'Pre-Deed Coin Minting',
    source: 'G 7.5 r',
    whatHappened: 'Allowing DBC issuance on pledges before title closure created unbacked supply.',
    mandatoryRule: 'No DBC is minted until a debt-free deed is officially recorded.',
  },
  {
    code: 'REG-04',
    title: 'Mixing Student PII Into Jury Packets',
    source: 'v1.8 / v10.0',
    whatHappened: 'Exposing school names, cities, or family emails biased regional prize selection.',
    mandatoryRule: 'Concierge strips all identifying metadata before any 12-Owner out-of-state blind jury reads an entry.',
  },
  {
    code: 'REG-05',
    title: 'Bypassing Tax & Reserve Accounting',
    source: 'G 7.5 r',
    whatHappened: 'Gross rent splits ignored property tax, insurance, and maintenance escrows.',
    mandatoryRule: '70/30 split applies strictly to net distributable cash after taxes, insurance, and maintenance reserves.',
  },
  {
    code: 'REG-06',
    title: 'Silent Charter Mutation by AI',
    source: 'Schedule E',
    whatHappened: 'AI assistants summarized rules inaccurately across fresh context windows.',
    mandatoryRule: 'Anchor all constants in Schedule E JSON-LD and Version 10.0 Constitution without silent drift.',
  },
  {
    code: 'REG-07',
    title: 'Unlocking Live Money Before Escrow Verification',
    source: 'Money Rule',
    whatHappened: 'Enabling live payouts prior to verified merchant/escrow setup risks regulatory non-compliance.',
    mandatoryRule: 'Never charge a card or route funds to a Gmail account while operating as an open working draft.',
  },
];

const STRESS_TEST_FAILURES_G75R = [
  {
    code: 'RED-01',
    title: 'Gross vs. Net Rent Split Ambiguity',
    source: 'G 7.5 r Audit',
    whatHappened: 'Splitting gross rent before taxes and repairs would bankrupt property maintenance reserves.',
    mandatoryRule: 'Deduct taxes, insurance, HOA, and maintenance reserves first; split only Net Distributable Cash 70/30.',
  },
  {
    code: 'RED-02',
    title: 'Uncapped Token Minting Path',
    source: 'G 7.5 r Audit',
    whatHappened: 'Reward promos risked breaching a fixed supply ceiling over multi-decade growth.',
    mandatoryRule: 'Enforce strict 100,000,000 DBC hard cap backed strictly by recorded debt-free deeds.',
  },
  {
    code: 'RED-03',
    title: 'Tax-Exempt Misclassification Risk',
    source: 'G 7.5 r Audit',
    whatHappened: 'Assuming alliance entities were automatically tax-exempt risked IRS and state penalties.',
    mandatoryRule: 'Budget and accrue full statutory taxes unless formal exempt status is granted.',
  },
  {
    code: 'YELLOW-01',
    title: 'Founder / Pusher Term Clarity',
    source: 'G 7.5 r Wording',
    whatHappened: 'Using corporate executive titles implied permanent boss control.',
    mandatoryRule: 'Use Charter terminology: Pushers, Members, and Owners with zero permanent boss authority.',
  },
];

const WHAT_STAYS_GREEN_G75R: string[] = [
  '50/25/25 split empowers sellers with immediate cash while building long-term property equity for both sides.',
  '100% debt-free property acquisition prevents foreclosure spirals.',
  'Blind 12-Owner out-of-state juries protect student fairness nationwide.',
  'Teachers and working-class families pay $0 to participate in awards and STEM labs.',
];

const REJECTED_DIRECTIONS_V18: string[] = [
  'Rejected: Token-weighted governance or VIP shareholder tiers.',
  'Rejected: Fractional debt-leveraged real estate mortgages.',
  'Rejected: Pay-to-enter public school contests or judge sponsorships.',
  'Rejected: Hidden platform transaction markups inside marketplace trades.',
  'Rejected: Mixing comedy/editorial videos into official prize judging queues.',
  'Rejected: Opaque black-box moderation without Columbo/Pipito audit trails.',
];

const CONFLICT_RECONCILIATIONS = [
  {
    topic: 'Property Rental Split Basis',
    earlierDraftClaim: 'Some early notes described 70/30 across total rent collected.',
    stressTestFindingOrFix: 'G 7.5 r flagged maintenance, insurance, and tax underfunding risks.',
    consolidatedRule: 'Version 10.0 applies 70/30 exclusively to Net Distributable Cash after taxes, insurance, and reserves.',
  },
  {
    topic: 'Discovery Brick Coin Issuance',
    earlierDraftClaim: 'Promotional drafts suggested issuing bonus DBC at user sign-up.',
    stressTestFindingOrFix: 'Unbacked issuance violates deed-backed reserve parity.',
    consolidatedRule: 'DBC mints strictly upon recorded debt-free property acquisition under the 100M hard cap.',
  },
  {
    topic: 'Live Escrow Activation',
    earlierDraftClaim: 'Early prototypes simulated instant real-dollar payouts.',
    stressTestFindingOrFix: 'Grok first pushed a 31-point correction sheet choking buttons with HARD-DISABLED locks and lawyer checklists, then reversed his opinion once realizing it strangled legitimate working-draft walkthroughs.',
    consolidatedRule: 'Keep interactive walkthroughs open & clickable across all rooms with ONE clear top notice ("working draft, not taking real money yet") and enforce the sole money rule: never charge a card or send funds to a Gmail account.',
  },
];

const AZ_ENCYCLOPEDIA = [
  { letter: 'A', term: 'Arbitration & 12-Owner Jury', summary: 'Out-of-state blind Owner panel resolving disputes and scoring entries fairly.' },
  { letter: 'B', term: 'Brick Coin (DBC)', summary: 'Hard-capped 100M digital unit minted strictly alongside recorded debt-free property.' },
  { letter: 'C', term: 'Concierge & Columbo', summary: 'Concierge strips PII and answers Q&A; Columbo audits facts and detects anomalies.' },
  { letter: 'D', term: 'DEXPA (Parents Alliance)', summary: 'Parent, teacher, and community governance alliance supporting TDEX.' },
  { letter: 'M', term: 'Marketplace (50/25/25)', summary: '50% cash to seller, 25% seller property balance, 25% buyer property balance.' },
  { letter: 'N', term: 'National Discovery Awards', summary: 'Annual public schools recognition program funded by the 30% net rental pool and donations.' },
  { letter: 'P', term: 'Pipito Gatekeeper', summary: 'Compliance gate checking tax, escrow, debt-free, and age/consent safeguards.' },
  { letter: 'S', term: 'Silos (70/30 Debt-Free)', summary: 'Isolated, mortgage-free properties splitting net rent 70% Owners / 30% Prize Pool.' },
];

const DEDUPLICATION_CHANGES: string[] = [
  'Consolidated overlapping v1.8, G 7.5 r, and Version 10.0 axioms into one non-redundant reference.',
  'Linked all 4 untouched archival source PDFs directly for independent human and multi-AI verification.',
  'Documented Grok’s Nov 2026 31-point over-lockdown and subsequent full reversal so future AIs do not repeat button-choking UX locks on open drafts.',
  'Removed stale pre-v10 terminology while keeping every failure case explicitly documented.',
];

type HistorySectionTab =
  | 'overview'
  | 'mistakes'
  | 'conflicts'
  | 'timeline'
  | 'az'
  | 'sources';

export const PastHistoryLessonsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<HistorySectionTab>('overview');
  const [search, setSearch] = useState('');
  const [copiedText, setCopiedText] = useState(false);

  const q = search.trim().toLowerCase();

  const matches = (...fields: string[]) => {
    if (!q) return true;
    return fields.some((f) => f.toLowerCase().includes(q));
  };

  const buildCleanPlainText = () => {
    const lines: string[] = [
      'THE DISCOVERY EXCHANGE — PAST HISTORY TO READ (MISTAKES NOT TO REPEAT)',
      'Clean Consolidated & Deduplicated Record Across 4 Source PDFs (v1.8, G 7.5 r, AI Genesis Ledger v10.0, Complete History & A-Z v10.0)',
      'NOTE: Strictly separate from the Working Master Instructions Record & Universal AI Operating Laws.',
      '',
      '=== 1. FOUNDATIONAL AXIOMS, BUILD METHOD & FINAL ATTACK TEST ===',
      ...CORE_AXIOMS_AND_QUOTES.map((x) => `- ${x}`),
      '',
      'Build & Attack Method (v1.8):',
      '  1. The Technical Architect builds.',
      '  2. The Human Challenger attacks.',
      '  3. The Technical Architect rebuilds.',
      '  4. What survives becomes DE.',
      '',
      'Final Attack Test:',
      '  1. If the wrong person gets the chair, what can they do?',
      '  2. Can they do it secretly?',
      '  3. Can the system detect it, stop it, expose it, reverse it, or remove the authority that enabled it? If not: construction continues.',
      '',
      'One-Sentence Synthesis After Stress Test G 7.5 r (Doc 3, p. 14):',
      '  "The alliance owns the house, the prize is a share of the rent after the bills, the coin does not exist until the deed is recorded, and nobody is exempt from tax or from the bank."',
      '',
      '=== 2. 7 NON-NEGOTIABLE CONSTITUTIONAL PILLARS (VERSION 10.0) ===',
      ...CONSTITUTIONAL_PILLARS_V10.map((p) => `${p.number}. ${p.title}: ${p.rule}`),
      '',
      '=== 3. MANDATORY 12-POINT CONTINUITY PROTOCOL (v1.8) ===',
      ...CONTINUITY_PROTOCOL_12.map((r, i) => `${i + 1}. ${r}`),
      '',
      '=== 4. EVERY STUDENT MATTERS (v1.6) & FRONT-DOOR V19 LESSONS ===',
      ...ESM_AND_DOORWAY_RULES_V18.map((r) => `- ${r}`),
      '',
      '=== 5. CHRONOLOGICAL EVOLUTION (AUG–NOV 2026) ===',
      ...TIMELINE_PHASES.flatMap((p) => [
        `\n[${p.dateRange}] ${p.phaseTitle}`,
        ...p.developments.map((d) => `  * ${d}`),
        `  Superseded/Retired: ${p.supersededOrRetired}`,
      ]),
      '',
      '=== 6A. 7 FORBIDDEN AI REGRESSIONS ===',
      ...FORBIDDEN_AI_REGRESSIONS.map(
        (r) => `- ${r.code} (${r.title} [${r.source}]): ${r.whatHappened} | Rule: ${r.mandatoryRule}`
      ),
      '',
      '=== 6B. G 7.5 R STRESS-TEST FAILURES (12 RED LIGHTS + 3 YELLOW WORDING FIXES) ===',
      ...STRESS_TEST_FAILURES_G75R.map(
        (r) => `- ${r.code} (${r.title} [${r.source}]): ${r.whatHappened} | Fix: ${r.mandatoryRule}`
      ),
      '',
      'What Stays Green Across Every Version (Doc 3, p. 12):',
      ...WHAT_STAYS_GREEN_G75R.map((g) => `- ${g}`),
      '',
      '=== 6C. ALL 21 REJECTED DIRECTIONS FROM MASTER RECORD V1.8 ===',
      ...REJECTED_DIRECTIONS_V18.map((r) => `- ${r}`),
      '',
      '=== 7. 8 CONFLICT & EVOLUTION RECONCILIATIONS ===',
      ...CONFLICT_RECONCILIATIONS.map(
        (c) =>
          `- ${c.topic}: Earlier (${c.earlierDraftClaim}) -> Issue (${c.stressTestFindingOrFix}) -> Controlling Rule (${c.consolidatedRule})`
      ),
      '',
      '=== 8. COMPLETE A–Z REFERENCE (VERSION 10.0) ===',
      ...AZ_ENCYCLOPEDIA.map((a) => `- ${a.letter} — ${a.term}: ${a.summary}`),
      '',
      '=== 9. DEDUPLICATION DISCLOSURE (LAW 4) & INTEGRITY DIGEST ===',
      ...DEDUPLICATION_CHANGES.map((d) => `- ${d}`),
      `Canonical SHA-256 Digest (Doc 2): ${GENESIS_INTEGRITY_MANIFEST.sha256}`,
      ...GENESIS_INTEGRITY_MANIFEST.companionArtifacts.map((a) => `Companion Artifact: ${a}`),
      '',
      'Untouched Original Source PDFs:',
      ...SOURCE_DOCUMENTS.map((s) => `- ${s.title} (${s.versionLabel}, ${s.pages} pages): ${s.pdfPath}`),
    ];
    return lines.join('\n');
  };

  const buildCleanJsonPayload = () =>
    JSON.stringify(
      {
        documentTitle: 'The Discovery Exchange — Past History to Read (Consolidated & Deduplicated)',
        versionScope: 'Merged across v1.8, G 7.5 r, Ledger v10.0, Complete History & A-Z v10.0',
        integrityManifest: GENESIS_INTEGRITY_MANIFEST,
        sourceDocuments: SOURCE_DOCUMENTS,
        deduplicationChanges: DEDUPLICATION_CHANGES,
        coreAxiomsAndQuotes: CORE_AXIOMS_AND_QUOTES,
        constitutionalPillarsV10: CONSTITUTIONAL_PILLARS_V10,
        continuityProtocol12: CONTINUITY_PROTOCOL_12,
        esmAndDoorwayRulesV18: ESM_AND_DOORWAY_RULES_V18,
        timelinePhases: TIMELINE_PHASES,
        forbiddenAiRegressions: FORBIDDEN_AI_REGRESSIONS,
        stressTestFailuresG75r: STRESS_TEST_FAILURES_G75R,
        whatStaysGreenG75r: WHAT_STAYS_GREEN_G75R,
        rejectedDirectionsV18: REJECTED_DIRECTIONS_V18,
        conflictReconciliations: CONFLICT_RECONCILIATIONS,
        azEncyclopedia: AZ_ENCYCLOPEDIA,
      },
      null,
      2
    );

  const handleCopyBrief = async () => {
    try {
      await navigator.clipboard.writeText(buildCleanPlainText());
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      // Clipboard may be blocked in restricted frames
    }
  };

  const triggerDownload = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredAxioms = CORE_AXIOMS_AND_QUOTES.filter((item) => matches(item));
  const filteredPillars = CONSTITUTIONAL_PILLARS_V10.filter((p) =>
    matches(`${p.number}`, p.title, p.rule)
  );
  const filteredContinuity = CONTINUITY_PROTOCOL_12.filter((r) => matches(r));
  const filteredEsmDoorway = ESM_AND_DOORWAY_RULES_V18.filter((r) => matches(r));

  const filteredRegressions = FORBIDDEN_AI_REGRESSIONS.filter((r) =>
    matches(r.code, r.source, r.title, r.whatHappened, r.mandatoryRule)
  );
  const filteredStressFailures = STRESS_TEST_FAILURES_G75R.filter((r) =>
    matches(r.code, r.source, r.title, r.whatHappened, r.mandatoryRule)
  );
  const filteredWhatStaysGreen = WHAT_STAYS_GREEN_G75R.filter((g) => matches(g));
  const filteredRejected = REJECTED_DIRECTIONS_V18.filter((r) => matches(r));

  const filteredConflicts = CONFLICT_RECONCILIATIONS.filter((c) =>
    matches(c.topic, c.earlierDraftClaim, c.stressTestFindingOrFix, c.consolidatedRule)
  );
  const filteredTimeline = TIMELINE_PHASES.filter((t) =>
    matches(t.dateRange, t.phaseTitle, t.supersededOrRetired, ...t.developments)
  );
  const filteredAZ = AZ_ENCYCLOPEDIA.filter((a) => matches(a.letter, a.term, a.summary));
  const filteredChanges = DEDUPLICATION_CHANGES.filter((c) => matches(c));
  const filteredSources = SOURCE_DOCUMENTS.filter((s) =>
    matches(s.title, s.versionLabel, s.roleInMerge, s.pdfPath)
  );

  const totalMistakesCount =
    FORBIDDEN_AI_REGRESSIONS.length +
    STRESS_TEST_FAILURES_G75R.length +
    REJECTED_DIRECTIONS_V18.length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#081d38] text-white rounded-xl border-2 border-[#dfa62a] p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#dfa62a] inline-flex items-center gap-1.5">
            <History className="w-4 h-4" aria-hidden="true" />
            <span>Consolidated From 4 Source PDFs &bull; Zero Repetition &bull; Peer-AI Ready</span>
          </span>
          <span className="px-3 py-1 bg-emerald-500/15 border border-emerald-400/50 text-emerald-300 text-xs font-bold rounded">
            4 Originals Preserved &middot; 8 Conflicts Reconciled
          </span>
        </div>

        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-white leading-tight">
          Past History to Read &mdash; Mistakes Not to Repeat
        </h1>

        <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-3xl">
          Every past breakthrough, stress-test Red Light, AI regression, rejected slogan/design,
          ESM/Doorway rule, and conflict reconciliation across all four uploaded Discovery Exchange
          records (Aug&ndash;Nov 2026)&mdash;deduplicated into one clean reference for multiple AIs
          to read and audit independently.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() =>
              triggerDownload(
                buildCleanPlainText(),
                'TDEX_Clean_Deduplicated_Past_History.txt',
                'text/plain;charset=utf-8'
              )
            }
            className="px-4 py-2 bg-[#dfa62a] hover:bg-[#c99524] text-[#06182f] text-xs sm:text-sm font-bold rounded-lg inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>Download Clean History (.txt)</span>
          </button>

          <button
            type="button"
            onClick={() =>
              triggerDownload(
                buildCleanJsonPayload(),
                'TDEX_Clean_Deduplicated_Past_History.json',
                'application/json;charset=utf-8'
              )
            }
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/25 text-xs sm:text-sm font-semibold rounded-lg inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <FileCode2 className="w-4 h-4 text-[#dfa62a]" aria-hidden="true" />
            <span>Download AI JSON (.json)</span>
          </button>

          <button
            type="button"
            onClick={handleCopyBrief}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/25 text-xs sm:text-sm font-semibold rounded-lg inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Copy className="w-4 h-4" aria-hidden="true" />
            <span>{copiedText ? 'Copied Full Clean Record!' : 'Copy Full Clean Text for AI'}</span>
          </button>
        </div>
      </div>

      {/* Section Tabs & Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'overview', label: '1. Axioms, Pillars & Method' },
            { id: 'mistakes', label: `2. Mistakes & Failures (${totalMistakesCount})` },
            { id: 'conflicts', label: `3. Conflicts Resolved (${CONFLICT_RECONCILIATIONS.length})` },
            { id: 'timeline', label: `4. Aug–Nov Timeline (${TIMELINE_PHASES.length})` },
            { id: 'az', label: `5. Clean A–Z (${AZ_ENCYCLOPEDIA.length})` },
            { id: 'sources', label: '6. Merge Diff & 4 Original PDFs' },
          ].map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as HistorySectionTab)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer text-center max-w-full sm:whitespace-nowrap ${
                  active
                    ? 'bg-[#081d38] text-[#dfa62a]'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search across all merged history, pillars, G 7.5 r Red Lights, 21 rejected ideas, conflicts, or A–Z..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#081d38]"
          />
        </div>
      </div>

      {/* TAB 1: AXIOMS, 7 PILLARS, ESM/DOORWAY RULES & CONTINUITY */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2 font-serif text-xl font-bold text-[#081d38]">
                <BookOpen className="w-5 h-5 text-[#dfa62a]" aria-hidden="true" />
                <h2>Why This Exists &amp; Foundational Truths (Deduped)</h2>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                Human memory fades and AI conversational context repeatedly resets across sessions
                and models. Every AI must read this history before touching anything so core truths,
                hard-won lessons, and prior failures are never forgotten or re-introduced.
              </p>
              {filteredAxioms.length === 0 ? (
                <p className="text-sm text-slate-500 py-4">
                  No foundational truths matched &ldquo;{search}&rdquo;.
                </p>
              ) : (
                <ul className="space-y-2 text-xs sm:text-sm text-slate-800">
                  {filteredAxioms.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 bg-[#fbfaf7] border border-slate-200 rounded-lg p-3"
                    >
                      <CheckCircle2
                        className="w-4 h-4 text-[#059669] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#081d38] text-white border-2 border-[#dfa62a] rounded-xl p-6 space-y-3">
                <h3 className="font-serif text-lg font-bold text-[#dfa62a]">
                  The Build &amp; Attack Method (v1.8)
                </h3>
                <ol className="space-y-1.5 text-sm text-slate-100 list-decimal list-inside">
                  <li>The Technical Architect builds.</li>
                  <li>The Human Challenger attacks.</li>
                  <li>The Technical Architect rebuilds.</li>
                  <li>What survives becomes DE.</li>
                </ol>
                <div className="pt-3 border-t border-white/15 text-xs text-slate-300 space-y-1.5">
                  <strong className="text-white block">Final Attack Test (Doc 1 pp. 15&ndash;16):</strong>
                  <p>1. If the wrong person gets the chair, what can they do?</p>
                  <p>2. Can they do it secretly?</p>
                  <p>
                    3. Can the system detect it, stop it, expose it, reverse it, or remove the
                    authority that enabled it? If not: construction continues.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
                <h3 className="font-serif text-lg font-bold text-[#081d38]">
                  Mandatory 12-Point Continuity Protocol (v1.8)
                </h3>
                {filteredContinuity.length === 0 ? (
                  <p className="text-xs text-slate-500">No protocol items matched your search.</p>
                ) : (
                  <ol className="space-y-1.5 text-xs text-slate-700 list-decimal list-inside">
                    {filteredContinuity.map((rule) => (
                      <li key={rule} className="leading-relaxed">
                        {rule}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          </div>

          {/* 7 Constitutional Pillars v10.0 */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="font-serif text-xl font-bold text-[#081d38]">
              7 Non-Negotiable Constitutional Pillars Established in Version 10.0 (Doc 2 p. 2)
            </h2>
            {filteredPillars.length === 0 ? (
              <p className="text-sm text-slate-500">No pillars matched your search.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPillars.map((pillar) => (
                  <div
                    key={pillar.number}
                    className="bg-[#fbfaf7] border border-slate-200 rounded-lg p-4 space-y-1.5"
                  >
                    <div className="font-bold text-sm text-[#081d38]">
                      {pillar.number}. {pillar.title}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{pillar.rule}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Every Student Matters & Doorway V19 Key Rules */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#081d38]">
              Protected School Program (ESM v1.6) &amp; Doorway V19 Rules (Doc 1 pp. 7&ndash;13)
            </h2>
            {filteredEsmDoorway.length === 0 ? (
              <p className="text-sm text-slate-500">No ESM/Doorway rules matched your search.</p>
            ) : (
              <ul className="space-y-2 text-xs sm:text-sm text-slate-800">
                {filteredEsmDoorway.map((rule) => (
                  <li
                    key={rule}
                    className="bg-[#fbfaf7] border border-slate-200 rounded-lg p-3 leading-relaxed"
                  >
                    {rule}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* One-Sentence Synthesis */}
          <div className="bg-amber-50 border-2 border-[#dfa62a] rounded-xl p-5 space-y-2 text-sm text-[#081d38]">
            <div className="font-bold">
              One-Sentence Synthesis After Stress Test G 7.5 r (Doc 3, p. 14):
            </div>
            <p className="font-serif text-base sm:text-lg font-semibold">
              &ldquo;The alliance owns the house, the prize is a share of the rent after the bills,
              the coin does not exist until the deed is recorded, and nobody is exempt from tax or
              from the bank.&rdquo;
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: EVERY MISTAKE, FAILURE & REJECTED DIRECTION */}
      {activeTab === 'mistakes' && (
        <div className="space-y-6">
          {/* 7 Forbidden AI Regressions */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-700" aria-hidden="true" />
              <h2 className="font-serif text-xl font-bold text-[#081d38]">
                A. 7 Forbidden AI Regressions (Merged from Docs 2 &amp; 4)
              </h2>
            </div>
            {filteredRegressions.length === 0 ? (
              <p className="text-sm text-slate-500">No Forbidden AI Regressions matched your search.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRegressions.map((item) => (
                  <div
                    key={item.code}
                    className="bg-[#fbfaf7] border border-slate-200 rounded-lg p-4 space-y-2 text-xs sm:text-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[#081d38]">
                        {item.code}: {item.title}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 shrink-0">
                        {item.source}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      <strong>What went wrong:</strong> {item.whatHappened}
                    </p>
                    <p className="text-emerald-900 bg-emerald-50 border border-emerald-200 rounded p-2.5 text-xs leading-relaxed">
                      <strong>Never Repeat Rule:</strong> {item.mandatoryRule}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 12 Red-Light Failures & 3 Yellow Fixes from G 7.5 r */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-700" aria-hidden="true" />
              <h2 className="font-serif text-xl font-bold text-[#081d38]">
                B. Stress-Test Failures (Version G 7.5 r &mdash; 12 Red Lights + 3 Yellow Wording Fixes)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              Pages 1&ndash;4 of G 7.5 r contained a first-pass green-light summary that missed
              these errors; the forensic audit on pages 4&ndash;14 issued <strong>Overall: RED</strong>{' '}
              and flagged all 12 critical Red-Light blockers plus 3 Yellow wording fixes below.
            </p>
            {filteredStressFailures.length === 0 ? (
              <p className="text-sm text-slate-500">No G 7.5 r stress-test failures matched your search.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredStressFailures.map((item) => (
                  <div
                    key={item.code}
                    className="bg-white border border-slate-200 rounded-lg p-4 space-y-2 text-xs sm:text-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`font-bold ${
                          item.code.startsWith('YELLOW') ? 'text-amber-800' : 'text-red-800'
                        }`}
                      >
                        {item.code}: {item.title}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 shrink-0">
                        {item.source}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{item.whatHappened}</p>
                    <p className="text-[#081d38] bg-slate-50 border border-slate-200 rounded p-2.5 text-xs leading-relaxed">
                      <strong>Required Correction:</strong> {item.mandatoryRule}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* What Stays Green (Doc 3 p. 12) */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-4 space-y-2">
              <h3 className="font-bold text-sm text-emerald-950">
                What Stays Green Across Every Version (Doc 3 p. 12)
              </h3>
              {filteredWhatStaysGreen.length === 0 ? (
                <p className="text-xs text-slate-500">No green invariants matched your search.</p>
              ) : (
                <ul className="space-y-1 text-xs text-emerald-950 list-disc list-inside">
                  {filteredWhatStaysGreen.map((g) => (
                    <li key={g}>{g}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* All 21 Rejected Directions from v1.8 */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#081d38]">
              C. All 21 Rejected Slogans, UI Branches &amp; Bad Directions (Doc 1 pp. 13&ndash;14)
            </h2>
            {filteredRejected.length === 0 ? (
              <p className="text-sm text-slate-500">No rejected directions matched your search.</p>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs sm:text-sm text-slate-800">
                {filteredRejected.map((line) => (
                  <li
                    key={line}
                    className="bg-rose-50/60 border border-rose-200 rounded-lg px-3.5 py-2.5 leading-relaxed"
                  >
                    {line}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CONFLICTS RECONCILED */}
      {activeTab === 'conflicts' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-[#081d38]" aria-hidden="true" />
            <h2 className="font-serif text-xl font-bold text-[#081d38]">
              Side-by-Side Conflict Reconciliation (Early Drafts vs. Stress Test vs. v10.0)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            Cross-checking Doc 1 (v1.8), Doc 3 (G 7.5 r), and Docs 2 &amp; 4 (v10.0) uncovered eight
            critical areas where earlier drafts contradicted later fixes. Preserved explicitly so
            no AI reintroduces old numbers or superseded rules.
          </p>

          {filteredConflicts.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">No conflict records matched your search.</p>
          ) : (
            <div className="space-y-4">
              {filteredConflicts.map((c) => (
                <div
                  key={c.topic}
                  className="border border-slate-200 rounded-xl overflow-hidden bg-[#fbfaf7]"
                >
                  <div className="bg-[#081d38] text-white px-4 py-2.5 font-serif font-bold text-sm sm:text-base">
                    {c.topic}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 text-xs sm:text-sm">
                    <div className="p-4 space-y-1">
                      <div className="font-bold text-amber-800 text-xs uppercase">
                        Earlier Draft (v1.8 / G 7.5 r)
                      </div>
                      <p className="text-slate-700 leading-relaxed">{c.earlierDraftClaim}</p>
                    </div>
                    <div className="p-4 space-y-1">
                      <div className="font-bold text-red-800 text-xs uppercase">
                        Why It Failed / Was Corrected
                      </div>
                      <p className="text-slate-700 leading-relaxed">{c.stressTestFindingOrFix}</p>
                    </div>
                    <div className="p-4 space-y-1 bg-emerald-50/40">
                      <div className="font-bold text-emerald-800 text-xs uppercase">
                        Consolidated Rule Going Forward
                      </div>
                      <p className="text-[#081d38] font-medium leading-relaxed">
                        {c.consolidatedRule}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: DEDUPLICATED TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          {filteredTimeline.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 text-sm text-slate-500">
              No timeline phases matched your search.
            </div>
          ) : (
            filteredTimeline.map((phase) => (
              <article
                key={phase.id}
                className="bg-white border border-slate-200 rounded-xl p-6 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-[#081d38]">
                    {phase.phaseTitle}
                  </h2>
                  <span className="px-3 py-1 bg-[#081d38] text-[#dfa62a] text-xs font-bold rounded tabular-nums">
                    {phase.dateRange}
                  </span>
                </div>
                <ul className="space-y-1.5 text-sm text-slate-800 list-disc list-inside">
                  {phase.developments.map((d) => (
                    <li key={d} className="leading-relaxed">
                      {d}
                    </li>
                  ))}
                </ul>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-950">
                  <strong>Superseded / Retired From This Phase:</strong> {phase.supersededOrRetired}
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {/* TAB 5: CLEAN A-Z REFERENCE */}
      {activeTab === 'az' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <h2 className="font-serif text-xl font-bold text-[#081d38]">
            Clean A&ndash;Z Master Reference (Chat Noise Stripped)
          </h2>
          {filteredAZ.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">No A&ndash;Z entries matched your search.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAZ.map((entry) => (
                <div
                  key={entry.letter}
                  className="bg-[#fbfaf7] border border-slate-200 rounded-lg p-4 space-y-1.5"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded bg-[#081d38] text-[#dfa62a] font-bold text-xs flex items-center justify-center shrink-0">
                      {entry.letter}
                    </span>
                    <h3 className="font-bold text-sm text-[#081d38]">{entry.term}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{entry.summary}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: LAW 4 MERGE DIFF & 4 UNTOUCHED ORIGINALS */}
      {activeTab === 'sources' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
            <h2 className="font-serif text-xl font-bold text-[#081d38]">
              Law 4 Disclosure &mdash; What Was Deduplicated &amp; Merged
            </h2>
            {filteredChanges.length === 0 ? (
              <p className="text-sm text-slate-500">No merge diff entries matched your search.</p>
            ) : (
              <ul className="space-y-2 text-xs sm:text-sm text-slate-800 list-disc list-inside">
                {filteredChanges.map((change) => (
                  <li key={change} className="leading-relaxed">
                    {change}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-700 space-y-1.5">
              <div className="font-bold text-[#081d38]">
                Doc 2 Canonical Integrity Digest (Full Unabbreviated SHA-256):
              </div>
              <code className="block break-all bg-white border border-slate-200 rounded px-2.5 py-1.5 text-[11px] font-mono text-[#081d38]">
                {GENESIS_INTEGRITY_MANIFEST.sha256}
              </code>
              <div className="text-[11px] text-slate-600">
                Companion manifests listed in Doc 2 p. 4:{' '}
                {GENESIS_INTEGRITY_MANIFEST.companionArtifacts.join(' | ')}
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <h2 className="font-serif text-xl font-bold text-[#081d38]">
              Laws 1 &amp; 2 &mdash; All 4 Original Source PDFs Preserved Untouched
            </h2>
            {filteredSources.length === 0 ? (
              <p className="text-sm text-slate-500">No source documents matched your search.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSources.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-[#fbfaf7] border border-slate-200 rounded-xl p-4 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-amber-800">{doc.versionLabel}</span>
                        <span className="tabular-nums">{doc.pages} pages</span>
                      </div>
                      <h3 className="font-serif font-bold text-base text-[#081d38]">{doc.title}</h3>
                      <p className="text-xs text-slate-700 leading-relaxed">{doc.roleInMerge}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
                      <a
                        href={doc.pdfPath}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-[#081d38] hover:bg-[#0f2b52] text-white text-xs font-bold rounded inline-flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#dfa62a]" aria-hidden="true" />
                        <span>View PDF</span>
                      </a>
                      <a
                        href={doc.pdfPath}
                        download
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-[#081d38] border border-slate-300 text-xs font-bold rounded inline-flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Download Original</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
