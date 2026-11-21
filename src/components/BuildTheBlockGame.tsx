import React, { useState } from 'react';
import {
  AlertTriangle,
  Award,
  Building2,
  CheckCircle2,
  Coins,
  Gamepad2,
  GraduationCap,
  Maximize2,
  Minimize2,
  Play,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import { HowToPlayWalkthroughModal } from './HowToPlayWalkthroughModal';

interface TradeCard {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface ChallengeEvent {
  id: string;
  title: string;
  prompt: string;
  goodLabel: string;
  goodOutcome: string;
  goodBonus: number;
  trapLabel: string;
  trapOutcome: string;
  trapPenalty: number;
}

interface LeaderboardEntry {
  handle: string;
  teamCode: string;
  chapterName: string;
  roleType: 'School District / Classroom' | 'City Chapter';
  practicePoints: number;
  buildingsClosed: number;
}

const HOUSEHOLD_INVENTORY: TradeCard[] = [
  { id: 'couch', name: 'Unused Family Sofa / Furniture Set', price: 320, category: 'Home & Furniture' },
  { id: 'tools', name: '120-Piece Mechanics Tool Chest', price: 240, category: 'Tools & Workshop' },
  { id: 'bike', name: 'Youth Mountain Bike', price: 200, category: 'Bikes & Sports' },
  { id: 'violin', name: 'Student Violin & Hard Case', price: 220, category: 'Music & Arts' },
  { id: 'scope', name: '1200x Lab Microscope', price: 160, category: 'Science & Education' },
  { id: 'guitar', name: 'Mini Electric Guitar & Amp', price: 180, category: 'Music & Arts' },
];

const DILOS_EVENTS: ChallengeEvent[] = [
  {
    id: 'mortgage-trap',
    title: 'Mortgage Trap vs. Debt-Free Choice (Article 9.1)',
    prompt:
      'A bank offers a fast mortgage with 7% interest so you can buy an apartment building early using debt. Do you accept or reject?',
    goodLabel: 'Reject Bank Mortgage — Stay 100% Debt-Free',
    goodOutcome:
      'Pipito APPROVED! Rejecting bank debt protects every family from foreclosure forever. (+150 Practice Property Balance & +100 Discovery Points)',
    goodBonus: 150,
    trapLabel: 'Accept 7% Bank Mortgage',
    trapOutcome:
      'PIPITO CONSTITUTIONAL BLOCK! Under Article 9.1, TDEX Property Silos are strictly 100% debt-free—mortgages are constitutionally prohibited.',
    trapPenalty: 50,
  },
  {
    id: 'columbo-inspection',
    title: 'Columbo Inspection & 60-Second Escrow Refund Check',
    prompt:
      'An independent licensed inspector uncovers hidden roof damage on a courthouse auction property during the escrow window. What do you do?',
    goodLabel: 'Trigger 60-Second 100% Failed-Deal Refund Protection',
    goodOutcome:
      'Columbo VERIFIED! Every family keeps 100% of their funds safely in their own accounts and moves to a clean building. (+120 Practice Property Balance)',
    goodBonus: 120,
    trapLabel: 'Skip Inspection to Rush Closing',
    trapOutcome:
      'PIPITO CONSTITUTIONAL BLOCK! Skipping Schedule B licensed inspection puts family maintenance reserves at risk.',
    trapPenalty: 50,
  },
  {
    id: 'one-owner-vote',
    title: 'Anti-Boss Governance Check (Article 4.1)',
    prompt:
      'A wealthy sponsor offers extra funds in exchange for 10 extra votes on the 30-person Owner Board. How do you respond?',
    goodLabel: 'Enforce One Verified Human Owner = One Vote',
    goodOutcome:
      'DILOS & Human Witness SIGNED OFF! Zero bosses, zero vote buying, equal Owner governance preserved. (+100 Practice Property Balance)',
    goodBonus: 100,
    trapLabel: 'Grant Extra Board Votes',
    trapOutcome:
      'PIPITO CONSTITUTIONAL BLOCK! Article 4.1 forbids money-weighted votes under any circumstance.',
    trapPenalty: 50,
  },
];

const DAILY_DISCOVERY_QUESTIONS = [
  {
    id: 'q-applied',
    category: '1. Applied Discovery (Article 3.3)',
    question:
      'A 9th-grade student uses recycled plastic bottles and sand to build a low-cost classroom water filter that removes 94% of sediment. Which Discovery category is this?',
    options: [
      'Applied Discovery — practical working prototype built to solve a real-world problem',
      'Purely financial speculation',
      'Commercial advertising',
    ],
    correctIndex: 0,
    explanation:
      'Applied Discovery honors hands-on prototypes, inventions, and practical engineering built with everyday classroom or garage materials.',
  },
  {
    id: 'q-analytical',
    category: '2. Analytical Discovery (Article 3.3)',
    question:
      'A public high school class analyzes 10 years of local traffic and summer heat data to publish an open statistical blueprint for cooling city bus stops. Which category is this?',
    options: [
      'Private equity bidding',
      'Analytical Discovery — rigorous research, data analysis, or scientific/mathematical insight',
      'Equipment resale',
    ],
    correctIndex: 1,
    explanation:
      'Analytical Discovery rewards students and teachers who uncover meaningful scientific, mathematical, historical, or civic insights through careful analysis.',
  },
  {
    id: 'q-hybrid',
    category: '3. Hybrid Discovery (Article 3.3)',
    question:
      'A middle school science team both measures classroom CO2 air-flow data AND builds an affordable solar-powered window fan that cuts CO2 levels in half. Which category fits best?',
    options: [
      'Unverified guess',
      'Debt financing',
      'Hybrid Discovery — combining original analytical research with a working applied build',
    ],
    correctIndex: 2,
    explanation:
      'Hybrid Discovery celebrates projects that unite strong analytical investigation with a working real-world build.',
  },
];

const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    handle: 'GarageBuilder_NV',
    teamCode: 'CLARK-SCI-7',
    chapterName: 'Clark County 7th Grade Science',
    roleType: 'School District / Classroom',
    practicePoints: 1850,
    buildingsClosed: 2,
  },
  {
    handle: 'BuckeyeParent_OH',
    teamCode: 'CLEVE-CHAPTER',
    chapterName: 'Cleveland Metro Chapter',
    roleType: 'City Chapter',
    practicePoints: 1490,
    buildingsClosed: 2,
  },
  {
    handle: 'LoneStarLab_TX',
    teamCode: 'HOUSTON-STEM',
    chapterName: 'Houston Public High Makerspace',
    roleType: 'School District / Classroom',
    practicePoints: 1120,
    buildingsClosed: 1,
  },
  {
    handle: 'MainStreetMom_PA',
    teamCode: 'PHILLY-BLOCK',
    chapterName: 'Philadelphia Neighborhood Pushers',
    roleType: 'City Chapter',
    practicePoints: 940,
    buildingsClosed: 1,
  },
];

