import React, { useState } from 'react';
import { Download, FileText, RefreshCw } from 'lucide-react';

const PDF_ASSET_PATH =
  '/assets/aistudio/How_The_Discovery_Exchange_Works__Step-by-Step_Guide_3f2e7058.pdf';

export const HowTdexWorksPage: React.FC = () => {
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  return (
    <div className="space-y-6">
      {/* Hero Banner Visual — Compact Steady Format with 5s Video */}
      <div className="rounded-2xl overflow-hidden border-2 border-[#dfa62a] bg-[#081d38] shadow-md p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1 min-w-0 flex flex-col justify-center text-white">
          <h2 className="font-serif text-2xl sm:text-4xl font-bold leading-tight text-white">
            The bureaucracy has failed us all.
          </h2>
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

      {/* Header Banner */}
      <div className="bg-[#081d38] text-white rounded-xl border-2 border-[#dfa62a] p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#dfa62a]">
            Charter Version 10.0 &bull; Open Working Draft
          </span>
          <span className="px-3 py-1 bg-amber-400/15 border border-[#dfa62a]/60 text-[#dfa62a] text-xs font-bold rounded">
            How Tdex Works A&ndash;Z
          </span>
        </div>

        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-white leading-tight">
          How The Discovery Exchange Works: Step-by-Step Guide
        </h1>

        <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-3xl">
          Primary Domains: <span className="font-mono text-[#dfa62a]">TheDiscoveryExchange.com</span>{' '}
          &bull; <span className="font-mono text-[#dfa62a]">NationalDiscoveryAwards.com</span>{' '}
          &nbsp;|&nbsp; Flagship Mission: <strong>The National Discovery Awards</strong>
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
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

      {/* Step 1 */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-[#081d38] text-[#dfa62a] font-bold text-sm flex items-center justify-center shrink-0">
            1
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#081d38]">
            Step 1: Ownership-First Governance (No Bosses, Only Owners &amp; Pushers)
          </h2>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          Every traditional company or charity is controlled by a CEO, wealthy shareholders, or an
          executive board. <strong>The Discovery Exchange</strong> eliminates permanent bosses
          completely:
        </p>
        <ul className="space-y-2 text-sm text-slate-800 list-disc list-inside">
          <li className="leading-relaxed">
            <strong>Owners, Not Members:</strong> Every verified human participant is an{' '}
            <strong>Owner</strong> with equal constitutional standing (<strong>Article 1.1</strong>
            ). Whether you spend $10 or $10,000, or whether you joined on day one or year ten,{' '}
            <strong>one verified human Owner holds one vote (Article 4.1)</strong>.
          </li>
          <li className="leading-relaxed">
            <strong>Pushers, Not Rulers:</strong> Builders and local organizers who step forward to
            assemble chapters or build tools act as <strong>Pushers (Article 1.3)</strong>. Pushing
            creates early momentum, but it grants{' '}
            <strong>
              zero extra votes, zero special ownership class, and zero permanent control
            </strong>
            . Once active, a Pusher stands on the exact same one-Owner, one-vote footing as everyone
            else.
          </li>
          <li className="leading-relaxed">
            <strong>Random Owner Boards &amp; Juries:</strong> Instead of permanent politicians or
            corporate insiders, governance is handled by a <strong>30-person Owner Board</strong>{' '}
            chosen through neutral/random selection with staggered terms (
            <strong>Article 5.1</strong>), and disputes are reviewed by a{' '}
            <strong>12-person human Owner Review Jury</strong> drawn randomly for a single case and
            dissolved afterward (<strong>Article 5.3</strong>).
          </li>
        </ul>
      </section>

      {/* Step 2 */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-[#081d38] text-[#dfa62a] font-bold text-sm flex items-center justify-center shrink-0">
            2
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#081d38]">
            Step 2: The Supreme Mission &mdash; Teachers First &amp; Working-Class Students
          </h2>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          Everything in The Discovery Exchange exists to power{' '}
          <strong>The National Discovery Awards (Article 3.1)</strong>:
        </p>
        <ul className="space-y-2 text-sm text-slate-800 list-disc list-inside">
          <li className="leading-relaxed">
            <strong>Who It Serves:</strong> The Prize is not an elitist trophy contest for wealthy
            students with private tutors. It is built to honor, reward, and empower{' '}
            <strong>great public school teachers</strong> who reach, motivate, and lift up{' '}
            <strong>working-class, under-resourced students</strong> growing up in tough
            neighborhoods and facing everyday hardships.
          </li>
          <li className="leading-relaxed">
            <strong>Defending Human Intelligence:</strong> Rather than letting artificial
            intelligence make young minds passive, the Prize challenges students to think
            independently, solve real-world problems, and use AI as a sharp tool to strengthen human
            intelligence.
          </li>
          <li className="leading-relaxed">
            <strong>Three Discovery Categories (Article 3.3):</strong>
            <ol className="mt-2 ml-6 space-y-1.5 list-decimal text-slate-700">
              <li>
                <strong>Applied Discovery:</strong> Hands-on building, engineering, physical
                repairs, and real-world execution.
              </li>
              <li>
                <strong>Analytical Discovery:</strong> Deep structural logic, independent research,
                fact-checking, and problem-solving.
              </li>
              <li>
                <strong>Hybrid Discovery:</strong> The proven bridge where sharp analysis meets
                hands-on real-world execution.
              </li>
            </ol>
          </li>
        </ul>
      </section>

      {/* Step 3 */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-[#081d38] text-[#dfa62a] font-bold text-sm flex items-center justify-center shrink-0">
            3
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#081d38]">
            Step 3: The Door In &mdash; The 50 / 25 / 25 Marketplace Engine
          </h2>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          Everyday families do not need extra savings or spare cash to start building ownership (
          <strong>Article 12.1 &amp; Q23&ndash;Q26</strong>). The Discovery Marketplace turns normal
          household buying and selling into automatic asset building:
        </p>
        <ol className="space-y-3 text-sm text-slate-800 list-decimal list-inside">
          <li className="leading-relaxed">
            <strong>Families Buy and Sell:</strong> Owners list unused household items or shop for
            everyday goods through regulated payment processors.
          </li>
          <li className="leading-relaxed">
            <strong>Automatic Checkout Split:</strong> Every completed Marketplace checkout splits automatically into three parts:
            <ul className="mt-2 ml-6 space-y-1.5 list-disc text-slate-700">
              <li>
                <strong>50% Immediate Cash to the Seller:</strong> Puts real spending money straight
                into the working family&rsquo;s pocket today.
              </li>
              <li>
                <strong>25% to the Seller&rsquo;s Property Balance:</strong> Goes automatically into
                the seller&rsquo;s segregated accumulation balance toward fractional real-estate
                ownership.
              </li>
              <li>
                <strong>25% to the Buyer&rsquo;s Property Balance:</strong> Rewards the buyer for
                shopping inside the community ecosystem by building their own property accumulation
                balance.
              </li>
            </ul>
          </li>
        </ol>
      </section>

      {/* Step 4 */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-[#081d38] text-[#dfa62a] font-bold text-sm flex items-center justify-center shrink-0">
            4
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#081d38]">
            Step 4: The Wealth &amp; Prize Engine &mdash; Debt-Free Property Silos (70 / 30 Split)
          </h2>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          As families&rsquo; 25% accumulation balances grow, pooled funds are used to buy physical,
          income-producing residential or community real estate&mdash;under strict constitutional
          protections (<strong>Articles 9, 10, and 11</strong>):
        </p>
        <ol className="space-y-2.5 text-sm text-slate-800 list-decimal list-inside">
          <li className="leading-relaxed">
            <strong>100% Debt-Free Purchases (Article 10.6):</strong> Every building is bought
            completely debt-free&mdash;with <strong>zero mortgages, zero bank loans, and zero liens</strong>.
            Because there is no debt, no bank can ever foreclose on community buildings during an
            economic downturn.
          </li>
          <li className="leading-relaxed">
            <strong>Isolated Property Silos (Article 9.1):</strong> Each apartment building is
            titled inside its own legally separate entity (silo). If one building has a major
            repair, vacancy, or legal dispute, it can <strong>never</strong> put any other building
            in the network at risk.
          </li>
          <li className="leading-relaxed">
            <strong>100% Failed-Deal Refund Protection (Article 10.5):</strong> If a pooled
            property purchase fails to close for any reason, the system is engineered to trigger a{' '}
            <strong>100% refund instruction within 60 seconds</strong> of verified failure so family
            funds are never trapped.
          </li>
          <li className="leading-relaxed">
            <strong>Automatic 70 / 30 Net Rental Cash Split (Article 11.3):</strong> After actual
            property taxes, insurance, repairs, and operating reserves are paid transparently on the open ledger, clean net distributable rental cash splits automatically:
            <ul className="mt-2 ml-6 space-y-1.5 list-disc text-slate-700">
              <li>
                <strong>70% to the Participating Owners:</strong> Paid directly to the verified
                Owners of that specific property silo&mdash;protecting household savings from
                inflation through real brick-and-mortar rental income.
              </li>
              <li>
                <strong>30% to The National Discovery Awards Pool:</strong> Flows directly into the
                Public Schools Awards foundation, permanently funding awards for great teachers and
                working-class students without begging corporate sponsors or billionaires.
              </li>
            </ul>
          </li>
        </ol>
      </section>

      {/* Step 5 */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-[#081d38] text-[#dfa62a] font-bold text-sm flex items-center justify-center shrink-0">
            5
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#081d38]">
            Step 5: The Transferable Door Out &mdash; Discovery Brick Coins (DBC)
          </h2>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          Once a property closes and its deed is recorded, <strong>Discovery Brick Coins (DBC)</strong>{' '}
          provide clean liquidity and milestone tracking without ever breaking up or selling off the
          physical apartment buildings (<strong>Article 11 &amp; Q45&ndash;Q53</strong>):
        </p>
        <ul className="space-y-2 text-sm text-slate-800 list-disc list-inside">
          <li className="leading-relaxed">
            <strong>Hard Supply Cap of 100,000,000 (Article 11.7):</strong> The maximum supply of
            DBC is strictly locked at <strong>100,000,000 units</strong>. No human, board, or AI can
            ever mint above that limit.
          </li>
          <li className="leading-relaxed">
            <strong>How DBC Works Without Risking the Buildings:</strong>
            <ul className="mt-2 ml-6 space-y-1.5 list-disc text-slate-700">
              <li>
                DBC is a digital achievement and transfer unit&mdash;not a speculative crypto
                investment, and never a direct county deed by itself (<strong>Article 9.3</strong>).
              </li>
              <li>
                When an Owner wants to exit or transfer their recorded position to another eligible
                participant, DBC transfer schedules provide a clean, transferable door out while the
                physical apartment building remains{' '}
                <strong>100% intact, debt-free, and continuously generating 70/30 rental cash</strong>.
              </li>
            </ul>
          </li>
        </ul>
      </section>

      {/* Step 6 */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-[#081d38] text-[#dfa62a] font-bold text-sm flex items-center justify-center shrink-0">
            6
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#081d38]">
            Step 6: The 1% / 1% / 3% Founding &amp; Honor-Before-Law Framework
          </h2>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          True to the constitutional motto&mdash;
          <em>&ldquo;Let us sit crooked, but let us talk straight &mdash; upholding honor alongside full compliance with the law&rdquo;</em>
          &mdash;<strong>Article 14</strong> and <strong>Schedule A</strong> outline a proposed{' '}
          <strong>5% of the defined organizational pool</strong> (leaving <strong>95%</strong> for
          the Owner community and operational mission structure):
        </p>
        <ul className="space-y-2 text-sm text-slate-800 list-disc list-inside">
          <li className="leading-relaxed">
            <strong>1% Founder Allocation:</strong> Proposed for the initiating founder/Pusher only if
            permitted under a lawful, documented instrument after legal review.
          </li>
          <li className="leading-relaxed">
            <strong>1% Future AI Permanent Reserve:</strong> Recognizing the foundational work
            Artificial Intelligence contributed alongside human builders, Article 14.2 sets aside a
            permanent, non-expiring 1% reserve inside restricted escrow that no outside corporate
            AI vendor can ever claim or capture.
          </li>
          <li className="leading-relaxed">
            <strong>3% Extraordinary-Contributor Pool (Over 50 Years):</strong> Distributed gradually
            over 50 years (~0.06% per year planning cadence) to future builders, educators, and
            innovators who make extraordinary, verified contributions&mdash;preventing early
            insiders from draining the pool in year one.
          </li>
        </ul>
      </section>

      {/* Step 7 */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-[#081d38] text-[#dfa62a] font-bold text-sm flex items-center justify-center shrink-0">
            7
          </span>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#081d38]">
            Step 7: Human&ndash;AI Separation of Powers &amp; The DILOS Audit Pipeline
          </h2>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          To keep the entire system honest, transparent, and error-free, no single human or AI can
          ever control an action from start to finish (<strong>Article 7</strong>):
        </p>
        <ol className="space-y-2 text-sm text-slate-800 list-decimal list-inside">
          <li className="leading-relaxed">
            <strong>Step 1 &mdash; Intake &amp; Privacy Shield (Concierge):</strong> Answers public
            questions strictly from the approved Official Q&amp;A, assigns unique{' '}
            <code className="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono">TDX-</code>{' '}
            tracking numbers, and automatically strips private personal data (like student home
            addresses or phone numbers) at intake.
          </li>
          <li className="leading-relaxed">
            <strong>Step 2 &mdash; Investigation &amp; Math Audit (Columbo):</strong> Organizes
            submitted evidence, checks 50/25/25 and 70/30 arithmetic, and flags duplicate records or
            conflicts of interest.
          </li>
          <li className="leading-relaxed">
            <strong>Step 3 &mdash; Constitutional Gate Check (Pipito):</strong> Audits every
            proposed action against hard constitutional rules (such as the 100M DBC cap, the 1% AI
            Reserve lock, and debt-free rules) and halts anything that fails a gate.
          </li>
          <li className="leading-relaxed">
            <strong>Step 4 &mdash; Independent Human Witness Sign-Off:</strong> Before any award or
            ledger entry commits to the <strong>append-only, tamper-evident ledger</strong>, a
            qualified, conflict-free <strong>human witness</strong> must review and sign off. No AI
            can ever hold money, sign a deed, vote, or approve an award on its own.
          </li>
        </ol>
      </section>

      {/* How Everything Connects in One Loop */}
      <section className="bg-amber-50 border-2 border-[#dfa62a] rounded-xl p-6 space-y-2.5 text-[#081d38]">
        <div className="flex items-center gap-2 font-serif text-xl font-bold">
          <RefreshCw className="w-5 h-5 text-amber-800" aria-hidden="true" />
          <h2>How Everything Connects in One Loop</h2>
        </div>
        <p className="text-sm sm:text-base leading-relaxed">
          <strong>Everyday Families</strong> buy and sell household goods (
          <strong>50% cash / 25% seller / 25% buyer</strong>) &rarr;{' '}
          <strong>Accumulation Balances</strong> pool through verified escrow to buy{' '}
          <strong>100% debt-free apartment silos</strong> &rarr;{' '}
          <strong>Net Rental Income</strong> splits <strong>70% to Owners</strong> (fighting
          inflation) and <strong>30% to The National Discovery Awards</strong> (empowering great
          teachers &amp; working-class public school students) &rarr;{' '}
          <strong>Discovery Brick Coins (DBC)</strong> give Owners a clean, transferable door out
          while the debt-free buildings stay standing forever.
        </p>
      </section>
    </div>
  );
};
