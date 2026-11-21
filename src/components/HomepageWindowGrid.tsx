import React, { useEffect, useState } from 'react';
import {
  HomepageWindowCardData,
  QuickBridgePreviewModal,
} from './QuickBridgePreviewModal';

interface HomepageWindowCardConfig extends Omit<HomepageWindowCardData, 'onOpenFullPage' | 'onOpenConstitution'> {
  titleLine2?: string;
  subtitle?: string;
  image: string;
  description: string;
  navButtonLabel: string;
  customRoute?: 'columbo' | 'pipito';
}

interface HomepageWindowGridProps {
  onNavigateByButtonLabel: (navButtonLabel: string) => void;
  onOpenCustomPage: (page: 'columbo' | 'pipito') => void;
}

const DEXPA_SLIDES = [
  {
    src: '/src/assets/images/dexpa_slide_500_gringo_1795200300809.jpg',
    alt: 'Discovery Exchange Parents Alliance (DEXPA) — Real Owners, Real Property, Real Personality ($500 Rental Property)',
    cropLeftEdge: true,
  },
  {
    src: '/src/assets/images/dexpa_terrace_students_fixed_1795200580933.jpg',
    alt: 'Discovery Exchange Parents Alliance (DEXPA) — Come join us, be the next DEXPA — We are the future of DEXPA',
    cropLeftEdge: false,
  },
];

const AUCTION_SLIDES = [
  {
    src: '/src/assets/images/dxpa_bank_auctions_temple_1794486688802.jpg',
    alt: 'Discovery Exchange Parents Alliance — Upcoming Bank Auctions',
  },
  {
    src: '/src/assets/images/dxpa_live_online_auction_full_1794756924946.jpg',
    alt: 'Discovery Exchange Parents Alliance (DEXPA) — Live Online & In-Person Bank-Owned Real Estate Auctions',
  },
];

const CONSTITUTION_SLIDES = [
  {
    src: '/src/assets/images/card_constitution_bylaws_1794483102280.jpg',
    alt: 'TDEX / DEXPA Constitution — Master Charter & Bylaws',
  },
  {
    src: '/assets/aistudio/image-gen-2_10__abd1c3d6.webp',
    alt: 'The Discovery Exchange — Give us a chance to earn your trust. Of the People, By the People, For the People.',
  },
];

