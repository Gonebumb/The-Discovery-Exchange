import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FolderLock,
  Pause,
  Play,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import { PrivateVaultPortal } from '../components/PrivateVaultPortal';

interface RotatingBoardScene {
  src: string;
  alt: string;
  caption: string;
}

const ROTATING_BOARD_PAIRS: Array<{
  termLabel: string;
  left: RotatingBoardScene;
  right: RotatingBoardScene;
}> = [
  {
    termLabel: 'Rotating Term A · Kitchen-Table & Workshop Owners',
    left: {
      src: '/src/assets/images/mom_pop_board_rot_1.jpg',
      alt: 'Everyday working-class parents, mechanic, nurse, and grandfather around a kitchen table — zero suits, zero ties',
      caption: 'Kitchen-Table Board Session · Parents, Mechanic, Nurse & Retired Neighbor',
    },
    right: {
      src: '/src/assets/images/mom_pop_board_rot_2.jpg',
      alt: 'Union driver in baseball cap, grandmother, teacher, and small shop owner raising hands to vote cleanly together',
      caption: 'Neighborhood Hall Vote · One Owner, One Vote (No Suits, No Bosses)',
    },
  },
  {
    termLabel: 'Rotating Term B · Staggered Seat Handoff (No Entrenched Board)',
    left: {
      src: '/src/assets/images/mom_pop_board_rot_3.jpg',
      alt: 'Regular Mom & Pop neighbors in hoodies and flannels shaking hands and passing board notes during scheduled seat rotation',
      caption: 'Scheduled Seat Rotation · Everyday Neighbors Handing Off Board Binder',
    },
    right: {
      src: '/src/assets/images/mom_pop_board_rot_4.jpg',
      alt: 'Main street hardware worker, cafeteria worker, stay-at-home dad, and grandparents reviewing community notes together',
      caption: 'Main Street Owners · Hardware, Cafeteria & Grandparent Seat Rotation',
    },
  },
];

const SAMPLE_OWNER_POOL = [
  'Owner #0104 — Ohio (Public School Parent)',
  'Owner #0219 — Texas (Retired Shop Teacher)',
  'Owner #0342 — Pennsylvania (Working Mom)',
  'Owner #0488 — California (Auto Mechanic)',
  'Owner #0512 — Georgia (Elementary Educator)',
  'Owner #0675 — Michigan (Grandparent & Caregiver)',
  'Owner #0731 — North Carolina (Nurse & Parent)',
  'Owner #0890 — Colorado (High School Science Teacher)',
  'Owner #0915 — Florida (Small Business Owner)',
  'Owner #1044 — Illinois (Bus Driver & Parent)',
];

