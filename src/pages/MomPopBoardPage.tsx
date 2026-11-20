import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, FolderLock, Pause, Play, RefreshCw } from 'lucide-react';
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
      caption: 'Neighborhood Hall Vote · One Verified Owner = One Vote (No Suits, No Bosses)',
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
            Regular working-class Moms &amp; Pops—not suits and ties—rotating staggered terms on the Owner Board (DEXPA / TDEX).
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