const FIFTEEN_WINDOW_CARDS: HomepageWindowCardConfig[] = [
  {
    id: 'dexpa',
    title: 'Discovery Exchange Parents Alliance (DEXPA)',
    subtitle: 'Bank Auctions 70/30 Program',
    image: '/src/assets/images/dexpa_terrace_students_fixed_1795200580933.jpg',
    description:
      'New to TDEX? DEXPA unites everyday families as equal Owners (One Owner, One Vote, zero bosses) to buy bank-auction and courthouse homes 100% debt-free—without risking family savings. Families build separate balances in licensed wallets (like PayPal, $0 fees from TDEX) to fund licensed seller-side escrow directly, splitting clean net rent 70% to Owners and 30% to K–12 school awards. At 1,000 verified Owners, we file with the NCUA to charter our own 100% Owner-owned Federal Credit Union.',
    articleCitation: 'Articles 1, 4.1, 9, 10 & 11',
    quickReminder:
      'Unites everyday parents as equal Owners—turning everyday household trades into shared debt-free real estate, K–12 classroom awards, and our own Federal Credit Union at 1,000 Owners.',
    bridgeExplanation:
      'New to TDEX? DEXPA unites everyday families as equal Owners (One Owner, One Vote, zero bosses) to buy bank-auction and courthouse homes 100% debt-free—without risking family savings. Families build separate balances in licensed wallets (like PayPal, $0 fees from TDEX) to fund licensed seller-side escrow directly, splitting clean net rent 70% to Owners and 30% to K–12 school awards. At 1,000 verified Owners, we file with the NCUA to charter our own 100% Owner-owned Federal Credit Union.',
    keyTakeaways: [
      'Why families unite: One Owner, One Vote, zero corporate or Wall Street bosses.',
      'Your own separate wallet ($0 TDEX fees): 25% Marketplace credits accumulate in your PayPal or licensed wallet until matched to seller-side escrow.',
      'Debt-free rental homes: Clean net rent splits 70% to participating families and 30% to K–12 teacher & student awards.',
      'At 1,000 verified Owners, we file with the NCUA to charter our own federally insured, 100% Owner-owned Federal Credit Union.',
    ],
    targetRouteLabel: 'Parents Alliance (DEXPA)',
    navButtonLabel: 'Parents Alliance (DEXPA)',
  },
  {
    id: 'marketplace',
    title: 'Discovery Marketplace',
    titleLine2: 'Online Garage Sale',
    subtitle: '50/25/25 Program',
    image: '/src/assets/images/online_discovery_marketplace_1795199437252.jpg',
    description:
      'Turn everyday household items you no longer use into real estate ownership online—without touching family savings. Whenever an item sells on our $0-fee Online Garage Sale Marketplace, your licensed payment processor (such as PayPal) automatically splits checkout three ways: 50% goes straight to the seller in immediate spending cash, 25% builds the seller’s separate property wallet, and 25% builds the buyer’s separate property wallet. Every online purchase or sale moves your family closer to owning debt-free rental property while funding K–12 schools.',
    articleCitation: 'Article 12.1',
    quickReminder:
      'Try the interactive 50/25/25 garage-sale trade walkthrough and calculator—see the exact split step by step without charging a card.',
    bridgeExplanation:
      'Turn unused tools, bikes, or home items into family savings and cash: walk any trade to see 50% immediate seller cash, 25% seller property credit, and 25% buyer property cashback (with 0% TDEX listing fee and an optional cash-only path).',
    keyTakeaways: [
      '50% immediate seller cash + 25% seller property credit + 25% buyer credit (cash-only option also supported).',
      '0% TDEX platform listing fee.',
      'Full 50/25/25 walkthrough ready to test without charging any card or account.',
    ],
    targetRouteLabel: 'Free/Marketplace',
    navButtonLabel: 'Free/Marketplace',
  },
  {
    id: 'brick_coin',
    title: 'Discovery Brick Coin',
    titleLine2: 'Meet the Next Hottest Cryptocurrency',
    subtitle: 'Limited to Only 100,000,000 Units',
    image: '/assets/aistudio/brickcoin_hero_fixed.jpg',
    description:
      'Discovery Brick Coins (DBC) are strictly capped at 100,000,000 units forever and are never sold as speculative crypto. Instead, DBC rewards verified K–12 teacher and student breakthroughs and gives participating Owners a clean, transferable door out if life circumstances change—allowing families to transfer their recorded position without ever forcing the sale or mortgaging of the underlying community apartment buildings, which stay 100% debt-free and protected in trust.',
    articleCitation: 'Article 11, Article 14 & Schedule A',
    quickReminder:
      'Explore the 100M fixed cap, 95% / 3% / 1% / 1% pool schedule, and interactive vesting shield inside Brick$Coin.',
    bridgeExplanation:
      'Discovery Brick Coin (DBC) is strictly capped at 100,000,000 units, never issues ahead of recorded property deeds (zero presales), and gives zero extra governance votes.',
    keyTakeaways: [
      'Hard supply ceiling locked at 100,000,000 units (zero inflation, zero presales before deed recording).',
      '95% Owner Community & Mission / 3% 50-Yr Contributors / 1% Founder / 1% Future AI Reserve.',
      'Protected by Module 06 proportional vesting & 3-shard SHA-256 verification.',
    ],
    targetRouteLabel: 'Brick$Coin',
    navButtonLabel: 'Brick$Coin',
  },
  {
    id: 'constitution',
    title: 'TDEX / DEXPA Constitution',
    image: '/src/assets/images/card_constitution_bylaws_1794483102280.jpg',
    description:
      'Full searchable Constitution covering One Owner, One Vote governance, 100M DBC Cap, 50/25/25 Marketplace, and Debt-Free Silos.',
    articleCitation: 'Articles 1–21 & Schedules A–E (v10.0)',
    quickReminder:
      'Open the full searchable Charter to walk through every article on governance, isolated silos, DILOS safeguards, and public schools awards math.',
    bridgeExplanation:
      'Browse and search all 21 Articles of Charter Version 10.0—covering One Owner, One Vote governance, debt-free isolated silos, DILOS separation of duties, and Funded-First prize rules.',
    keyTakeaways: [
      'Searchable 21-article Constitution ready to inspect and review.',
      'No Bosses in governance (One Owner, One Vote).',
      'Motto: "Let us sit crooked, but let us talk straight."',
    ],
    targetRouteLabel: 'TDEX Constitution',
    navButtonLabel: 'TDEX Constitution',
  },
  {
    id: 'mom_pop_boardroom',
    title: 'Mom & Pop Board',
    image: '/src/assets/images/card_district_reps_1794483101400.jpg',
    description:
      'Governance Model: 30-person Mom & Pop Board chosen by random draw with staggered terms and no permanent corporate bosses.',
    articleCitation: 'Articles 4.1, 5.1, 5.2 & 5.4',
    quickReminder:
      'Rotating 30-person Mom & Pop Board chosen by random draw so everyday families—never entrenched bosses—steer priorities.',
    bridgeExplanation:
      'Instead of self-perpetuating boards, 30 Owners in good standing rotate on the Mom & Pop Board by random selection on staggered terms, with conflict recusal and removal-for-cause rules.',
    keyTakeaways: [
      '30-person Mom & Pop Board chosen by random draw among verified Owners.',
      'Clear eligibility, conflict recusal, and 2/3 removal-for-cause rules (Article 5.4 & 6.2).',
      'Zero entrenched corporate bosses—One Owner, One Vote.',
    ],
    targetRouteLabel: 'Mom & Pop Board',
    navButtonLabel: 'Mom & Pop Board',
  },
  {
    id: 'arbitration_court',
    title: 'Internal Arbitration Court',
    image: '/src/assets/images/card_arbitration_court_scales_1794487611446.jpg',
    description:
      'Internal Review: 12-person out-of-state Owner Jury drawn at random with conflict screening and full legal rights preserved.',
    articleCitation: 'Articles 5.3, 16 & 17',
    quickReminder:
      'Resolves internal audit reviews through 12 unrelated out-of-state Owners—never blocking public courts.',
    bridgeExplanation:
      '12 conflict-screened out-of-state Owners drawn at random review anonymized evidence packets with mandatory recusal and full legal rights preserved.',
    keyTakeaways: [
      'Random 12-Owner jury panel screened for state, family, and vendor conflicts.',
      'Reviews anonymized packets without student PII.',
      'Preserves full legal rights (Article 17) and external reporting.',
    ],
    targetRouteLabel: 'Internal Arbitration Court',
    navButtonLabel: 'Internal Arbitration Court',
  },
  {
    id: 'ai_columbo',
    title: 'AI Columbo Internal Investigation',
    image: '/src/assets/images/card_columbo_detective_desk_1794487609104.jpg',
    description:
      'Bounded Investigator AI that audits the books, checks 50/25/25 and 70/30 arithmetic, flags duplicates, and keeps every question on the record.',
    articleCitation: 'Articles 7.1, 7.2 & Q76',
    quickReminder:
      'Independent auditing AI that checks every cent of 50/25/25 & 70/30 math and surfaces vendor conflicts—without ever judging or touching funds.',
    bridgeExplanation:
      'Stage 2 of the DILOS pipeline inspects receipts, hashes, and math splits continuously. If two bids share an address or cents fail to balance, Columbo sends a signed audit note directly to the 12-Owner Jury.',
    keyTakeaways: [
      'Checks 50/25/25 marketplace and 70/30 rental splits to exact integer-cent conservation.',
      'Scans for duplicate public school video hashes and hidden vendor address overlaps.',
      'Strictly bounded by Article 7.2: never approves payouts, never judges, never touches money.',
    ],
    targetRouteLabel: 'AI Columbo Internal Investigation',
    navButtonLabel: 'AI Columbo Internal Investigation',
    customRoute: 'columbo',
  },
  {
    id: 'ai_pipito',
    title: 'AI Pipito Internal Gatekeeping',
    image: '/src/assets/images/card_pipito_three_keys_1794487609493.jpg',
    description:
      'Bounded Gatekeeper AI checking constitutional safeguards and separation of duties before mandatory Independent Human Witness sign-off.',
    articleCitation: 'Articles 7.1, 7.3, 10.6, 11.7 & Q77',
    quickReminder:
      'Fail-closed Constitutional Gatekeeper that halts any ledger write violating debt-free silos, the 100M DBC cap, or Funded-First escrow rules.',
    bridgeExplanation:
      'Stage 3 of DILOS stands guard before any permanent ledger commit. Even if pressured, Pipito immediately triggers PIPITO_HALT if a property carries mortgage debt, DBC exceeds 100,000,000 units, or a Human Witness signature is missing.',
    keyTakeaways: [
      'Enforces Article 10.6 (zero mortgage debt), Article 11.7 (100M DBC cap), and Article 13.1 (Funded-First).',
      'Fail-closed architecture: blocks unsafe commits automatically instead of failing open.',
      'Always requires an Independent Human Witness co-signature for final ledger execution.',
    ],
    targetRouteLabel: 'AI Pipito Internal Gatekeeping',
    navButtonLabel: 'AI Pipito Internal Gatekeeping',
    customRoute: 'pipito',
  },
  {
    id: 'open_chat',
    title: 'Open Chat Window',
    image: '/src/assets/images/card_open_chat_community_1794487611965.jpg',
    description:
      'Owners Chat Room (18+ Adults): Share honest feedback, spot blind spots, and debate the blueprint openly at the kitchen table.',
    articleCitation: 'Articles 1.1, 6.4, 8.4 & 19.4',
    quickReminder:
      'Adults-only (18+) open discussion room with live polling and automatic email, phone, and zip code privacy masking.',
    bridgeExplanation:
      'Honest public criticism makes blueprints stronger. Step inside the open discussion room to test live polling, share blind spots, and watch Concierge automatically mask stray phone numbers or emails.',
    keyTakeaways: [
      'Open kitchen-table feedback for 18+ adult Owners and public school educators.',
      'Automatic PII redaction hides phone numbers, emails, and zip codes on submit.',
      'Chat discussions help improve ideas without altering formal rules without Owner votes.',
    ],
    targetRouteLabel: 'Open WTF/Chat Room',
    navButtonLabel: 'Open WTF/Chat Room',
  },
  {
    id: 'bank_auctions',
    title: 'Auction & Silo Watch',
    subtitle: 'Live & Upcoming Bank Auctions',
    image: '/src/assets/images/dxpa_live_online_auction_full_1794756924946.jpg',
    description:
      'Watch courthouse and bank-owned property auctions targeted debt-free at 20%–30% below market—and inspect every isolated 1,000-Nugget silo book openly.',
    articleCitation: 'Articles 9.1, 9.4, 9.5 & 10.5',
    quickReminder:
      'Walk the 20%–30% auction discount and 70/30 rental calculator inside our isolated property silos.',
    bridgeExplanation:
      'Properties are targeted 100% cash at 20%–30% below market appraisal. After taxes, insurance, repairs, and reserves, clean net rent splits 70% to Silo Owners and 30% to The National Discovery Awards.',
    keyTakeaways: [
      'Clean net distributable cash after property taxes, insurance, repairs, and reserves.',
      'Isolated silo liability protection (Article 9.1): one building can never cross-collateralize another.',
      'Permanent 70% Owners / 30% National Discovery Awards net rent split (Article 11.3).',
    ],
    targetRouteLabel: 'Auction & Silo Watch',
    navButtonLabel: 'Auction & Silo Watch',
  },
  {
    id: 'concierge_card',
    title: '24/7 YourConcierge',
    image: '/src/assets/images/mascot_concierge_puppy_1794483065529.jpg',
    description:
      'Instant, plain-language answers grounded strictly in our approved 150-Question Master Q&A Encyclopedia—with automatic student privacy protection.',
    articleCitation: 'Articles 2.4, 7.1 & 8.4 (Q1–Q150)',
    quickReminder:
      'Friendly 24/7 guide answering from 150 constitutional Q&As with zero hallucination and automatic PII privacy stripping.',
    bridgeExplanation:
      'YourConcierge is Stage 1 of the DILOS pipeline: it strips emails, phone numbers, and zip codes before data leaves intake, and answers questions strictly from the approved Version 10.0 & Operating Laws encyclopedia without inventing rules.',
    keyTakeaways: [
      'Strictly bounded to Q1–Q150, Constitution Version 10.0 & Operating Laws (never guesses or makes up policy).',
      'Strips student and family PII into the air-gapped PII Vault (Article 8.4).',
      'Cannot alter constitutional rules, move funds, or decide award winners (Article 7.2).',
    ],
    targetRouteLabel: '24/7 Concierge Q&A',
    navButtonLabel: '24/7 Concierge Q&A',
  },
  {
    id: 'discovery_studio',
    title: 'Discovery Studio',
    image: '/assets/aistudio/The_Discovery_Exchange__Mountain_Road_Misadventure__1__d0af7ca0.webp',
    description:
      'Showcase public school teacher mentorship and student breakthroughs across Applied, Analytical, and Hybrid Discovery—plus our free Classroom Build Sheets.',
    articleCitation: 'Articles 3.3, 4.5, 8.4 & Schedule E',
    quickReminder:
      'Open Channel #15 video showcase where students upload 2-minute unedited demonstrations with live surprise anti-cheat prompts.',
    bridgeExplanation:
      'Discovery Studio brings the National Discovery Awards to life: public school students demo garage or classroom builds, Concierge strips PII before intake, and teachers anywhere can download free Classroom Build Sheets to replicate winners at $0 cost.',
    keyTakeaways: [
      'Mandatory parental/guardian consent and non-family public school educator attestation (Article 4.5).',
      'Live surprise 2-minute verification prompt stops pre-packaged adult ghost-builds.',
      'Free downloadable Classroom Build Sheets shared openly under Schedule E.',
    ],
    targetRouteLabel: 'Discovery Studio',
    navButtonLabel: 'Discovery Studio',
  },
  {
    id: 'national_discovery_awards',
    title: 'National Discovery Awards–NDA',
    image: '/src/assets/images/hero_discovery_prize_teachers_students_1794550346108.jpg',
    description:
      'Teachers First & Working-Class Students: $1M District · $2.5M State · $10M National prizes (goal to reach by 2035)—50% Student Trust, 25% Teacher, 15% Tools, 10% Endowment.',
    articleCitation: 'Articles 3.1, 3.3 & 13.1',
    quickReminder:
      'Explore the 10-point anti-wealth rubric, $1M / $2.5M / $10M prize ladder (goal to reach by 2035), and interactive entry walkthrough.',
    bridgeExplanation:
      'Funded strictly on the Funded-First rule (Article 13.1), public school awards honor great teachers and uplift working-class students—50% Student Education Fund, 25% Mentoring Teachers, 15% Classroom Tools, and 10% Property Endowment.',
    keyTakeaways: [
      '50% Student Education Fund / 25% Mentoring Teacher / 15% Classroom Tools / 10% Endowment.',
      '$1M Local District • $2.5M State • $10M National — Goal to reach by 2035 ($250k / $500k / $1M milestones).',
      '100% blind out-of-state judging with $0 entry cost for public school teachers and working-class students.',
    ],
    targetRouteLabel: 'National Discovery Awards–NDA',
    navButtonLabel: 'National Discovery Awards–NDA',
  },
  {
    id: 'school_district_awards',
    title: 'School District / Awards',
    image: '/src/assets/images/card_student_stem_prize_1794483085267.jpg',
    description:
      'Free $0 preview model connecting public school teachers and school districts with direct 15% classroom tool grants and 25% teacher honoraria.',
    articleCitation: 'Articles 1.3, 3.1, 6.2 & 13',
    quickReminder:
      'Walk through the 5-step district onboarding preview and blind out-of-state judging model.',
    bridgeExplanation:
      'Teachers, principals, and parents can walk through the $0 district chapter workflow and see how blind out-of-state judging keeps awards fair for working-class schools (sample chapters shown as illustrations).',
    keyTakeaways: [
      '$0 district registration walkthrough; sample chapters shown as illustrative templates.',
      'Strict student privacy stripping and guardian consent protections before judging.',
      'Out-of-state blind judging ensures District Pushers never judge their own schools (Art. 6.2).',
    ],
    targetRouteLabel: 'School District / Awards',
    navButtonLabel: 'School District / Awards',
  },
  {
    id: 'donate_support',
    title: 'Donate / Need Donation',
    image: '/src/assets/images/card_donate_classroom_support.jpg',
    description:
      'Walk through classroom support pledges ($25–$250 preview) or request $0 classroom supplies and shop tools for public school teachers and students.',
    articleCitation: 'Articles 3.2, 4.1, 10.3 & 15.1',
    quickReminder:
      'Explore segregated mission designations, preview a pledge split, or log a classroom tool request—zero cards charged in this draft.',
    bridgeExplanation:
      'Inside Donate / Need Donation, visitors can walk through segregated classroom support designations or submit a classroom supply request for public school teachers (no cards charged and no Gmail PayPal links active in this working draft).',
    keyTakeaways: [
      'Interactive contribution split walkthrough (no real cards or external PayPal accounts charged).',
      'Free classroom supply & lab tool request intake for public school teachers and families.',
      'Every dollar earmarked is structurally separated from governance voting (Articles 4.1 & 10.3).',
    ],
    targetRouteLabel: 'Donate / Need Donation',
    navButtonLabel: 'Donate / Need Donation',
  },
];

