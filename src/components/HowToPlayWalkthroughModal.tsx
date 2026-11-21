import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Award,
  Building2,
  CheckCircle2,
  Coins,
  Gamepad2,
  Loader2,
  MousePointerClick,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';

interface HowToPlayWalkthroughModalProps {
  onClose: () => void;
}

interface WalkthroughScene {
  id: number;
  startSec: number;
  endSec: number;
  badge: string;
  title: string;
  narration: string;
}

type StudioVoiceId = 'Zephyr' | 'Puck' | 'Kore';

const STUDIO_VOICES: { id: StudioVoiceId; label: string }[] = [
  { id: 'Zephyr', label: 'Warm Studio (Female)' },
  { id: 'Puck', label: 'Friendly Host (Male)' },
  { id: 'Kore', label: 'Clear Narrator (Female)' },
];

const TOTAL_DURATION_SEC = 60;

const SCENES: WalkthroughScene[] = [
  {
    id: 1,
    startSec: 0,
    endSec: 10,
    badge: '0:00–0:10 • Scene 1',
    title: 'The Goal — Debt-Free Apartments From Everyday Items',
    narration:
      'Want to see how everyday household items turn into 100% debt-free apartment buildings—with zero banks and zero money ever held by TDEX? Here is how to play in 60 seconds.',
  },
  {
    id: 2,
    startSec: 10,
    endSec: 22,
    badge: '0:10–0:22 • Scene 2',
    title: 'Step 1: List & Sell (50 / 25 / 25 Split)',
    narration:
      'Step 1: Click List & Sell on any household item. Every sale splits 50 / 25 / 25—putting 50% immediate funds in your wallet and 25% straight into your Property Balance.',
  },
  {
    id: 3,
    startSec: 22,
    endSec: 32,
    badge: '0:22–0:32 • Scene 3',
    title: 'Step 2: Buy (+25% Prop)',
    narration:
      'Step 2: Once you have enough Practice Funds, click Buy (+25% Prop) to earn another 25% toward your building goal.',
  },
  {
    id: 4,
    startSec: 32,
    endSec: 44,
    badge: '0:32–0:44 • Scene 4',
    title: 'Step 3: Reject Debt & Pass DILOS Audit Gate',
    narration:
      'Step 3: Reject bank mortgage traps, clear the DILOS math and zero-debt audit checks, and hit $1,000 to close on Silo #1—100% debt-free.',
  },
  {
    id: 5,
    startSec: 44,
    endSec: 60,
    badge: '0:44–0:60 • Scene 5',
    title: 'Step 4: Earn 70/30 Rent & Unlock Virtual DBC',
    narration:
      'Once your building closes, you unlock a Discovery Brick Coin badge and collect 70% of net rental income while 30% automatically funds public school teachers and working-class students.',
  },
];

const formatTime = (sec: number) => {
  const clamped = Math.max(0, Math.min(TOTAL_DURATION_SEC, Math.floor(sec)));
  return `0:${clamped < 10 ? `0${clamped}` : clamped}`;
};

const getSceneForTime = (sec: number): WalkthroughScene => {
  return SCENES.find((s) => sec >= s.startSec && sec < s.endSec) ?? SCENES[SCENES.length - 1];
};

