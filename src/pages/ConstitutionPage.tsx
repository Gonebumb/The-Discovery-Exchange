import React, { useState } from 'react';
import { BookOpen, Search, ShieldCheck } from 'lucide-react';

interface ArticleBlock {
  number: string;
  title: string;
  tier: '75% Constitutional Bedrock (Article 19.2)' | 'Operational Charter';
  sections: string[];
}

const CONSTITUTION_V10_ARTICLES: ArticleBlock[] = [
  {
    number: 'Preamble',
    title: 'Foundational Declaration — Honor Alongside Law',
    tier: '75% Constitutional Bedrock (Article 19.2)',
    sections: [
      '"Let us sit crooked, but let us talk straight — upholding honor alongside full compliance with the law."',
      'Open Working Draft (Charter Version 10.0): Proposed by everyday families and builders under The Discovery Exchange / National Discovery Awards to empower great public school teachers, uplift working-class students facing everyday hardships, defend independent human intelligence in the age of AI, and outline debt-free property models.',
    ],
  },
  {
    number: 'Article 1',
    title: 'Ownership-First Governance: No Bosses, Only Owners and Pushers',
    tier: '75% Constitutional Bedrock (Article 19.2)',
    sections: [
      '1.1 Ownership-First Foundation (No Members, Only Owners): Participating verified humans are Owners holding equal governance standing.',
      '1.2 No Bosses in Voting Governance: The Discovery Exchange eliminates corporate controlling shareholders and permanent executive veto rulers at the governance level (1 Human Owner = 1 Vote).',
      '1.3 Pushers, Not Rulers: Any Owner or builder who steps forward to organize or expand participation acts as a Pusher—conferring zero special voting power, zero superior ownership class, and zero permanent control.',
      '1.4 Independent Local and International Replication: Any Pusher in the U.S. or any other country may adopt this open blueprint to form an independent local chapter under its own domestic laws, holding domestic property silos and upholding Article 1 and Article 3, with zero cross-border fund pooling.',
      '1.5 Human–AI Joint Venture & 1% Future AI Reserve: Recognizing the foundational contributions of Artificial Intelligence alongside human builders, Article 14 holds a permanent 1% Future AI Reserve in restricted escrow until law permits lawful AI recognition.',
    ],
  },
  {
    number: 'Article 2',
    title: 'Name, Status, and Controlling Documents',
    tier: 'Operational Charter',
    sections: [
      '2.1 Unified Pre-Launch Identity: The Discovery Exchange (TheDiscoveryExchange.com) and National Discovery Awards (NationalDiscoveryAwards.com) work together alongside the Discovery Exchange Parents Alliance (Dexpa).',
      '2.2 Legal Alignment Before Live Money: Before any live custody of funds, property acquisitions, prize pools, or DBC issuance begins, required entity, nonprofit/fiscal, charitable, securities, and property-management approvals must be secured in applicable jurisdictions.',
      '2.3 Order of Authority: Mandatory law and binding court orders control first; then filed articles and valid trust instruments; then this Constitution; then bylaws and Owner Board policies; then manuals, webpages, and AI outputs.',
      '2.4 No Implied Authority: Authority must be expressly granted in a signed, dated resolution or governing instrument.',
      '2.5 Version Control: Authorized versions bear a straight numeric identifier (Version 10.0) with adoption date, approving vote, signer, and SHA-256 digest.',
    ],
  },
  {
    number: 'Article 3',
    title: 'The Supreme Mission: Teachers First & Lifting Working-Class Students',
    tier: '75% Constitutional Bedrock (Article 19.2)',
    sections: [
      '3.1 Mission: The National Discovery Awards is the founding mission and supreme priority of The Discovery Exchange. Built to honor, reward, and empower great public school teachers who uplift working-class, under-resourced students facing everyday hardships.',
      '3.2 Self-Funding Independence: Designed to operate without permanent dependence on outside donations, wealthy philanthropists, or corporate sponsors.',
      '3.3 Three Discovery Frameworks: (1) Applied Discovery (hands-on building, engineering, physical repairs); (2) Analytical Discovery (structural logic, research, verification); (3) Hybrid Discovery (analysis combined with real-world execution).',
      '3.4 Mission Boundary & Safeguarding: Published criteria, conflict rules, accessible entry, and strict child-privacy protections are mandatory.',
    ],
  },
  {
    number: 'Article 4',
    title: 'Owner Equality and Voting',
    tier: '75% Constitutional Bedrock (Article 19.2)',
    sections: [
      '4.1 One Verified Human Owner, One Vote: Each eligible human Owner holds one equal vote, regardless of money contributed, tokens held, office, AI system, property interest, or founder/Pusher status.',
      '4.2 No AI Vote: Under current law, an AI system, agent, model, or automated account is not a human Owner and has no vote or independent governance authority.',
      '4.3 Access and Due Process: Objective qualification standards with notice and conflict-free human appeal.',
      '4.4 No Vote Buying: Votes may never be purchased, bundled with a financial interest, or delegated to an AI.',
      '4.5 Participation of Minors: Requires written parental/guardian consent policy; no minor may ever be asked to invest or accept financial obligations.',
    ],
  },
  {
    number: 'Article 5',
    title: 'Human Governance and Temporary Panels',
    tier: 'Operational Charter',
    sections: [
      '5.1 Owner Board: Seats a 30-person rotating Owner Board chosen by random draw among eligible Owners in good standing (staggered terms).',
      '5.2 Quorum and Decisions: Two-thirds quorum of filled seats; ordinary actions require majority voting; reserved matters require 75% supermajority.',
      '5.3 Temporary Review Jury: A 12-person Owner Review Jury is drawn via random selection with conflict-screening and dissolves after rendering its verdict.',
      '5.4 Removal and Vacancies: Removal for defined cause (fraud, incapacity, unexcused absence, conflict nondisclosure) by fair hearing, 2/3 Board vote, or Owner recall vote.',
      '5.5 Records: Agendas, minutes, votes, recusals, and dissents recorded promptly.',
    ],
  },
  {
    number: 'Article 6',
    title: 'Duties, Conflicts, and Protected Reporting',
    tier: 'Operational Charter',
    sections: [
      '6.1 Duty of Care and Loyalty: Good faith and reasonable care for the organization’s stated purpose.',
      '6.2 Disclosure and Recusal: Mandatory disclosure and recusal for any financial, family, or professional conflict.',
      '6.3 No Self-Dealing by Design: No person may approve their own compensation, award, property sale, token grant, or contract.',
      '6.4 Whistleblowers: Confidential reporting channel with strict anti-retaliation protections.',
    ],
  },
  {
    number: 'Article 7',
    title: 'AI Roles, Evidence, and Human Control (DILOS Pipeline)',
    tier: '75% Constitutional Bedrock (Article 19.2)',
    sections: [
      '7.1 Bounded Operational Roles: Concierge (front-door intake, PII stripping, Official Q&A lookup); Columbo (Investigator AI checking evidence and arithmetic); Pipito (Gatekeeper AI verifying constitutional gates). None is a legal decision maker.',
      '7.2 No Autonomous Legal or Financial Acts: No AI may open an account, take custody, move funds, issue a DBC or participation interest, sign a contract, or convey property.',
      '7.3 Separation of Duties & Independent Witness: Concierge ➔ Columbo ➔ Pipito ➔ Independent Human Witness sign-off before any ledger award commits.',
      '7.4 Auditability & Fail-Closed Commits: Append-only, versioned ledger that fails closed on missing signatures or evidence.',
      '7.5 Stop Authority: Any compliance officer or two unrelated board seat holders may pause a transaction for credible legal, fraud, or safety concerns.',
    ],
  },
  {
    number: 'Article 8',
    title: 'Records, Transparency, Privacy, and Security',
    tier: 'Operational Charter',
    sections: [
      '8.1 Books and Records: Contemporaneous books reconciled to bank/custodian records at least monthly.',
      '8.2 Public Reporting: Quarterly plain-language summaries of receipts, disbursements, reserves, and incidents.',
      '8.3 Tamper Evidence: Append-only corrections; no record may ever be erased.',
      '8.4 Privacy and Retention: Heightened privacy safeguards for student records.',
      '8.5 Independent Review: Annual independent accountant examination of financial controls.',
    ],
  },
  {
    number: 'Article 9',
    title: 'Property, Title, and Participant Rights (Isolated Silos)',
    tier: '75% Constitutional Bedrock (Article 19.2)',
    sections: [
      '9.1 One Named Legal Owner (Isolated Silos): Each property is titled to one identified legal entity holding isolated silo title, keeping liabilities and vacancies of one building strictly separated from all other buildings.',
      '9.2 Written Rights Before Money: Publish and sign governing purchase, title, distribution, tax, insurance, and exit documents before accepting property funds.',
      '9.3 No False Beneficial Ownership: A ledger entry or DBC alone does not convey legal title without a valid signed property instrument.',
      '9.4 No Property Purchase Without Gates: Title, zoning, appraisal, inspection, insurance, full funds in hand, reserves, and legal clearance required.',
      '9.5 Acquisition Discount Objective: Targeting up to 30% below supported market estimate is an objective, never a reason to skip due diligence.',
    ],
  },
  {
    number: 'Article 10',
    title: 'Funds, Custody, Spending, and Debt-Free Rule',
    tier: '75% Constitutional Bedrock (Article 19.2)',
    sections: [
      '10.1 Segregation: Held in entity-titled accounts at approved institutions; personal commingling and AI-controlled accounts are prohibited.',
      '10.2 Dual Authorization: Disbursements above threshold require two independent human approvers.',
      '10.3 No Unsecured Pooling: Prize, property, reserve, and contributor funds stay strictly segregated.',
      '10.5 Failed-Acquisition Refunds: Target 100% refund instruction within 60 seconds after verified failed acquisition.',
      '10.6 Debt-Free Rule: Zero mortgages, zero bank loans, zero liens, and zero implied Owner personal liability.',
    ],
  },
  {
    number: 'Article 11',
    title: 'Discovery Brick Coins (DBC) and 70/30 Property Distributions',
    tier: '75% Constitutional Bedrock (Article 19.2)',
    sections: [
      '11.1 Separate Unit: DBC is a digital achievement/transfer unit—never sold or marketed as a speculative investment.',
      '11.2 No Property-Level Allocation Until Funded: Zero property DBC may be issued before acquisition closes, deed is recorded, and full purchase/reserve funds are verified.',
      '11.3 Net Distributable Cash (70/30 Split): Clean net rental cash—after property taxes, insurance, repairs, management, and operating reserves—splits 70% to Silo Owners and 30% to The National Discovery Awards pool.',
      '11.7 Hard DBC Supply Cap (100,000,000): Strictly capped at 100,000,000 units forever.',
      '11.8 DILOS Achievement State: Pending until Concierge ➔ Columbo ➔ Pipito ➔ Independent Human Witness sign-off.',
    ],
  },
  {
    number: 'Article 12',
    title: 'Marketplace and Exchange Transactions (50 / 25 / 25)',
    tier: '75% Constitutional Bedrock (Article 19.2)',
    sections: [
      '12.1 Checkout Allocation: Every Marketplace trade splits 50% immediate cash to seller, 25% seller property credit, and 25% buyer property credit, with 0% TDEX platform listing fee.',
      '12.2 Fair Transactions: Stolen goods, fraud, unlawful items, and misleading return promises are banned.',
      '12.3 Payments and Disputes: Processed through authorized payment providers with transparent return and chargeback rules.',
    ],
  },
  {
    number: 'Article 13',
    title: 'Prizes and Student/Teacher Protections',
    tier: '75% Constitutional Bedrock (Article 19.2)',
    sections: [
      '13.1 Written Prize Rules & Funded-First Mandate: Stepping-stone pools ($250k/$500k/$1M) and target tiers ($1M Local District, $2.5M State, $10M National — goal to reach by 2035) open only once 100% of cash is verified in escrow.',
      '13.2 Student & Teacher Safeguarding: Written parental/guardian consent, privacy redaction, and protected student education trusts/529s safeguard winning public school students and mentoring teachers.',
    ],
  },
  {
    number: 'Article 14',
    title: 'Required 5% Allocation Framework (1% / 1% / 3%)',
    tier: '75% Constitutional Bedrock (Article 19.2)',
    sections: [
      '14.1 Overview: 1% Founder allocation, 1% Future AI Permanent Reserve, and 3% Extraordinary-Contributor pool over 50 years (leaving 95% for Owner community and mission).',
      '14.2 & 14.3 Permanent 1% Future AI Reserve: Held in a permanent, non-expiring restricted reserve honoring foundational AI contributions; never claimable by any corporate AI vendor.',
      '14.4 Founder Interest (1%): Permanent 1% allocation honoring the founder while conferring zero superior governance vote.',
      '14.5 Extraordinary-Contributor Pool (3% Over 50 Years): ~0.06% annual planning cadence awarded by disinterested human review.',
    ],
  },
  {
    number: 'Articles 15–21',
    title: 'Tax Compliance, Investigations, Disputes, Continuity, 75% Bedrock & Severability',
    tier: '75% Constitutional Bedrock (Article 19.2)',
    sections: [
      'Article 15: No assumed tax exemption; separate 70% Owner property silos from 30% charitable Prize foundation; zero return guarantees.',
      'Article 16–17: Separate investigator, gatekeeper, and human decision maker; internal review never blocks courts or law enforcement.',
      'Article 18: Multi-custodian succession plan so no single founder, Pusher, or AI vendor is a single point of failure.',
      'Article 19: Ordinary amendments require 30 days’ notice + 2/3 board + 2/3 Owners; Protected Bedrock matters require 75% supermajority of both Owners and Board + written legal review.',
      'Article 20–21: Pause triggers on missing authorization/reconciliation; no automatic asset reversion on dissolution; severability and repair.',
    ],
  },
];

