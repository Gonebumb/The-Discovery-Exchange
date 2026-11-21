import React, { useState } from 'react';
import {
  BookOpen,
  Building2,
  Coins,
  Download,
  FileText,
  Gavel,
  GraduationCap,
  RefreshCw,
  Scale,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { BuildTheBlockGame } from '../components/BuildTheBlockGame';

const PDF_ASSET_PATH =
  '/assets/aistudio/How_The_Discovery_Exchange_Works__Step-by-Step_Guide_3f2e7058.pdf';

interface BlueprintPart {
  roman: string;
  title: string;
  authority: string;
  summary: string;
  bullets: string[];
}

const BLUEPRINT_11_PARTS: BlueprintPart[] = [
  {
    roman: 'Part I',
    title: 'The Single-Loop Vision & Non-Custodial Foundation',
    authority: 'Articles 1.1, 2.1 & 10.1',
    summary:
      'TDEX connects everyday family buying and selling directly to 100% debt-free commercial real estate ownership and permanent funding for public school teachers and students—while never touching user funds.',
    bullets: [
      'Your money always stays in your own regulated accounts (such as PayPal or your personal account)—TDEX never holds, pools, or collects funds.',
      'One Verified Human Owner = One Vote (Article 4.1). Zero bosses, zero controlling corporate shareholders, and $0 TDEX membership or listing fees.',
      'Primary Domains: TheDiscoveryExchange.com (Marketplace & Governance) and NationalDiscoveryAwards.com (Public Schools Awards Program).',
    ],
  },
  {
    roman: 'Part II',
    title: 'Discovery Marketplace & 50/25/25 Split Engine',
    authority: 'Article 12.1',
    summary:
      'Families sell everyday household goods, tools, bikes, instruments, and gear with $0 platform fees, turning every sale into immediate funds plus cooperative property accumulation.',
    bullets: [
      '50% Immediate Funds to the Seller straight into the seller’s own regulated processor account.',
      '25% Seller Property Accumulation Credit tracked inside the seller’s own segregated account toward debt-free real estate.',
      '25% Buyer Property Accumulation Credit rewarding the buying family with equal real estate participation.',
      'Supports Local Pickup Only (with 4-digit Pickup Confirmation Code), Free Shipping, or Flat-Rate Shipping (100% shipping fee to seller; 5-business-day carrier tracking) plus blind simultaneous 1–5 star ratings.',
    ],
  },
  {
    roman: 'Part III',
    title: '100% Debt-Free Isolated Property Silos & Seller-Side Escrow',
    authority: 'Articles 9.1, 9.4 & 10.5',
    summary:
      'When TDEX matches a debt-free auction or foreclosure property (20%–30% below market value) to participating families, funds move directly from buyers’ own wallets to a licensed third-party escrow company.',
    bullets: [
      'Zero Mortgages, Zero Liens, Zero Cross-Collateralization: Each apartment or commercial building sits inside its own legally isolated Property Silo (Article 9.1).',
      'Seller-Side Licensed Escrow Window: TDEX opens an independent third-party escrow on the seller’s side and gives buyers a defined window to fund closing directly.',
      '60-Second 100% Failed-Deal Refund Protection: If a property fails inspection, title check, or minimum funding target, every buyer’s funds remain protected with immediate 100% failed-deal refund protection—zero funds trapped.',
    ],
  },
  {
    roman: 'Part IV',
    title: 'Permanent 70/30 Net Rental Income Split',
    authority: 'Article 9.5',
    summary:
      'Once a Property Silo closes 100% debt-free and begins generating net rental income after taxes, insurance, maintenance reserves, and third-party management fees, net rent splits cleanly:',
    bullets: [
      '70% to Silo Owners: Distributed proportionally to the families who funded that building’s Property Nuggets—shielding working-class savings from inflation.',
      '30% to The National Discovery Awards (NDA): Permanently funds cash prizes for public school students, honoring teachers, and direct classroom tool grants with zero financial burden to families.',
    ],
  },
  {
    roman: 'Part V',
    title: 'Discovery Brick Coins (DBC) — 100,000,000 Fixed Hard Cap',
    authority: 'Articles 11 & 14',
    summary:
      'Discovery Brick Coins (DBC) are strictly capped forever at 100,000,000 DBC with zero inflation and zero presales ahead of recorded real estate deeds.',
    bullets: [
      'Post-Closing Issuance Only: Property-level DBC is issued strictly after closing, title recording, and full escrow verification (Article 11.2).',
      'Schedule A Allocation Pools: 95,000,000 DBC Owner Community & Operational Mission · 3,000,000 DBC Extraordinary Contributors (50-year cadence) · 1,000,000 DBC Founder documented economic allocation (zero extra votes) · 1,000,000 DBC Future AI Permanent Reserve.',
      'Coins Never Vote: Holding more DBC never adds voting weight—governance remains strictly One Verified Human Owner = One Vote.',
    ],
  },
  {
    roman: 'Part VI',
    title: 'Peer-to-Peer DBC Buy/Sell Transfer Desk & Vesting Protection',
    authority: 'Article 11.7 & Module 06',
    summary:
      'Owners can transparently transfer vested Discovery Brick Coins (DBC) through the audited Peer-to-Peer DBC Buy/Sell Transfer Desk while Module 06 stops dumping and manipulation.',
    bullets: [
      'Peer-to-Peer Transfer Desk: Direct owner-to-owner settlement logged on the immutable SHA-256 Open Ledger with zero predatory broker spreads.',
      'Module 06 Proportional Vesting & Hold Guard: Unvested allocations remain mathematically frozen on-ledger while vested balances stay protected.',
      'Integer-Cent Exact Accounting: Every split, rent payout, and DBC balance runs on deterministic integer arithmetic verified by 22/22 live protocol checks.',
    ],
  },
  {
    roman: 'Part VII',
    title: 'Owner Board Code & 14-Day Power Handover Protocol',
    authority: 'Master Charter Article 5.1 & Article 7',
    summary:
      'A rotating 30-person Owner Board of verified everyday parents, teachers, and workers governs operational oversight with strict anti-capture locks.',
    bullets: [
      'Eligibility: Verified 18+ human Owner with 90-day active standing in good standing + at least 1 completed Marketplace transaction.',
      'Neutral Random Draw & Staggered Rotation: 10 of 30 seats rotate per cycle while 20 continuing members stay seated—eliminating power vacuums and permanent bosses.',
      '14-Day Power Handover Protocol: Day 14 non-emergency spending/rule freeze -> Day 10 neutral draw & witness sign-off -> Days 9–2 Open-Ledger Transition Dossier -> Day 1 Oath of Honor -> Rotation Day (12:00 PM UTC) automatic credential switch & Pipito 30-headcount check.',
      'Quorum, Review Window & Anti-Bribery: 20-member quorum required, mandatory 72-hour pre-vote public review window, strict anti-bribery bans, and automatic recusal for any personal conflict.',
    ],
  },
  {
    roman: 'Part VIII',
    title: 'Internal Court, Pusher & School/State Representative Codes',
    authority: 'Master Charter Articles 1.3, 3 & 5.3',
    summary:
      'Disputes, neighborhood outreach, and public school chapter coordination operate under strict constitutional limits so nobody can act like a boss or gatekeeper.',
    bullets: [
      '12-Person Owner Review Jury (Article 5.3): Randomly drawn out-of-state Owners with conflict screening, blind anonymized packets, single-case dissolution after verdict, 9/12 standard ruling & 10/12 serious removal threshold.',
      'Pushers (Chapter Organizers — Article 1.3): Volunteer community builders who host local Marketplace workshops with zero extra votes, zero exclusive territory monopolies, and zero money collection.',
      'School District & State Representatives (Articles 1.3, 3 & 7): Verified Owners connecting public school teachers and working-class students to NationalDiscoveryAwards.com—strictly zero donation collection, zero gatekeeping (no permission needed to apply), zero winner-picking, and full FERPA/Article 7 Student Privacy Shield.',
    ],
  },
  {
    roman: 'Part IX',
    title: 'Property Appraisal, Inspection, Reserves & Third-Party Management',
    authority: 'Article 9.4 & Schedule B',
    summary:
      'Every building acquired by a Property Silo must clear mandatory institutional-grade physical, legal, and financial gates before closing.',
    bullets: [
      'Independent Valuation & Clean Title: Certified third-party appraisal confirming 20%–30% below-market auction/foreclosure spread plus clean title & zoning clearance.',
      'Licensed Physical Inspection & Insurance: Full structural, roof, plumbing, electrical, and environmental inspection plus full property & liability coverage before deed recording.',
      'Dedicated Maintenance Reserves & Bonded Third-Party Management: Every silo maintains ring-fenced capital/repair reserves and hires an independent licensed property manager—never run informally out of personal accounts.',
    ],
  },
  {
    roman: 'Part X',
    title: 'National Discovery Awards Judging & Dual Teacher/Student Payouts',
    authority: 'Articles 3.1, 3.3 & 6.2',
    summary:
      'Inspired by the Nobel Prize, NationalDiscoveryAwards.com motivates public school educators and working-class students across three inclusive discovery tracks.',
    bullets: [
      'Three Discovery Categories (Article 3.3): Applied Discovery (working builds/prototypes), Analytical Discovery (scientific/math/civic research), and Hybrid Discovery (combined research + build).',
      'Anonymized Blind Judging: Entries receive stripped TDX-NDA- IDs judged out-of-state on a 10-point anti-wealth rubric with zero school-name or zip-code bias.',
      'Direct Dual Payouts: 50% protected Student Education Fund (529/trust), 25% directly to mentoring public school Teachers, 15% direct Classroom Tools/Books/Lab Grants, and 10% back into the debt-free Awards endowment.',
    ],
  },
  {
    roman: 'Part XI',
    title: 'Tax Disclaimers, Inheritance, Budget, Dormancy, Circuit-Breaker & Amendments',
    authority: 'Articles 8, 15, 17 & 19',
    summary:
      'Clear legal, operational, and edge-case protections safeguard families, estates, and constitutional stability over decades.',
    bullets: [
      'IRS / 1099-K Tax Reporting Disclaimers: External regulated processors (such as PayPal) and property silo administrators issue applicable tax statements (1099-K / K-1); TDEX does not give individual tax advice.',
      'Family Inheritance & Beneficiary Rules: Verified Owners designate legal family beneficiaries so Property Nuggets and vested DBC pass smoothly to heirs without forfeiture.',
      'Operational Budget Transparency & Dormant Accounts: Every operational expense is published on the open ledger; dormant accounts follow clear multi-notice family contact and state unclaimed-property protection rules.',
      '48-Hour Emergency Security Circuit-Breaker & 75% Amendment Lock: Pipito and the Board may trigger a logged 48-hour emergency security pause to stop active exploits (never altering balances), while bedrock protections require a 75% supermajority of both Owners and the Board (Article 19.2).',
    ],
  },
];

export const HowTdexWorksPage: React.FC = () => {
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  return (
    <div className="space-y-6">
      {/* Hero Banner Visual — Compact Steady Format with 5s Video */}
      <div className="rounded-2xl overflow-hidden border-2 border-[#dfa62a] bg-[#081d38] shadow-md p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1 min-w-0 flex flex-col justify-center text-white space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#fcd34d]">
            Complete 11-Part Unified Blueprint &bull; Master Charter v10.0
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold leading-tight text-white">
            The bureaucracy has failed us all.
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 max-w-xl">
            Read the complete 11-Part A-to-Z Blueprint below—from 50/25/25 Marketplace splits and
            100% debt-free silos to the 14-day Board handover, School Representatives, and our
            playable Build the Block simulation.
          </p>
        </div>
        <div className="w-full max-w-[300px] sm:max-w-[320px] md:w-[300px] lg:w-[320px] shrink-0">
          <div className="rounded-xl overflow-hidden border-2 border-[#dfa62a] bg-slate-950 aspect-[14/15]">
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              aria-label="Parents and students — Kids deserve an education, not an agenda"
              className="w-full h-full object-contain object-center block"
            >
              <source
                src="/assets/aistudio/AaHV17U8c7zlxcM8bB_V3Q-AaHV17U8DoCm3OYVK7zjSw_2026ea43.mp4"
                type="video/mp4"
              />
            </video>
          </div>
        </div>
      </div>

      {/* Non-Custodial Open Project Notice (White Background + Gold Letters) */}
      <div
        role="region"
        aria-label="Open Project Non-Custodial Notice"
        className="tdex-prelaunch-banner w-full bg-white text-[#9A6B0A] border-2 border-[#dfa62a] rounded-xl px-4 sm:px-6 py-3 text-center text-xs sm:text-[13px] leading-snug shadow-xs"
      >
        <div className="font-bold text-[#B47D12] uppercase tracking-wide mb-0.5">
          TDEX is Building Something New.
        </div>
        <div className="font-semibold text-[#9A6B0A]">
          Your money always stays in your accounts. The Discovery Exchange (TDEX) never holds or
          collects your funds. Instead, you save up for a home in your own PayPal or personal
          account. When TDEX finds the property that’s a match, you send your funds straight to a
          licensed escrow company to close the deal safely.
        </div>
      </div>

      {/* Header Banner + Quick Part Jump Navigation */}
      <div className="bg-[#081d38] text-white rounded-xl border-2 border-[#dfa62a] p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#dfa62a] inline-flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            <span>Charter Version 10.0 &bull; Complete 11-Part Unified Guide</span>
          </span>
          <span className="px-3 py-1 bg-amber-400/15 border border-[#dfa62a]/60 text-[#dfa62a] text-xs font-bold rounded">
            How TDEX Works A&ndash;Z (Parts I–XI)
          </span>
        </div>

        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-white leading-tight">
          How The Discovery Exchange Works: Complete A-to-Z Blueprint
        </h1>

        <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-3xl">
          Primary Domains: <span className="font-mono text-[#dfa62a]">TheDiscoveryExchange.com</span>{' '}
          &bull; <span className="font-mono text-[#dfa62a]">NationalDiscoveryAwards.com</span>{' '}
          &nbsp;|&nbsp; Flagship Mission: <strong>The National Discovery Awards</strong>
        </p>

        <div className="pt-1 flex flex-wrap items-center gap-3">
          <a
            href="#build-the-block-game"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-lg inline-flex items-center gap-2 transition-colors"
          >
            <Building2 className="w-4 h-4" aria-hidden="true" />
            <span>Play “Build the Block” Challenge</span>
          </a>

          <a
            href={PDF_ASSET_PATH}
            download="How_The_Discovery_Exchange_Works__Step-by-Step_Guide.pdf"
            className="px-4 py-2 bg-[#dfa62a] hover:bg-[#c99524] text-[#06182f] text-xs sm:text-sm font-bold rounded-lg inline-flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>Download Original PDF</span>
          </a>

          <button
            type="button"
            onClick={() => setShowPdfPreview((prev) => !prev)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/25 text-xs sm:text-sm font-semibold rounded-lg inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4" aria-hidden="true" />
            <span>{showPdfPreview ? 'Hide Original PDF Viewer' : 'View Original PDF'}</span>
          </button>
        </div>

        {/* Quick Jump Pills for Parts I–XI */}
        <div className="pt-3 border-t border-white/15 flex flex-wrap gap-1.5">
          {BLUEPRINT_11_PARTS.map((part, idx) => (
            <a
              key={part.roman}
              href={`#blueprint-part-${idx + 1}`}
              className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-[#dfa62a] hover:text-[#081d38] text-[11px] font-bold text-slate-100 transition-colors"
            >
              {part.roman}
            </a>
          ))}
        </div>
      </div>

      {/* Optional Embedded Original PDF Viewer */}
      {showPdfPreview && (
        <div className="bg-white border-2 border-[#081d38]/20 rounded-xl overflow-hidden shadow-xs">
          <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-[#081d38]">
            <span>
              Source Document: How_The_Discovery_Exchange_Works__Step-by-Step_Guide.pdf (5 Pages)
            </span>
            <a
              href={PDF_ASSET_PATH}
              target="_blank"
              rel="noreferrer"
              className="text-amber-800 hover:underline"
            >
              Open PDF in New Tab
            </a>
          </div>
          <iframe
            src={PDF_ASSET_PATH}
            title="How The Discovery Exchange Works Step-by-Step Guide PDF"
            className="w-full h-[min(640px,75dvh)] min-h-[340px] border-0"
          />
        </div>
      )}

      {/* THE COMPLETE 11 PARTS (PARTS I–XI) */}
      <div className="space-y-4">
        {BLUEPRINT_11_PARTS.map((part, idx) => {
          const IconComponent =
            idx <= 1
              ? RefreshCw
              : idx <= 3
              ? Building2
              : idx <= 5
              ? Coins
              : idx === 6
              ? Users
              : idx === 7
              ? Gavel
              : idx === 8
              ? ShieldCheck
              : idx === 9
              ? GraduationCap
              : Scale;
          return (
            <section
              key={part.roman}
              id={`blueprint-part-${idx + 1}`}
              className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-xs scroll-mt-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-lg bg-[#081d38] text-[#fcd34d] font-bold text-xs inline-flex items-center gap-1.5 shrink-0">
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{part.roman}</span>
                  </span>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-[#081d38]">
                    {part.title}
                  </h2>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-[#9A6B0A] text-[11px] font-bold">
                  {part.authority}
                </span>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed">{part.summary}</p>

              <ul className="space-y-2 text-xs sm:text-sm text-slate-800 list-disc pl-5">
                {part.bullets.map((bullet) => (
                  <li key={bullet} className="leading-relaxed">
                    {bullet}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      {/* INTERACTIVE EDUCATIONAL GAME: BUILD THE BLOCK */}
      <BuildTheBlockGame />
    </div>
  );
};