export const HomepageWindowGrid: React.FC<HomepageWindowGridProps> = ({
  onNavigateByButtonLabel,
  onOpenCustomPage,
}) => {
  const [dexpaIdx, setDexpaIdx] = useState(0);
  const [auctionIdx, setAuctionIdx] = useState(0);
  const [constitutionIdx, setConstitutionIdx] = useState(0);
  const [selectedBridgeCard, setSelectedBridgeCard] = useState<HomepageWindowCardData | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setDexpaIdx((prev) => (prev + 1) % DEXPA_SLIDES.length);
      setAuctionIdx((prev) => (prev + 1) % AUCTION_SLIDES.length);
      setConstitutionIdx((prev) => (prev + 1) % CONSTITUTION_SLIDES.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, []);

  const openBridgeModal = (cfg: HomepageWindowCardConfig) => {
    setSelectedBridgeCard({
      id: cfg.id,
      title: cfg.title,
      articleCitation: cfg.articleCitation,
      quickReminder: cfg.quickReminder,
      bridgeExplanation: cfg.bridgeExplanation,
      keyTakeaways: cfg.keyTakeaways,
      targetRouteLabel: cfg.targetRouteLabel,
      onOpenFullPage: () => {
        if (cfg.customRoute) {
          onOpenCustomPage(cfg.customRoute);
        } else {
          onNavigateByButtonLabel(cfg.navButtonLabel);
        }
      },
      onOpenConstitution: () => {
        onNavigateByButtonLabel('TDEX Constitution');
      },
    });
  };

  const rowOneCards = FIFTEEN_WINDOW_CARDS.slice(0, 3);
  const rowTwoCards = FIFTEEN_WINDOW_CARDS.slice(3, 6);
  const rowThreeCards = FIFTEEN_WINDOW_CARDS.slice(6, 9);
  const remainingCards = FIFTEEN_WINDOW_CARDS.slice(9);

  const renderCard = (card: HomepageWindowCardConfig) => (
    <article
      key={card.id}
      className="bg-white border-[3px] border-[#071936] rounded-[30px] overflow-hidden flex flex-col text-center shadow-xs hover:shadow-xl transition-shadow"
    >
      {/* Navy Card Header */}
      <div className="bg-[#071936] text-white px-4 py-3.5 min-h-[84px] md:min-h-[96px] flex flex-col items-center justify-center border-b-2 border-[#dfa62a]/70">
        <h3 className="font-serif text-[clamp(0.95rem,1.22vw,1.15rem)] font-bold leading-snug text-white">
          {card.title}
          {card.titleLine2 && (
            <span className="block whitespace-nowrap">{card.titleLine2}</span>
          )}
        </h3>
        {card.subtitle && (
          <p className="font-serif text-[clamp(0.86rem,1.08vw,1.02rem)] font-bold leading-snug text-[#fcd34d] mt-0.5">
            {card.subtitle}
          </p>
        )}
      </div>

      {/* 16:9 Window Frame */}
      <div className="px-[clamp(0.85rem,1.3vw,1.25rem)] pt-[clamp(0.85rem,1.3vw,1.25rem)] pb-3">
        <div
          onClick={() => openBridgeModal(card)}
          className="relative aspect-[16/9] w-full rounded-[20px] border-[2.5px] border-[#071936] overflow-hidden bg-[#071936] cursor-pointer group"
        >
          {card.id === 'dexpa' ? (
            <>
              {DEXPA_SLIDES.map((slide, idx) => (
                <img
                  key={slide.src}
                  src={slide.src}
                  alt={slide.alt}
                  referrerPolicy="no-referrer"
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                    slide.cropLeftEdge ? 'scale-[1.06] origin-right' : ''
                  } ${idx === dexpaIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                />
              ))}
            </>
          ) : card.id === 'bank_auctions' ? (
            <>
              {AUCTION_SLIDES.map((slide, idx) => (
                <img
                  key={slide.src}
                  src={slide.src}
                  alt={slide.alt}
                  referrerPolicy="no-referrer"
                  className={`absolute inset-0 w-full h-full object-fill transition-opacity duration-700 ${
                    idx === 1 ? 'scale-[1.07] origin-[50%_62%]' : ''
                  } ${idx === auctionIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                />
              ))}
            </>
          ) : card.id === 'constitution' ? (
            <>
              {CONSTITUTION_SLIDES.map((slide, idx) => (
                <img
                  key={slide.src}
                  src={slide.src}
                  alt={slide.alt}
                  referrerPolicy="no-referrer"
                  className={`absolute inset-0 w-full h-full object-fill transition-opacity duration-700 ${
                    idx === constitutionIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'
                  }`}
                />
              ))}
            </>
          ) : card.id === 'brick_coin' ? (
            <div className="relative w-full h-full overflow-hidden bg-[#020714]">
              <img
                src="/assets/home/brickcoin_space_bg.jpg"
                alt="You Know Bitcoin. Now Meet Discovery Brick Coin. Backed Up by Real Estate."
                referrerPolicy="no-referrer"
                className="w-full h-full object-fill block"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute right-[1%] top-[4%] bottom-[4%] w-[46%] rounded-full bg-[#092045]/45 blur-xl"
              />
              <div className="brickcoin-stage absolute right-[3%] top-[7%] bottom-[7%] aspect-square flex items-center justify-center">
                <div className="brickcoin-spinner relative w-full h-full rounded-full drop-shadow-[0_0_18px_rgba(252,211,77,0.45)]">
                  <img
                    src="/assets/home/brickcoin_front_clean.webp?v=20261120"
                    alt="Discovery Brick Coin — Local Districts & National Prizes (1776–2026)"
                    referrerPolicy="no-referrer"
                    className="brickcoin-face absolute inset-0 w-full h-full object-contain rounded-full"
                  />
                  <img
                    src="/assets/home/brickcoin_front_clean.webp?v=20261120"
                    alt="Discovery Brick Coin — Real Estate Backed Reserve (1776–2026)"
                    referrerPolicy="no-referrer"
                    className="brickcoin-face brickcoin-face-back absolute inset-0 w-full h-full object-contain rounded-full"
                  />
                </div>
              </div>
            </div>
          ) : card.id === 'concierge_card' ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster={card.image}
              onLoadedMetadata={(e) => {
                e.currentTarget.defaultPlaybackRate = 0.5;
                e.currentTarget.playbackRate = 0.5;
              }}
              onPlay={(e) => {
                e.currentTarget.defaultPlaybackRate = 0.5;
                e.currentTarget.playbackRate = 0.5;
              }}
              className="w-full h-full object-cover object-center scale-[1.03] block"
            >
              <source
                src="/assets/aistudio/AaHfy34J7-3l5-RqVYuesw-AaHfy34JzpzrhfpQvhfGnA_87ec6287.mp4"
                type="video/mp4"
              />
            </video>
          ) : (
            <img
              src={card.image}
              alt={card.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-fill group-hover:scale-[1.02] transition-transform duration-300"
            />
          )}
        </div>
      </div>

      {/* Body & Read More CTA */}
      <div className="px-6 pt-2 pb-6 flex-1 flex flex-col justify-between">
        <p className="text-[0.98rem] sm:text-[1.02rem] leading-[1.6] text-[#0f172a] mb-5">
          {card.description}
        </p>
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={() => openBridgeModal(card)}
            className="bg-[#071936] hover:bg-[#1e3a8a] text-white border border-[#dfa62a]/60 font-sans font-bold text-sm px-8 py-2.5 rounded-[6px] transition-colors cursor-pointer"
          >
            read more
          </button>
        </div>
      </div>
    </article>
  );

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {rowOneCards.map(renderCard)}
      </div>

      {/* Navy Governance Introduction Banner above Row 2 */}
      <div className="-mx-4 sm:-mx-6 bg-[#071936] text-white py-5 px-4 sm:px-6 text-center my-7 shadow-xs">
        <div className="max-w-5xl mx-auto space-y-1.5 text-center">
          <h2 className="font-serif text-xl sm:text-2xl lg:text-[1.58rem] font-bold tracking-wide text-white">
            The Governance of The Discovery Exchange
          </h2>
          <p className="text-sm sm:text-base text-[#fcd34d] font-bold">
            This Is How We Are Governed — One Owner, One Vote
          </p>
          <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-normal max-w-4xl mx-auto">
            No permanent corporate bosses and no backroom control—everyday parent Owners govern
            through our searchable Constitution, a randomly drawn 30-person Mom &amp; Pop Board, and
            a 12-person out-of-state Internal Arbitration Court.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {rowTwoCards.map(renderCard)}
      </div>

      {/* Navy Safety & Security Protocols Introduction Banner above Row 3 */}
      <div className="-mx-4 sm:-mx-6 bg-[#071936] text-white py-5 px-4 sm:px-6 text-center my-7 shadow-xs">
        <div className="max-w-5xl mx-auto space-y-1.5 text-center">
          <h2 className="font-serif text-xl sm:text-2xl lg:text-[1.58rem] font-bold tracking-wide text-white">
            Safety &amp; Security Protocols of The Discovery Exchange
          </h2>
          <p className="text-sm sm:text-base text-[#fcd34d] font-bold">
            Independent AI Auditing, Constitutional Gatekeeping &amp; Open Kitchen-Table Oversight
          </p>
          <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-normal max-w-4xl mx-auto">
            Every dollar, math split, and privacy safeguard is checked around the clock—AI Columbo
            audits the books, AI Pipito enforces fail-closed constitutional gatekeeping, and our Open
            Chat Room keeps public review wide open.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {rowThreeCards.map(renderCard)}
      </div>

      {/* Compact Navy Introduction Banner above the Last Six Windows */}
      <div className="-mx-4 sm:-mx-6 bg-[#071936] text-white py-3.5 px-4 sm:px-6 text-center my-6 shadow-xs">
        <div className="max-w-5xl mx-auto space-y-0.5 text-center">
          <h2 className="font-serif text-lg sm:text-xl font-bold tracking-wide text-white">
            Public Schools, Auctions &amp; Community Support
          </h2>
          <p className="text-xs sm:text-sm text-[#fcd34d] font-semibold">
            Live auctions, 24/7 Concierge Q&amp;A, student showcases, school district awards, and
            classroom support.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {remainingCards.map(renderCard)}
      </div>

      <QuickBridgePreviewModal
        card={selectedBridgeCard}
        onClose={() => setSelectedBridgeCard(null)}
      />
    </>
  );
};