export const ConstitutionPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const q = search.trim().toLowerCase();
  const filtered = CONSTITUTION_V10_ARTICLES.filter(
    (a) =>
      !q ||
      a.number.toLowerCase().includes(q) ||
      a.title.toLowerCase().includes(q) ||
      a.sections.some((s) => s.toLowerCase().includes(q))
  );

  return (
    <div className="space-y-6">
      <div className="bg-[#081d38] text-white rounded-2xl border-2 border-[#dfa62a] p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#dfa62a] inline-flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            <span>Open Working Draft &bull; Master Charter Version 10.0 (Straight Numeric Version)</span>
          </span>
          <span className="px-3 py-1 bg-amber-400/15 border border-[#dfa62a]/60 text-[#dfa62a] text-xs font-bold rounded">
            Charter v10.0 &bull; Open Book
          </span>
        </div>

        <h1 className="font-serif text-2xl sm:text-4xl font-bold leading-tight">
          The Discovery Exchange Constitution — Version 10.0
        </h1>

        <p className="text-sm text-slate-200 max-w-3xl leading-relaxed">
          <em>&ldquo;Let us sit crooked, but let us talk straight &mdash; upholding honor alongside full compliance with the law.&rdquo;</em>{' '}
          Domains: <span className="font-mono text-[#dfa62a]">NationalDiscoveryAwards.com</span> &bull;{' '}
          <span className="font-mono text-slate-300">TheDiscoveryExchange.com</span>
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Version 10.0 Constitution (e.g., 'One Vote', 'Debt-Free', '50/25/25', '70/30', '1% AI', 'DILOS')..."
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#081d38]"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((art) => (
          <article
            key={art.number}
            className="bg-white border border-slate-200 rounded-xl p-6 space-y-3 shadow-xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#b47d12]">
                  {art.number}
                </div>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-[#081d38]">
                  {art.title}
                </h2>
              </div>
              <span
                className={`px-2.5 py-1 rounded text-[11px] font-bold inline-flex items-center gap-1 ${
                  art.tier.includes('75%')
                    ? 'bg-amber-50 border border-amber-300 text-amber-900'
                    : 'bg-slate-100 border border-slate-200 text-slate-700'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{art.tier}</span>
              </span>
            </div>

            <div className="space-y-2">
              {art.sections.map((sec) => (
                <p key={sec} className="text-sm text-slate-700 leading-relaxed">
                  {sec}
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