export const HowToPlayWalkthroughModal: React.FC<HowToPlayWalkthroughModalProps> = ({
  onClose,
}) => {
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [selectedVoice, setSelectedVoice] = useState<StudioVoiceId>('Zephyr');
  const [audioLoading, setAudioLoading] = useState<boolean>(false);
  const [audioNotice, setAudioNotice] = useState<string | null>(null);

  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlCacheRef = useRef<Map<string, string>>(new Map());
  const lastPlayedKeyRef = useRef<string | null>(null);
  const requestCounterRef = useRef<number>(0);

  const activeScene = getSceneForTime(elapsedSec);
  const sceneElapsed = Math.max(0, elapsedSec - activeScene.startSec);
  const sceneDuration = activeScene.endSec - activeScene.startSec;
  const sceneProgress = Math.min(1, sceneElapsed / sceneDuration);
  const totalProgressPct = Math.min(100, (elapsedSec / TOTAL_DURATION_SEC) * 100);

  const stopAudio = useCallback(() => {
    if (audioElRef.current) {
      audioElRef.current.pause();
      audioElRef.current.currentTime = 0;
    }
  }, []);

  const fetchSceneAudioUrl = useCallback(async (sceneId: number, voice: StudioVoiceId) => {
    const key = `${voice}:${sceneId}`;
    const existing = blobUrlCacheRef.current.get(key);
    if (existing) return existing;

    const resp = await fetch(`/api/walkthrough-voice/${sceneId}?voice=${encodeURIComponent(voice)}`);
    if (!resp.ok) {
      let errMsg = 'Studio voice audio temporarily unavailable.';
      try {
        const errJson = (await resp.json()) as { error?: string };
        if (errJson.error) errMsg = errJson.error;
      } catch {
        // ignore non-json error body
      }
      throw new Error(errMsg);
    }

    const blob = await resp.blob();
    const objectUrl = URL.createObjectURL(blob);
    blobUrlCacheRef.current.set(key, objectUrl);
    return objectUrl;
  }, []);

  // Clean up audio & object URLs on unmount
  useEffect(() => {
    const cache = blobUrlCacheRef.current;
    return () => {
      if (audioElRef.current) {
        audioElRef.current.pause();
        audioElRef.current = null;
      }
      cache.forEach((url) => URL.revokeObjectURL(url));
      cache.clear();
    };
  }, []);

  // Playback timer (100ms precision)
  useEffect(() => {
    if (!isPlaying) return;
    const id = window.setInterval(() => {
      setElapsedSec((prev) => {
        if (prev >= TOTAL_DURATION_SEC) {
          setIsPlaying(false);
          return TOTAL_DURATION_SEC;
        }
        return Math.min(TOTAL_DURATION_SEC, +(prev + 0.1).toFixed(2));
      });
    }, 100);
    return () => window.clearInterval(id);
  }, [isPlaying]);

  // Play studio-quality human WAV narration synced to each scene + preload the next scene
  useEffect(() => {
    if (!voiceEnabled || !isPlaying) {
      stopAudio();
      setAudioLoading(false);
      if (!voiceEnabled) {
        lastPlayedKeyRef.current = null;
      }
      return;
    }

    const sceneKey = `${selectedVoice}:${activeScene.id}`;
    if (lastPlayedKeyRef.current === sceneKey) return;
    lastPlayedKeyRef.current = sceneKey;

    const currentReqId = ++requestCounterRef.current;
    stopAudio();
    setAudioNotice(null);

    const hasCached = blobUrlCacheRef.current.has(sceneKey);
    if (!hasCached) setAudioLoading(true);

    void (async () => {
      try {
        const audioUrl = await fetchSceneAudioUrl(activeScene.id, selectedVoice);
        if (currentReqId !== requestCounterRef.current) return;
        setAudioLoading(false);

        const audio = new Audio(audioUrl);
        audioElRef.current = audio;
        await audio.play();

        // Warm-preload the next scene in the background for seamless transitions
        if (activeScene.id < SCENES.length) {
          void fetchSceneAudioUrl(activeScene.id + 1, selectedVoice).catch(() => {});
        }
      } catch (err) {
        if (currentReqId !== requestCounterRef.current) return;
        setAudioLoading(false);
        setAudioNotice(
          err instanceof Error
            ? err.message
            : 'Click Resume or Voice Narration ON to start studio audio.'
        );
      }
    })();
  }, [activeScene.id, selectedVoice, voiceEnabled, isPlaying, fetchSceneAudioUrl, stopAudio]);

  const handleTogglePlay = () => {
    if (elapsedSec >= TOTAL_DURATION_SEC) {
      lastPlayedKeyRef.current = null;
      setElapsedSec(0);
      setIsPlaying(true);
      return;
    }
    setIsPlaying((prev) => {
      const next = !prev;
      if (next) {
        lastPlayedKeyRef.current = null;
      } else {
        stopAudio();
      }
      return next;
    });
  };

  const handleReplay = () => {
    lastPlayedKeyRef.current = null;
    stopAudio();
    setElapsedSec(0);
    setIsPlaying(true);
  };

  const handleJumpToScene = (scene: WalkthroughScene) => {
    lastPlayedKeyRef.current = null;
    stopAudio();
    setElapsedSec(scene.startSec);
    setIsPlaying(true);
  };

  const handleVoiceChange = (voice: StudioVoiceId) => {
    lastPlayedKeyRef.current = null;
    stopAudio();
    setSelectedVoice(voice);
  };

  const handleCloseModal = () => {
    stopAudio();
    onClose();
  };

  // Sub-step triggers inside individual scenes for crisp animated storytelling
  const scene2Clicked = activeScene.id === 2 && sceneProgress >= 0.35;
  const scene3Clicked = activeScene.id === 3 && sceneProgress >= 0.35;
  const scene4Blocked = activeScene.id === 4 && sceneProgress >= 0.25;
  const scene4StepCount =
    activeScene.id !== 4
      ? 0
      : sceneProgress >= 0.78
      ? 3
      : sceneProgress >= 0.56
      ? 2
      : sceneProgress >= 0.36
      ? 1
      : 0;
  const scene4BarPct =
    activeScene.id === 4 ? Math.min(100, Math.round(32 + sceneProgress * 68)) : 100;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="60-Second How to Play Animated Walkthrough"
      className="fixed inset-0 z-[120] bg-slate-950/85 backdrop-blur-xs overflow-y-auto p-3 sm:p-6 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCloseModal();
      }}
    >
      <div className="w-full max-w-4xl rounded-2xl bg-[#081d38] border-2 border-[#dfa62a] shadow-2xl overflow-hidden text-white my-auto">
        {/* Top Video Player Header */}
        <div className="px-5 py-3.5 bg-[#06152a] border-b border-white/15 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>60-Sec Walkthrough</span>
            </span>
            <h3 className="font-serif text-sm sm:text-base font-bold text-[#fcd34d]">
              How to Play: The Discovery Exchange Challenge
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Select Studio Narrator Voice"
              value={selectedVoice}
              onChange={(e) => handleVoiceChange(e.target.value as StudioVoiceId)}
              className="px-2.5 py-1.5 rounded-lg bg-white/10 text-white border border-white/25 text-xs font-bold cursor-pointer focus:outline-none focus:border-[#dfa62a]"
            >
              {STUDIO_VOICES.map((v) => (
                <option key={v.id} value={v.id} className="bg-[#081d38] text-white">
                  {v.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setVoiceEnabled((prev) => !prev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold inline-flex items-center gap-1.5 border cursor-pointer transition-colors ${
                voiceEnabled
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-300/60'
                  : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/20'
              }`}
              aria-label="Toggle Voice Narration"
            >
              {audioLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Loading Studio Voice...</span>
                </>
              ) : voiceEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Studio Voice ON</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>Voice OFF</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCloseModal}
              aria-label="Close Walkthrough"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Animated Stage Viewport */}
        <div className="relative bg-gradient-to-br from-[#0b2447] via-[#0e2f5c] to-[#081d38] px-5 sm:px-8 py-6 min-h-[300px] sm:min-h-[330px] flex flex-col justify-between gap-4 border-b border-white/10">
          {/* Scene Title Pill */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dfa62a]/20 border border-[#dfa62a] text-[#fcd34d] text-xs font-extrabold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{activeScene.badge}</span>
            </span>
            <span className="text-xs sm:text-sm font-bold text-white">{activeScene.title}</span>
          </div>

          {/* SCENE 1 (0:00-0:10): Highlight the Top Stat Cards */}
          {activeScene.id === 1 && (
            <div className="space-y-4 my-auto">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
                {[
                  { label: 'PRACTICE FUNDS', value: '$100', tone: 'text-emerald-800 border-emerald-400' },
                  { label: 'PROPERTY BALANCE', value: '$0 / $1000', tone: 'text-[#9A6B0A] border-amber-400' },
                  { label: 'NDA AWARDS (30%)', value: '$0', tone: 'text-sky-900 border-sky-400' },
                  { label: 'DEBT-FREE SILOS', value: '0', tone: 'text-[#081d38] border-slate-400' },
                  { label: 'VIRTUAL DBC BADGES', value: '0', tone: 'text-[#b47d12] border-amber-400' },
                ].map((stat, idx) => {
                  const isHighlighted = Math.floor(sceneProgress * 5) === idx;
                  return (
                    <div
                      key={stat.label}
                      className={`p-3 rounded-xl bg-white border-2 transition-all duration-300 ${
                        stat.tone
                      } ${
                        isHighlighted
                          ? 'scale-105 ring-4 ring-[#fcd34d]/80 shadow-xl'
                          : 'opacity-90'
                      }`}
                    >
                      <div className="text-[10px] font-extrabold uppercase tracking-wide text-[#1e293b]">
                        {stat.label}
                      </div>
                      <div className="text-base sm:text-lg font-black tabular-nums mt-1">
                        {stat.value}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-bold">
                <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-400 text-emerald-100">
                  ✓ 0% Bank Mortgages
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-[#dfa62a]/20 border border-[#dfa62a] text-[#fcd34d]">
                  ✓ $0 Money Ever Held by TDEX
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-sky-500/20 border border-sky-400 text-sky-100">
                  ✓ 100% Free Educational Simulation
                </span>
              </div>
            </div>
          )}

          {/* SCENE 2 (0:10-0:22): Animated Cursor Clicking List & Sell on $320 Sofa */}
          {activeScene.id === 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center my-auto">
              <div className="relative p-4 rounded-xl bg-white text-[#081d38] border-2 border-[#dfa62a] shadow-lg space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="uppercase text-slate-500">Home &amp; Furniture</span>
                  <span className="px-2 py-0.5 rounded bg-[#081d38] text-[#fcd34d] font-extrabold">
                    $320
                  </span>
                </div>
                <div className="font-extrabold text-base">Unused Family Sofa / Furniture Set</div>
                <div className="text-xs text-slate-600">
                  50% Funds: <strong>$160</strong> &bull; 25% Seller: <strong>$80</strong> &bull; 25%
                  Buyer: <strong>$80</strong>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 relative">
                  <div
                    className={`py-2 px-3 rounded-lg text-center text-xs font-extrabold transition-all duration-300 ${
                      scene2Clicked
                        ? 'bg-emerald-600 text-white scale-95 ring-4 ring-[#fcd34d]'
                        : 'bg-[#081d38] text-[#fcd34d]'
                    }`}
                  >
                    List &amp; Sell
                  </div>
                  <div className="py-2 px-3 rounded-lg bg-amber-100 text-[#081d38] text-center text-xs font-extrabold opacity-60">
                    Buy (+25% Prop)
                  </div>
                  <div
                    className={`absolute transition-all duration-500 pointer-events-none flex items-center gap-1 ${
                      scene2Clicked
                        ? 'left-[22%] top-[55%] scale-110 text-emerald-600'
                        : 'left-[65%] top-[90%] text-[#dfa62a]'
                    }`}
                  >
                    <MousePointerClick className="w-6 h-6 drop-shadow-md fill-white" />
                    {scene2Clicked && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-black shadow-md">
                        CLICK!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <div
                  className={`p-3.5 rounded-xl border-2 transition-all duration-500 ${
                    scene2Clicked
                      ? 'bg-emerald-900/60 border-emerald-400 scale-[1.02]'
                      : 'bg-white/10 border-white/20'
                  }`}
                >
                  <div className="text-[11px] font-extrabold uppercase text-emerald-200">
                    Practice Funds (50% Immediate)
                  </div>
                  <div className="text-2xl font-black text-white tabular-nums mt-0.5 flex items-center gap-2">
                    <span>{scene2Clicked ? '$260' : '$100'}</span>
                    {scene2Clicked && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-extrabold">
                        +$160 (50%)
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className={`p-3.5 rounded-xl border-2 transition-all duration-500 ${
                    scene2Clicked
                      ? 'bg-amber-900/50 border-[#fcd34d] scale-[1.02]'
                      : 'bg-white/10 border-white/20'
                  }`}
                >
                  <div className="text-[11px] font-extrabold uppercase text-[#fcd34d]">
                    Property Balance (25% Seller Credit)
                  </div>
                  <div className="text-2xl font-black text-white tabular-nums mt-0.5 flex items-center gap-2">
                    <span>{scene2Clicked ? '$80 / $1,000' : '$0 / $1,000'}</span>
                    {scene2Clicked && (
                      <span className="px-2 py-0.5 rounded-full bg-[#dfa62a] text-[#081d38] text-xs font-extrabold">
                        +$80 (25%)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCENE 3 (0:22-0:32): Animated Cursor Clicking Buy (+25% Prop) on $240 Tool Chest */}
          {activeScene.id === 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center my-auto">
              <div className="relative p-4 rounded-xl bg-white text-[#081d38] border-2 border-[#dfa62a] shadow-lg space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="uppercase text-slate-500">Tools &amp; Workshop</span>
                  <span className="px-2 py-0.5 rounded bg-[#081d38] text-[#fcd34d] font-extrabold">
                    $240
                  </span>
                </div>
                <div className="font-extrabold text-base">120-Piece Mechanics Tool Chest</div>
                <div className="text-xs text-slate-600">
                  50% Funds: <strong>$120</strong> &bull; 25% Seller: <strong>$60</strong> &bull; 25%
                  Buyer: <strong>$60</strong>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 relative">
                  <div className="py-2 px-3 rounded-lg bg-[#081d38] text-[#fcd34d] text-center text-xs font-extrabold opacity-60">
                    List &amp; Sell
                  </div>
                  <div
                    className={`py-2 px-3 rounded-lg text-center text-xs font-extrabold transition-all duration-300 ${
                      scene3Clicked
                        ? 'bg-[#dfa62a] text-[#081d38] scale-95 ring-4 ring-emerald-400'
                        : 'bg-amber-200 text-[#081d38]'
                    }`}
                  >
                    Buy (+25% Prop)
                  </div>
                  <div
                    className={`absolute transition-all duration-500 pointer-events-none flex items-center gap-1 ${
                      scene3Clicked
                        ? 'left-[68%] top-[55%] scale-110 text-[#9A6B0A]'
                        : 'left-[25%] top-[90%] text-[#dfa62a]'
                    }`}
                  >
                    <MousePointerClick className="w-6 h-6 drop-shadow-md fill-white" />
                    {scene3Clicked && (
                      <span className="px-2 py-0.5 rounded-full bg-[#dfa62a] text-[#081d38] text-[10px] font-black shadow-md">
                        BUY +25%!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div
                  className={`p-4 rounded-xl border-2 transition-all duration-500 ${
                    scene3Clicked
                      ? 'bg-amber-900/50 border-[#fcd34d] scale-[1.02]'
                      : 'bg-white/10 border-white/20'
                  }`}
                >
                  <div className="text-[11px] font-extrabold uppercase text-[#fcd34d]">
                    Property Balance Jumps Again!
                  </div>
                  <div className="text-2xl font-black text-white tabular-nums mt-1 flex items-center gap-2">
                    <span>{scene3Clicked ? '$140 / $1,000' : '$80 / $1,000'}</span>
                    {scene3Clicked && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-extrabold">
                        +$60 (25%)
                      </span>
                    )}
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-white/15 overflow-hidden mt-3">
                    <div
                      className="h-full bg-[#fcd34d] transition-all duration-500"
                      style={{ width: scene3Clicked ? '14%' : '8%' }}
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-200 font-medium">
                  Both sellers AND buyers earn <strong>25% Property Balance</strong> on every trade
                  toward closing a 100% debt-free apartment building!
                </p>
              </div>
            </div>
          )}

          {/* SCENE 4 (0:32-0:44): Mortgage Trap Blocked by Pipito + $1,000/1,000 DILOS Audit Gate */}
          {activeScene.id === 4 && (
            <div className="space-y-3.5 my-auto">
              <div className="p-3.5 rounded-xl bg-red-950/70 border-2 border-red-400 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-red-300 shrink-0" />
                  <div className="text-xs sm:text-sm">
                    <strong className="text-red-200">Bank Offer:</strong> &ldquo;Take a fast 7%
                    interest mortgage!&rdquo;
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase transition-all duration-300 ${
                    scene4Blocked
                      ? 'bg-emerald-500 text-white scale-105 shadow-md'
                      : 'bg-white/10 text-slate-300'
                  }`}
                >
                  {scene4Blocked ? '✓ PIPITO BLOCKED — 100% DEBT-FREE' : 'Checking Article 9.1...'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-white/10 border border-white/20 space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold">
                  <span className="text-[#fcd34d]">Silo #1 Escrow Goal Progress</span>
                  <span className="tabular-nums text-white">
                    ${Math.round(scene4BarPct * 10)} / $1,000 ({scene4BarPct}%)
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#dfa62a] to-emerald-400 transition-all duration-300"
                    style={{ width: `${scene4BarPct}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                {[
                  { num: 1, title: '1. Columbo Math Check', sub: '50/25/25 integer-cent verified' },
                  { num: 2, title: '2. Pipito Zero-Debt Gate', sub: '0% mortgage & 0% liens' },
                  { num: 3, title: '3. Human Witness Sign-Off', sub: 'SHA-256 Open Ledger logged' },
                ].map((gate) => {
                  const passed = scene4StepCount >= gate.num;
                  return (
                    <div
                      key={gate.num}
                      className={`p-3 rounded-xl border transition-all duration-300 ${
                        passed
                          ? 'bg-emerald-600/30 border-emerald-400 text-white scale-[1.02]'
                          : 'bg-white/5 border-white/15 text-slate-300'
                      }`}
                    >
                      <div className="font-extrabold flex items-center gap-1.5">
                        <CheckCircle2
                          className={`w-4 h-4 ${passed ? 'text-emerald-300' : 'text-slate-500'}`}
                        />
                        <span>{gate.title}</span>
                      </div>
                      <div className="text-[11px] opacity-90 mt-0.5">{gate.sub}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SCENE 5 (0:44-0:60): Debt-Free Silo #1 Closed + Virtual DBC Badge + 70/30 Rent */}
          {activeScene.id === 5 && (
            <div className="space-y-3.5 my-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-emerald-900/40 border-2 border-emerald-400 flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-300 flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6 text-emerald-200" />
                  </div>
                  <div>
                    <div className="text-[11px] font-extrabold uppercase text-emerald-200">
                      Debt-Free Silos Closed
                    </div>
                    <div className="text-2xl font-black text-white">1 Silo Closed (0% Debt)</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-900/40 border-2 border-[#fcd34d] flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-[#dfa62a]/25 border border-[#fcd34d] flex items-center justify-center shrink-0">
                    <Coins className="w-6 h-6 text-[#fcd34d]" />
                  </div>
                  <div>
                    <div className="text-[11px] font-extrabold uppercase text-[#fcd34d]">
                      Virtual DBC Badge Unlocked
                    </div>
                    <div className="text-xl font-black text-white">
                      1 Discovery Brick Coin Badge
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/10 border border-white/20 space-y-2.5">
                <div className="text-xs font-extrabold uppercase tracking-wider text-[#fcd34d] flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  <span>Permanent 70 / 30 Net Rental Split Flowing Automatically</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-10 gap-2 text-xs font-extrabold">
                  <div className="sm:col-span-7 p-2.5 rounded-lg bg-emerald-600 text-white flex items-center justify-between">
                    <span>70% To Participating Families</span>
                    <span>+$210 / mo</span>
                  </div>
                  <div className="sm:col-span-3 p-2.5 rounded-lg bg-sky-600 text-white flex items-center justify-between">
                    <span>30% Public Schools (NDA)</span>
                    <span>+$90 / mo</span>
                  </div>
                </div>
                <div className="text-[11px] text-emerald-200 font-bold flex items-center gap-1.5 pt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>
                    Then click &ldquo;Keep Building: Unlock Silo #2&rdquo; to expand your
                    neighborhood as long as you want!
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Live Captions Box */}
        <div className="px-6 py-4 bg-[#06152a] border-b border-white/10">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#fcd34d]">
              Studio Narration &amp; Captions ({activeScene.badge})
            </div>
            {audioNotice && (
              <div className="text-[11px] font-semibold text-amber-300">{audioNotice}</div>
            )}
          </div>
          <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
            &ldquo;{activeScene.narration}&rdquo;
          </p>
        </div>

        {/* Video Progress Bar + Scene Jump Pills + Playback Controls */}
        <div className="px-5 sm:px-6 py-4 bg-[#081d38] space-y-3.5">
          {/* Interactive 60-Second Timeline Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 tabular-nums">
              <span>{formatTime(elapsedSec)}</span>
              <span>60-Second Studio Walkthrough</span>
              <span>0:60</span>
            </div>
            <div
              role="slider"
              aria-label="Walkthrough progress"
              aria-valuemin={0}
              aria-valuemax={TOTAL_DURATION_SEC}
              aria-valuenow={Math.round(elapsedSec)}
              tabIndex={0}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                lastPlayedKeyRef.current = null;
                stopAudio();
                setElapsedSec(+(ratio * TOTAL_DURATION_SEC).toFixed(1));
              }}
              className="w-full h-3 rounded-full bg-white/15 overflow-hidden cursor-pointer relative"
            >
              <div
                className="h-full bg-gradient-to-r from-[#dfa62a] via-[#fcd34d] to-emerald-400 transition-all duration-100"
                style={{ width: `${totalProgressPct}%` }}
              />
            </div>

            {/* 5 Clickable Scene Jump Pills */}
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {SCENES.map((scene) => {
                const active = activeScene.id === scene.id;
                return (
                  <button
                    key={scene.id}
                    type="button"
                    onClick={() => handleJumpToScene(scene)}
                    className={`py-1.5 px-2 rounded-lg text-[10px] sm:text-[11px] font-bold truncate cursor-pointer transition-colors ${
                      active
                        ? 'bg-[#dfa62a] text-[#081d38]'
                        : 'bg-white/10 hover:bg-white/20 text-slate-200'
                    }`}
                  >
                    Scene {scene.id}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Action Row: Play/Pause, Replay, and [Start Playing Now] */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-extrabold inline-flex items-center gap-1.5 cursor-pointer"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4 text-[#fcd34d]" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-[#fcd34d] fill-[#fcd34d]" />
                    <span>{elapsedSec >= TOTAL_DURATION_SEC ? 'Play Again' : 'Resume'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReplay}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleCloseModal}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 shadow-lg border border-emerald-300/60 cursor-pointer"
            >
              <Gamepad2 className="w-4 h-4 text-[#fcd34d]" />
              <span>Start Playing Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