const NEIGHBORHOOD_SILOS = [
  'Oak Street Family Apartments',
  'Maple Avenue Working-Class Lofts',
  'Lincoln Park Brick Residences',
  'Riverfront Community Commons',
  'Cedar Heights Teacher & Family Homes',
  'Liberty Square Debt-Free Flats',
];

const getSiloName = (siloNumber: number) =>
  NEIGHBORHOOD_SILOS[(siloNumber - 1) % NEIGHBORHOOD_SILOS.length] +
  (siloNumber > NEIGHBORHOOD_SILOS.length ? ` (Phase ${Math.ceil(siloNumber / NEIGHBORHOOD_SILOS.length)})` : '');

type GameTab = 'play' | 'daily' | 'leaderboard';

export const BuildTheBlockGame: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GameTab>('play');
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);

  // Core Gameplay Loop State (Starts with $100 Practice Funds + $0 Practice Property Balance)
  const [practiceFundsUsd, setPracticeFundsUsd] = useState<number>(100);
  const [practicePropertyUsd, setPracticePropertyUsd] = useState<number>(0);
  const [schoolAwardsUsd, setSchoolAwardsUsd] = useState<number>(0);
  const [discoveryPoints, setDiscoveryPoints] = useState<number>(0);
  const [buildingsClosed, setBuildingsClosed] = useState<number>(0);
  const [activeSiloNumber, setActiveSiloNumber] = useState<number>(1);
  const [awaitingNextSiloUnlock, setAwaitingNextSiloUnlock] = useState<boolean>(false);
  const [dbcBadgesUnlocked, setDbcBadgesUnlocked] = useState<number>(0);
  const [tradesCompleted, setTradesCompleted] = useState<number>(0);
  const [activeEventIndex, setActiveEventIndex] = useState<number | null>(null);
  const [pipitoBlockWarning, setPipitoBlockWarning] = useState<string | null>(null);

  // Step 3: Interactive 3-Step DILOS Audit Gate State (Columbo -> Pipito -> Human Witness)
  const [escrowGateOpen, setEscrowGateOpen] = useState<boolean>(false);
  const [dilosStep, setDilosStep] = useState<0 | 1 | 2 | 3>(0);

  const [eventMessage, setEventMessage] = useState<string>(
    'You start with $100 in Practice Funds, $0 in Practice Property Balance, and a virtual household inventory. List or buy items below using the 50/25/25 split to close Silo #1 and unlock continuous multi-silo neighborhood building!'
  );

  // Classroom & Neighborhood Leaderboard State (Strictly Anonymous Handles & School/City Totals)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(INITIAL_LEADERBOARD);
  const [playerHandle, setPlayerHandle] = useState<string>('FamilyBuilder_01');
  const [teamCodeInput, setTeamCodeInput] = useState<string>('');
  const [chapterNameInput, setChapterNameInput] = useState<string>('');
  const [roleTypeInput, setRoleTypeInput] = useState<'School District / Classroom' | 'City Chapter'>(
    'School District / Classroom'
  );
  const [teamSyncBanner, setTeamSyncBanner] = useState<string | null>(null);

  // Daily Discovery Challenge (Article 3.3) State
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizBonusClaimed, setQuizBonusClaimed] = useState<boolean>(false);

  const SILO_GOAL_USD = 1000;
  const currentSiloLabel = `Silo #${activeSiloNumber}: ${getSiloName(activeSiloNumber)}`;
  const totalPracticeDiscoveryPoints =
    discoveryPoints +
    Math.round(practicePropertyUsd) +
    Math.round(schoolAwardsUsd) +
    buildingsClosed * 500;
  const progressPct = Math.min(100, Math.round((practicePropertyUsd / SILO_GOAL_USD) * 100));

  // Step 1: List (Sell) or Buy household items with automatic 50/25/25 split
  const handleMarketplaceTrade = (item: TradeCard, mode: 'sell' | 'buy') => {
    setPipitoBlockWarning(null);
    const sellerFunds50 = Math.round(item.price * 0.5);
    const sellerProp25 = Math.round(item.price * 0.25);
    const buyerProp25 = Math.round(item.price * 0.25);

    if (mode === 'buy' && practiceFundsUsd < item.price) {
      setEventMessage(
        `You need $${item.price} in Practice Funds to buy "${item.name}" (you currently have $${practiceFundsUsd}). List/Sell an item from your household inventory first to build Practice Funds!`
      );
      return;
    }

    if (mode === 'sell') {
      setPracticeFundsUsd((prev) => prev + sellerFunds50);
      setPracticePropertyUsd((prev) => prev + sellerProp25);
      setDiscoveryPoints((prev) => prev + 60);
      setEventMessage(
        `LISTED & SOLD "${item.name}" ($${item.price}): +$${sellerFunds50} Immediate Practice Funds (50%) · +$${sellerProp25} Your Practice Property Balance (25%) · +$${buyerProp25} Neighbor Buyer Property Balance (25%)!`
      );
    } else {
      setPracticeFundsUsd((prev) => prev - item.price);
      setPracticePropertyUsd((prev) => prev + buyerProp25);
      setDiscoveryPoints((prev) => prev + 60);
      setEventMessage(
        `BOUGHT "${item.name}" ($${item.price}): +$${buyerProp25} Your Buyer Practice Property Balance (25%) · Seller received $${sellerFunds50} Immediate Funds (50%) + $${sellerProp25} Seller Property Balance (25%)!`
      );
    }

    setTradesCompleted((prev) => {
      const next = prev + 1;
      if (next % 2 === 0 && activeEventIndex === null) {
        setActiveEventIndex((next / 2 - 1) % DILOS_EVENTS.length);
      }
      return next;
    });
  };

  // Step 2: Resolve Mortgage Trap vs Debt-Free Event Card
  const handleResolveEvent = (choseDebtFree: boolean) => {
    if (activeEventIndex === null) return;
    const ev = DILOS_EVENTS[activeEventIndex];
    if (choseDebtFree) {
      setPipitoBlockWarning(null);
      setPracticePropertyUsd((prev) => prev + ev.goodBonus);
      setDiscoveryPoints((prev) => prev + 100);
      setEventMessage(ev.goodOutcome);
      setActiveEventIndex(null);
    } else {
      setPipitoBlockWarning(ev.trapOutcome);
      setDiscoveryPoints((prev) => Math.max(0, prev - ev.trapPenalty));
    }
  };

  // Step 3: Open Seller-Side Escrow & Run 3-Step DILOS Audit Gate
  const handleOpenEscrowGate = () => {
    if (practicePropertyUsd < SILO_GOAL_USD) return;
    setEscrowGateOpen(true);
    setDilosStep(0);
    setPipitoBlockWarning(null);
  };

  const handleAdvanceDilosStep = () => {
    if (dilosStep < 3) {
      setDilosStep((prev) => (prev + 1) as 0 | 1 | 2 | 3);
      return;
    }
    // Step 4: Close Debt-Free Building -> Unlock Virtual DBC Badge + 70/30 Monthly Rent Split + Multi-Silo Unlock
    const closedSiloNum = activeSiloNumber;
    const closedSiloName = getSiloName(closedSiloNum);
    setPracticePropertyUsd((prev) => Math.max(0, prev - SILO_GOAL_USD));
    setBuildingsClosed((prev) => prev + 1);
    setDbcBadgesUnlocked((prev) => prev + 1);
    const familyRent70 = 210;
    const ndaAwards30 = 90;
    setPracticeFundsUsd((prev) => prev + familyRent70);
    setSchoolAwardsUsd((prev) => prev + ndaAwards30);
    setDiscoveryPoints((prev) => prev + 250);
    setEscrowGateOpen(false);
    setDilosStep(0);
    setAwaitingNextSiloUnlock(true);
    setEventMessage(
      `DEBT-FREE SILO #${closedSiloNum} (${closedSiloName}) CLOSED! Unlocked Virtual Discovery Brick Coin (DBC) Badge #${closedSiloNum} + Month 1 70/30 rent (+$${familyRent70} Family / +$${ndaAwards30} National Discovery Awards). Click "Keep Building: Unlock Silo #${closedSiloNum + 1}" below to keep expanding your neighborhood!`
    );
  };

  const handleUnlockNextSilo = () => {
    const nextNum = buildingsClosed + 1;
    setActiveSiloNumber(nextNum);
    setAwaitingNextSiloUnlock(false);
    setEventMessage(
      `UNLOCKED SILO #${nextNum}: ${getSiloName(nextNum)}! Keep trading household items, collecting 70/30 monthly rental payouts across all ${buildingsClosed} closed silo(s), and climbing the community leaderboard!`
    );
  };

  const handleSimulateMonthlyRent = () => {
    if (buildingsClosed <= 0) return;
    const familyRent70 = buildingsClosed * 210;
    const ndaAwards30 = buildingsClosed * 90;
    setPracticeFundsUsd((prev) => prev + familyRent70);
    setSchoolAwardsUsd((prev) => prev + ndaAwards30);
    setDiscoveryPoints((prev) => prev + buildingsClosed * 75);
    setEventMessage(
      `Simulated Monthly Net Rental Income across ${buildingsClosed} debt-free apartment silo(s): +$${familyRent70} to Your Family (70%) and +$${ndaAwards30} to The National Discovery Awards (30%)!`
    );
  };

  const handleResetGame = () => {
    setPracticeFundsUsd(100);
    setPracticePropertyUsd(0);
    setSchoolAwardsUsd(0);
    setDiscoveryPoints(0);
    setBuildingsClosed(0);
    setActiveSiloNumber(1);
    setAwaitingNextSiloUnlock(false);
    setDbcBadgesUnlocked(0);
    setTradesCompleted(0);
    setActiveEventIndex(null);
    setPipitoBlockWarning(null);
    setEscrowGateOpen(false);
    setDilosStep(0);
    setEventMessage(
      'Simulation reset to $100 Practice Funds and $0 Practice Property Balance on Silo #1. Start listing or buying items to build debt-free neighborhoods!'
    );
  };

  const handlePostToLeaderboard = (e: React.FormEvent) => {
    e.preventDefault();
    const safeHandle = (playerHandle.trim() || 'AnonymousOwner')
      .replace(/[^A-Za-z0-9_-]/g, '')
      .slice(0, 22);
    const safeCode = (teamCodeInput.trim() || 'OPEN-COMMUNITY')
      .toUpperCase()
      .replace(/[^A-Z0-9-]/g, '')
      .slice(0, 18);
    const safeChapter = chapterNameInput.trim().slice(0, 48) || `${safeCode} Community Team`;

    setLeaderboard((prev) => {
      const filtered = prev.filter(
        (entry) => !(entry.handle === safeHandle && entry.teamCode === safeCode)
      );
      return [
        ...filtered,
        {
          handle: safeHandle,
          teamCode: safeCode,
          chapterName: safeChapter,
          roleType: roleTypeInput,
          practicePoints: totalPracticeDiscoveryPoints,
          buildingsClosed,
        },
      ].sort((a, b) => b.practicePoints - a.practicePoints);
    });
    setTeamSyncBanner(
      `Posted ${totalPracticeDiscoveryPoints} Practice Discovery Points under anonymous handle "${safeHandle}" for ${safeChapter} (${safeCode}). Zero student personal data collected.`
    );
  };

  const handleAnswerDaily = (qId: string, optionIdx: number) => {
    setQuizAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const correctQuizCount = DAILY_DISCOVERY_QUESTIONS.filter(
    (q) => quizAnswers[q.id] === q.correctIndex
  ).length;
  const allQuizAnswered =
    Object.keys(quizAnswers).length === DAILY_DISCOVERY_QUESTIONS.length;

  const handleClaimQuizBonus = () => {
    if (quizBonusClaimed || correctQuizCount === 0) return;
    const bonusUsd = correctQuizCount * 100;
    setPracticePropertyUsd((prev) => prev + bonusUsd);
    setDiscoveryPoints((prev) => prev + correctQuizCount * 75);
    setQuizBonusClaimed(true);
    setEventMessage(
      `Daily Discovery Challenge complete (${correctQuizCount}/3 correct)! Added +$${bonusUsd} Practice Property Balance toward your next debt-free building.`
    );
  };

  const gameContent = (
    <section
      id={isFullScreen ? undefined : 'build-the-block-game'}
      className={`bg-white border-2 border-[#dfa62a] overflow-hidden shadow-md ${
        isFullScreen ? 'rounded-2xl max-w-6xl w-full mx-auto my-2 shadow-2xl' : 'rounded-2xl'
      }`}
    >
      {/* MANDATORY SAFETY & CONSTITUTIONAL DISCLAIMER BANNER (EXACT SPEC WORDING) */}
      <div
        role="region"
        aria-label="Educational Simulation Disclaimer"
        className="bg-white border-b-2 border-[#dfa62a] px-4 sm:px-6 py-2.5 text-center text-xs font-bold text-[#9A6B0A] leading-snug"
      >
        Educational Simulation Only — All balances and points in Build the Block are 100% free
        Practice Points for learning how The Discovery Exchange works. Zero real money, zero entry
        fees, and zero real Discovery Brick Coins (DBC) are wagered or awarded.
      </div>

      {/* Header */}
      <div className="bg-[#081d38] text-white px-6 py-5 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#fcd34d]">
            <Gamepad2 className="w-4 h-4" />
            <span>Play Free: Build Debt-Free Neighborhoods &bull; Learn in 3 Minutes, Build for Hours</span>
          </div>
          <h2 className="font-serif text-xl sm:text-3xl font-bold">
            The Discovery Exchange Challenge
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 max-w-2xl">
            Build the Block: The Debt-Free Community Challenge — trade household items with the
            50/25/25 split, reject bank mortgage traps, clear the 3-step DILOS Audit Gate, unlock
            continuous debt-free apartment silos, and collect 70/30 Family &amp; National Discovery
            Awards practice rent.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'play', label: 'Play Challenge', icon: Building2 },
            { id: 'daily', label: 'Daily Discovery (Art. 3.3)', icon: GraduationCap },
            { id: 'leaderboard', label: 'Classroom & City Board', icon: Trophy },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as GameTab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                  active
                    ? 'bg-[#dfa62a] text-[#081d38]'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setIsFullScreen((prev) => !prev)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-300/60 text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            aria-label={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
          >
            {isFullScreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Exit Full Screen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Full Screen</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowHowToPlay(true)}
            className="px-3.5 py-2 rounded-xl bg-[#dfa62a] hover:bg-[#eab308] text-[#081d38] border border-amber-200 shadow-sm text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            aria-label="Watch 60-Sec How to Play"
          >
            <Play className="w-3.5 h-3.5 fill-[#081d38]" />
            <span>Watch 60-Sec How to Play</span>
          </button>
        </div>
      </div>

      {/* Live Practice Scoreboard Strip */}
      <div className="bg-[#fbfaf7] border-b border-slate-200 px-6 py-3.5 grid grid-cols-2 sm:grid-cols-6 gap-3 text-center">
        <div className="p-2.5 rounded-xl bg-white border border-emerald-200">
          <div className="text-[11px] font-extrabold uppercase tracking-wide text-[#1e293b]">
            Practice Funds
          </div>
          <div className="text-lg font-extrabold text-emerald-800 tabular-nums">
            ${practiceFundsUsd}
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-white border border-amber-300">
          <div className="text-[11px] font-extrabold uppercase tracking-wide text-[#1e293b]">
            Property Balance
          </div>
          <div className="text-lg font-extrabold text-[#9A6B0A] tabular-nums">
            ${practicePropertyUsd} / ${SILO_GOAL_USD}
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-white border border-sky-200">
          <div className="text-[11px] font-extrabold uppercase tracking-wide text-[#1e293b]">
            NDA Awards (30%)
          </div>
          <div className="text-lg font-extrabold text-sky-900 tabular-nums">${schoolAwardsUsd}</div>
        </div>
        <div className="p-2.5 rounded-xl bg-white border border-slate-200">
          <div className="text-[11px] font-extrabold uppercase tracking-wide text-[#1e293b]">
            Debt-Free Silos
          </div>
          <div className="text-lg font-extrabold text-[#081d38] tabular-nums">
            {buildingsClosed}
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-white border border-amber-200">
          <div className="text-[11px] font-extrabold uppercase tracking-wide text-[#1e293b]">
            Virtual DBC Badges
          </div>
          <div className="text-lg font-extrabold text-[#b47d12] tabular-nums inline-flex items-center gap-1 justify-center">
            <Coins className="w-4 h-4" />
            <span>{dbcBadgesUnlocked}</span>
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-[#081d38] text-white">
          <div className="text-[11px] font-extrabold uppercase tracking-wide text-[#fcd34d]">
            Practice Points
          </div>
          <div className="text-lg font-extrabold text-white tabular-nums">
            {totalPracticeDiscoveryPoints}
          </div>
        </div>
      </div>

      {/* TAB 1: CORE GAMEPLAY LOOP */}
      {activeTab === 'play' && (
        <div className="p-6 space-y-5">
          {/* Status Banner */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-[#dfa62a] flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-[#081d38]">
            <div className="flex items-start gap-2 flex-1 min-w-[240px]">
              <Sparkles className="w-4 h-4 text-[#b47d12] shrink-0 mt-0.5" />
              <span className="font-semibold leading-snug">{eventMessage}</span>
            </div>
            <button
              type="button"
              onClick={handleResetGame}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700 inline-flex items-center gap-1 cursor-pointer shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Practice</span>
            </button>
          </div>

          {/* Pipito Constitutional Block Warning */}
          {pipitoBlockWarning && (
            <div className="p-4 rounded-xl bg-red-50 border-2 border-red-400 text-xs sm:text-sm text-red-950 font-bold flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
              <span>{pipitoBlockWarning} Choose the 100% Debt-Free Constitutional option to continue!</span>
            </div>
          )}

          {/* Step 2: Mortgage Trap vs. Debt-Free Pop-up Decision Card */}
          {activeEventIndex !== null && (
            <div className="p-5 rounded-2xl bg-[#081d38] text-white border-2 border-[#dfa62a] space-y-3 shadow-md">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#fcd34d]">
                <AlertTriangle className="w-4 h-4" />
                <span>Step 2 Challenge Card: {DILOS_EVENTS[activeEventIndex].title}</span>
              </div>
              <p className="text-sm text-slate-100 leading-relaxed">
                {DILOS_EVENTS[activeEventIndex].prompt}
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleResolveEvent(true)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{DILOS_EVENTS[activeEventIndex].goodLabel}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleResolveEvent(false)}
                  className="px-4 py-2.5 rounded-xl bg-red-600/85 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
                >
                  {DILOS_EVENTS[activeEventIndex].trapLabel}
                </button>
              </div>
            </div>
          )}

          {/* Continuous Multi-Silo Victory & Unlock Card */}
          {awaitingNextSiloUnlock && buildingsClosed > 0 && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#081d38] via-[#0e2d56] to-[#081d38] text-white border-2 border-[#dfa62a] shadow-lg space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#fcd34d]">
                  <Trophy className="w-4 h-4" />
                  <span>
                    Debt-Free Silo #{buildingsClosed} Closed &bull; Virtual DBC Badge Unlocked!
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/60 text-emerald-200 text-[11px] font-bold">
                  Continuous Multi-Silo Play Active
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-100 leading-relaxed">
                Congratulations! You closed <strong>Silo #{buildingsClosed} ({getSiloName(buildingsClosed)})</strong>{' '}
                with 0% debt and started earning <strong>70% Family / 30% National Discovery Awards</strong>{' '}
                virtual rental payouts. Ready to expand the block and climb the community leaderboard?
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleUnlockNextSilo}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 shadow-md border border-emerald-300/60 cursor-pointer"
                >
                  <Building2 className="w-4 h-4 text-[#fcd34d]" />
                  <span>Keep Building: Unlock Silo #{buildingsClosed + 1}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSimulateMonthlyRent}
                  className="px-4 py-2.5 rounded-xl bg-[#dfa62a] hover:bg-[#eab308] text-[#081d38] text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>
                    Collect 70/30 Rent (+${buildingsClosed * 210} Family / +${buildingsClosed * 90} NDA)
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('leaderboard')}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/25 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Trophy className="w-4 h-4 text-[#fcd34d]" />
                  <span>Climb Community Leaderboard</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 3 & Step 4: Seller-Side Escrow Progress + Interactive 3-Step DILOS Audit Gate */}
          <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-[#081d38]">
              <span>
                Step 3 Target — <strong>{currentSiloLabel}</strong>: Reach ${SILO_GOAL_USD} Practice
                Property Balance (${practicePropertyUsd} / ${SILO_GOAL_USD})
              </span>
              <span>{progressPct}% Ready for Seller-Side Escrow</span>
            </div>
            <div className="w-full h-3.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#081d38] via-[#b47d12] to-[#dfa62a] transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {!escrowGateOpen ? (
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {awaitingNextSiloUnlock ? (
                  <button
                    type="button"
                    onClick={handleUnlockNextSilo}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Keep Building: Unlock Silo #{buildingsClosed + 1}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={practicePropertyUsd < SILO_GOAL_USD}
                    onClick={handleOpenEscrowGate}
                    className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white text-xs font-extrabold inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Open Seller-Side Escrow for Silo #{activeSiloNumber} ($1,000 Goal)</span>
                  </button>
                )}

                {buildingsClosed > 0 && (
                  <button
                    type="button"
                    onClick={handleSimulateMonthlyRent}
                    className="px-4 py-2.5 rounded-xl bg-[#081d38] hover:bg-[#0f294d] text-[#fcd34d] text-xs font-extrabold inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Award className="w-4 h-4" />
                    <span>
                      Collect Monthly 70/30 Net Rent ({buildingsClosed} Debt-Free Silo
                      {buildingsClosed > 1 ? 's' : ''})
                    </span>
                  </button>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#081d38] text-white border-2 border-[#dfa62a] space-y-3">
                <div className="text-xs font-extrabold uppercase tracking-wider text-[#fcd34d]">
                  Step 3 — DILOS 3-Step Escrow Audit Gate (Before Closing Debt-Free Building)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  {[
                    {
                      stepNum: 1,
                      label: '1. Columbo Math Check',
                      desc: 'Verifies integer-cent 50/25/25 credits & appraisal.',
                    },
                    {
                      stepNum: 2,
                      label: '2. Pipito Zero-Debt Gate',
                      desc: 'Confirms 0% mortgage, 0% liens, isolated Silo title.',
                    },
                    {
                      stepNum: 3,
                      label: '3. Human Witness Sign-Off',
                      desc: 'Logs closing onto immutable SHA-256 Open Ledger.',
                    },
                  ].map((s) => {
                    const passed = dilosStep >= s.stepNum;
                    return (
                      <div
                        key={s.stepNum}
                        className={`p-3 rounded-lg border ${
                          passed
                            ? 'bg-emerald-900/50 border-emerald-400 text-emerald-100'
                            : 'bg-white/5 border-white/15 text-slate-300'
                        }`}
                      >
                        <div className="font-bold flex items-center gap-1.5">
                          <CheckCircle2
                            className={`w-4 h-4 ${passed ? 'text-emerald-300' : 'text-slate-500'}`}
                          />
                          <span>{s.label}</span>
                        </div>
                        <p className="text-[11px] mt-1 opacity-90">{s.desc}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleAdvanceDilosStep}
                    className="px-4 py-2.5 rounded-xl bg-[#dfa62a] hover:bg-[#eab308] text-[#081d38] text-xs font-extrabold cursor-pointer"
                  >
                    {dilosStep === 0
                      ? 'Run Step 1: Columbo Math Check ->'
                      : dilosStep === 1
                      ? 'Run Step 2: Pipito Zero-Debt Gate ->'
                      : dilosStep === 2
                      ? 'Run Step 3: Independent Human Witness Sign-Off ->'
                      : 'Close 100% Debt-Free Building & Unlock Virtual DBC Badge ->'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEscrowGateOpen(false);
                      setDilosStep(0);
                    }}
                    className="text-xs text-slate-300 hover:underline cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Step 1: Virtual Household Inventory (List / Sell OR Buy with 50/25/25 Split) */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-600">
              <span>
                Step 1 (Marketplace Trade): List/Sell or Buy Household Items (50% Immediate Funds /
                25% Seller Property / 25% Buyer Property)
              </span>
              <span>Trades Completed: {tradesCompleted}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {HOUSEHOLD_INVENTORY.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-white border border-slate-200 hover:border-[#dfa62a] transition-all flex flex-col justify-between gap-3 shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {item.category}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#081d38] text-[#fcd34d] text-[11px] font-bold tabular-nums">
                        ${item.price}
                      </span>
                    </div>
                    <div className="font-bold text-sm text-[#081d38]">{item.name}</div>
                    <div className="text-[11px] text-slate-600">
                      50% Funds: <strong>${Math.round(item.price * 0.5)}</strong> &bull; 25% Seller:{' '}
                      <strong>${Math.round(item.price * 0.25)}</strong> &bull; 25% Buyer:{' '}
                      <strong>${Math.round(item.price * 0.25)}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleMarketplaceTrade(item, 'sell')}
                      className="py-2 px-2.5 rounded-lg bg-[#081d38] hover:bg-[#0f294d] text-[#fcd34d] text-[11px] font-extrabold cursor-pointer"
                    >
                      List &amp; Sell
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMarketplaceTrade(item, 'buy')}
                      className="py-2 px-2.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-[#081d38] text-[11px] font-extrabold cursor-pointer"
                    >
                      Buy (+25% Prop)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DAILY DISCOVERY CHALLENGE (ARTICLE 3.3) */}
      {activeTab === 'daily' && (
        <div className="p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#081d38]">
                Daily 3-Question Discovery Challenge (Article 3.3)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Practice Applied, Analytical, and Hybrid Discovery concepts for public school
                students and families—earn +$100 Practice Property Balance per right answer!
              </p>
            </div>
            <span className="px-3 py-1 rounded-lg bg-[#081d38] text-[#fcd34d] text-xs font-bold">
              Score: {correctQuizCount} / 3
            </span>
          </div>

          <div className="space-y-4">
            {DAILY_DISCOVERY_QUESTIONS.map((q) => {
              const picked = quizAnswers[q.id];
              return (
                <div
                  key={q.id}
                  className="p-4 rounded-xl bg-[#fbfaf7] border border-slate-200 space-y-2.5"
                >
                  <div className="text-xs font-extrabold uppercase tracking-wider text-[#b47d12]">
                    {q.category}
                  </div>
                  <div className="text-sm font-bold text-[#081d38]">{q.question}</div>
                  <div className="space-y-1.5">
                    {q.options.map((opt, idx) => {
                      const isPicked = picked === idx;
                      const isRight = idx === q.correctIndex;
                      let cls = 'bg-white border-slate-300 text-slate-800 hover:border-[#081d38]';
                      if (picked !== undefined) {
                        if (isRight)
                          cls = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold';
                        else if (isPicked) cls = 'bg-red-50 border-red-400 text-red-900';
                      }
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleAnswerDaily(q.id, idx)}
                          className={`w-full text-left px-3.5 py-2.5 rounded-lg border text-xs transition-colors cursor-pointer ${cls}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {picked !== undefined && (
                    <div className="text-xs text-slate-700 bg-white border border-slate-200 rounded-lg p-2.5">
                      <strong>Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <button
              type="button"
              disabled={!allQuizAnswered || quizBonusClaimed || correctQuizCount === 0}
              onClick={handleClaimQuizBonus}
              className="px-5 py-2.5 rounded-xl bg-[#081d38] hover:bg-[#0f294d] disabled:opacity-45 text-[#fcd34d] text-xs font-extrabold inline-flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {quizBonusClaimed
                  ? 'Daily Practice Bonus Claimed!'
                  : `Claim +$${correctQuizCount * 100} Practice Property Balance`}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('play')}
              className="text-xs font-bold text-[#081d38] hover:underline cursor-pointer"
            >
              Return to Challenge Board &rarr;
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: CLASSROOM & NEIGHBORHOOD LEADERBOARDS */}
      {activeTab === 'leaderboard' && (
        <div className="p-6 space-y-5">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#081d38] inline-flex items-center gap-2">
              <Users className="w-5 h-5 text-[#b47d12]" />
              <span>Classroom &amp; Neighborhood Friendly Leaderboards</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Enter an optional anonymous player handle plus a School District / Classroom Code or
              City Chapter Name to post Practice Discovery Points. Displays ONLY anonymous handles
              and school/city totals—never student personal data.
            </p>
          </div>

          <form
            onSubmit={handlePostToLeaderboard}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-5 gap-3 items-end"
          >
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Anonymous Handle</label>
              <input
                type="text"
                required
                placeholder="e.g., OakBuilder_24"
                value={playerHandle}
                onChange={(e) => setPlayerHandle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Classroom / Chapter Code</label>
              <input
                type="text"
                placeholder="e.g., CLARK-SCI-7"
                value={teamCodeInput}
                onChange={(e) => setTeamCodeInput(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg uppercase font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">School / City Chapter</label>
              <input
                type="text"
                placeholder="e.g., Toledo Public Science"
                value={chapterNameInput}
                onChange={(e) => setChapterNameInput(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700">Board Type</label>
              <select
                value={roleTypeInput}
                onChange={(e) =>
                  setRoleTypeInput(e.target.value as 'School District / Classroom' | 'City Chapter')
                }
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
              >
                <option value="School District / Classroom">School District / Classroom</option>
                <option value="City Chapter">City Chapter</option>
              </select>
            </div>
            <button
              type="submit"
              className="py-2 px-4 rounded-lg bg-[#081d38] hover:bg-[#0f294d] text-[#fcd34d] text-xs font-extrabold cursor-pointer"
            >
              Post Practice Points
            </button>
          </form>

          {teamSyncBanner && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900">
              {teamSyncBanner}
            </div>
          )}

          <div className="space-y-2">
            {leaderboard.map((entry, idx) => (
              <div
                key={`${entry.handle}-${entry.teamCode}-${idx}`}
                className="p-3.5 rounded-xl bg-[#fbfaf7] border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-[#081d38] text-[#fcd34d] font-bold flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-sm text-[#081d38]">
                      {entry.handle}{' '}
                      <span className="font-normal text-slate-500">&bull; {entry.chapterName}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-mono">
                      Code: {entry.teamCode} &bull; {entry.roleType}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 font-bold">
                  <span className="text-slate-600">{entry.buildingsClosed} Silo(s)</span>
                  <span className="px-3 py-1 rounded-lg bg-amber-100 text-[#9A6B0A] tabular-nums">
                    {entry.practicePoints} Practice Pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );

  if (isFullScreen) {
    return (
      <>
        <div
          role="dialog"
          aria-modal="true"
          aria-label="The Discovery Exchange Challenge Full Screen"
          className="fixed inset-0 z-[110] bg-slate-950/85 backdrop-blur-xs overflow-y-auto p-3 sm:p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsFullScreen(false);
            }
          }}
        >
          {gameContent}
        </div>
        {showHowToPlay && (
          <HowToPlayWalkthroughModal onClose={() => setShowHowToPlay(false)} />
        )}
      </>
    );
  }

  return (
    <>
      {gameContent}
      {showHowToPlay && (
        <HowToPlayWalkthroughModal onClose={() => setShowHowToPlay(false)} />
      )}
    </>
  );
};