export const MomPopBoardPage: React.FC = () => {
  const [drawnSeats, setDrawnSeats] = useState<string[]>(SAMPLE_OWNER_POOL.slice(0, 6));
  const [pairIndex, setPairIndex] = useState<number>(0);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [showVaultGate, setShowVaultGate] = useState<boolean>(false);

  useEffect(() => {
    if (!isAutoRotating) return;
    const timer = window.setInterval(() => {
      setPairIndex((prev) => (prev + 1) % ROTATING_BOARD_PAIRS.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [isAutoRotating]);

  const activePair = ROTATING_BOARD_PAIRS[pairIndex];

  const simulateRandomDraw = () => {
    const shuffled = [...SAMPLE_OWNER_POOL].sort(() => Math.random() - 0.5);
    setDrawnSeats(shuffled.slice(0, 6));
  };

  return (
    <div className="space-y-6">
      {/* Rotating Working-Class Mom & Pop Board Gallery */}
      <div className="rounded-2xl overflow-hidden border-2 border-[#dfa62a] bg-white px-5 py-6 sm:px-8 sm:py-7 shadow-sm space-y-4">
        <div className="text-center space-y-1">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#081d38] tracking-tight">
            Discover The Discovery Exchange Through Its Rotating Owners
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Regular working-class Moms &amp; Pops—not suits and ties—rotating staggered terms on the Mom &amp; Pop Board (DEXPA / TDEX).
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="px-3 py-1 rounded-lg bg-[#081d38] text-[#dfa62a] font-bold">
            {activePair.termLabel}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                setPairIndex((prev) => (prev - 1 + ROTATING_BOARD_PAIRS.length) % ROTATING_BOARD_PAIRS.length)
              }
              aria-label="Previous rotating board scenes"
              className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-[#081d38] cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsAutoRotating((prev) => !prev)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-[#081d38] font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              {isAutoRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isAutoRotating ? 'Rotating Live' : 'Paused'}</span>
            </button>
            <button
              type="button"
              onClick={() => setPairIndex((prev) => (prev + 1) % ROTATING_BOARD_PAIRS.length)}
              aria-label="Next rotating board scenes"
              className="p-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-[#081d38] cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[activePair.left, activePair.right].map((scene) => (
            <div key={scene.src} className="rounded-xl overflow-hidden border border-slate-200 bg-[#fbfaf7] shadow-xs">
              <div className="aspect-[16/9] w-full overflow-hidden">
                <img
                  src={scene.src}
                  alt={scene.alt}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover block"
                />
              </div>
              <div className="px-3.5 py-2 text-xs font-semibold text-[#081d38] border-t border-slate-200">
                {scene.caption}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center font-serif text-base sm:text-lg font-bold text-[#081d38]">
          People first. Programs underneath. The Constitution behind all of it.
        </p>
      </div>

      <div className="bg-[#081d38] text-white rounded-2xl border-2 border-[#dfa62a] p-6 sm:p-8 space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#dfa62a]">
          Article 1 &amp; Article 5 &bull; Kitchen-Table Governance
        </span>
        <h1 className="font-serif text-2xl sm:text-4xl font-bold">
          Mom &amp; Pop Board — Owners &amp; Pushers Governance
        </h1>
        <p className="text-sm text-slate-200 max-w-3xl leading-relaxed">
          &ldquo;No Bosses&rdquo; applies specifically to voting governance: there is no corporate controlling shareholder or executive veto ruler. Under <strong>Article 4.1</strong> and <strong>Article 5.1</strong>, each Verified Human Owner holds <strong>1 equal vote</strong>, while day-to-day administrative and property duties stay legally accountable.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
          <h2 className="font-serif text-lg font-bold text-[#081d38]">
            1. Verified Human Owner (Article 1.1 &amp; 4.1)
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            Verified Human status ensures every participant is one real person—so one person equals one vote, never scaled by money or tokens.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
          <h2 className="font-serif text-lg font-bold text-[#081d38]">
            2. Random Owner Draw &amp; Fairness (Article 5.1 &amp; 5.4)
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            Board seats are drawn at random among Owners in good standing with conflict-of-interest recusal and 2/3 cause-removal protections—preventing permanent entrenched bosses.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-2">
          <h2 className="font-serif text-lg font-bold text-[#081d38]">
            3. 75% Bedrock Protection (Article 19.2)
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            Core protections—One Owner One Vote, Debt-Free Property, 50/25/25, 70/30, and the Public Schools Discovery Awards—cannot be changed without a <strong>75% supermajority</strong> of both Owners and the Board.
          </p>
        </div>
      </div>

      {/* Interactive Random Owner Board Draw Simulator */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#081d38]">
              Neutral Lottery Owner Board Selection Simulator (Article 5.1)
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Preview simulation of how verified 18+ Owners would be seated via neutral auditable lottery (illustrative sample profiles only).
            </p>
          </div>
          <button
            type="button"
            onClick={simulateRandomDraw}
            className="px-4 py-2 bg-[#081d38] hover:bg-[#0f2b52] text-[#dfa62a] text-xs font-bold rounded-lg inline-flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Simulate Random Owner Draw</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {drawnSeats.map((seat, i) => (
            <div
              key={seat}
              className="p-3.5 rounded-lg bg-[#fbfaf7] border border-slate-200 flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-900"
            >
              <span className="w-6 h-6 rounded-full bg-[#081d38] text-[#dfa62a] text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <span>{seat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* OWNER BOARD POWER HANDOVER & 14-DAY STAGGERED TRANSITION PROTOCOL (ARTICLE 5.1 & ARTICLE 7) */}
      <section className="bg-white border-2 border-[#dfa62a] rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#b47d12]">
              <Clock className="w-4 h-4" />
              <span>Master Charter Article 5.1 &amp; Article 7 &bull; 30-Person Owner Board</span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#081d38]">
              Owner Board Power Handover &amp; 14-Day Staggered Transition Protocol
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 max-w-3xl leading-relaxed">
              <strong>Zero Lame-Duck Abuse &amp; Zero Knowledge Loss:</strong> Only{' '}
              <strong>10 of the 30 Board seats</strong> rotate on a staggered schedule while{' '}
              <strong>20 continuing Board members</strong> remain in place at every transition—so
              TDEX never experiences a power vacuum. Outgoing members follow a strict 14-day
              handover schedule on the open ledger.
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-lg bg-[#081d38] text-[#fcd34d] text-xs font-mono font-bold shrink-0">
            10 Rotating / 20 Continuing &bull; 14-Day Protocol
          </span>
        </div>

        {/* 5-Stage 14-Day Staggered Transition Timeline */}
        <div className="space-y-3">
          {[
            {
              stage: 'Day 14 Before Rotation',
              title: 'Freeze on Non-Emergency New Commitments',
              detail:
                'During the final 14 days of their term, outgoing Board members are forbidden from initiating new discretionary spending, launching new rule changes, or rushing last-minute vendor contracts. Only routine operational maintenance and already-scheduled escrow closings may proceed.',
            },
            {
              stage: 'Day 10 Before Rotation',
              title: 'Neutral Random Draw & Seat Assignment',
              detail:
                'The neutral cryptographic random draw selects the 10 incoming verified Owners (plus 5 alternates). Columbo, Pipito, and an Independent Human Witness sign off on the incoming roster directly on the open ledger.',
            },
            {
              stage: 'Days 9 to 2 Before Rotation',
              title: 'Mandatory Briefing & Open-Ledger Transition Dossier',
              detail:
                'Outgoing Board members deliver a complete Transition Dossier to the 10 incoming members (reviewed alongside the 20 continuing members), covering: (1) status of every active Property Silo acquisition, inspection, and seller-side escrow window; (2) maintenance reserve balances and property management reports for all closed buildings; and (3) National Discovery Awards cycle status and pending TDX- tickets. Because TDEX holds zero money and all documents live on the open ledger, outgoing members hold zero physical bank keys, passwords, or private accounts that could ever be withheld.',
            },
            {
              stage: 'Day 1 Before Rotation',
              title: 'Incoming Board Oath of Honor & Constitutional Compliance',
              detail:
                'Each incoming Board member digitally signs the Owner Board Oath of Honor & Constitutional Compliance directly on the open ledger.',
            },
            {
              stage: 'Rotation Day (12:00 PM UTC)',
              title: 'Automatic Credential Switch & Independent Witness Sign-Off',
              detail:
                'At the exact scheduled transition timestamp: outgoing members’ Board voting credentials automatically expire (reverting to standard verified Owner status); incoming members’ Board voting credentials automatically activate; Pipito verifies headcount remains exactly 30 verified human Owners; and an Independent Human Witness signs off on the completed transition entry on the open ledger.',
            },
          ].map((item, idx) => (
            <div
              key={item.stage}
              className="p-4 rounded-xl bg-[#fbfaf7] border border-slate-200 flex items-start gap-3.5"
            >
              <span className="w-7 h-7 rounded-lg bg-[#081d38] text-[#fcd34d] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-[#9A6B0A] text-[11px] font-extrabold uppercase tracking-wide">
                    {item.stage}
                  </span>
                  <h3 className="font-bold text-sm text-[#081d38]">{item.title}</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Anti-Sabotage & Non-Cooperation Rule */}
        <div className="p-4 sm:p-5 rounded-xl bg-red-50 border-2 border-red-200 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-red-900">
            <ShieldAlert className="w-4 h-4 text-red-700" />
            <span>Anti-Sabotage &amp; Non-Cooperation Rule (Zero Withholding Allowed)</span>
          </div>
          <p className="text-xs sm:text-sm text-red-950 leading-relaxed">
            If an outgoing Board member refuses to turn over transition notes or attempts to
            obstruct incoming members during the 14-day handoff, the{' '}
            <strong>20 continuing Board members and Columbo</strong> pull the records directly from
            the immutable open ledger, and the non-cooperating member is flagged for a{' '}
            <strong>12-person Owner Review Jury hearing</strong> (which can permanently bar them
            from future governance).
          </p>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 pt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Zero Bank Keys Held &bull; Automatic Timestamp Switch &bull; Immutable Open Ledger</span>
          </div>
        </div>
      </section>

      {/* Closed Internal Vault & Audit Log (Custodian, Court & Board Only) */}
      <div className="bg-[#081d38] text-white border-2 border-[#dfa62a] rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#dfa62a]">
              <FolderLock className="w-4 h-4" />
              <span>DILOS v2 Closed Governance Vault</span>
            </div>
            <h3 className="font-serif text-xl font-bold text-white">
              Internal Vault &amp; Audit Log (Custodian, Arbitration Court &amp; Board Only)
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 max-w-3xl">
              Strictly closed to the public. Board Directors must request and obtain a signed
              Internal Arbitration Court Clearance Order before viewing Vault filings.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowVaultGate((prev) => !prev)}
            className="px-5 py-2.5 rounded-xl bg-[#dfa62a] hover:bg-[#eab308] text-[#081d38] text-xs font-bold inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <FolderLock className="w-4 h-4" />
            <span>{showVaultGate ? 'Close Vault Gate' : 'Internal Vault & Audit Log'}</span>
          </button>
        </div>

        {showVaultGate && <PrivateVaultPortal embedded />}
      </div>
    </div>
  );
};
