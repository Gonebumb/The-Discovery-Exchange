import { useEffect, useState } from 'react';
import { Gamepad2, Play, Sparkles } from 'lucide-react';

interface HeroGameSlideOverlayProps {
  onPlayNow: () => void;
}

const HERO_GAME_IMAGE = '/src/assets/images/hero_game_challenge_1795219534201.jpg';

export function HeroGameSlideOverlay({ onPlayNow }: HeroGameSlideOverlayProps) {
  // Rotate smoothly between the fun Game Hero slide and the existing Main Hero banner
  const [showGameSlide, setShowGameSlide] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  useEffect(() => {
    if (isHovered) return;
    const durationMs = showGameSlide ? 8000 : 9000;
    const timer = window.setTimeout(() => {
      setShowGameSlide((prev) => !prev);
    }, durationMs);
    return () => window.clearTimeout(timer);
  }, [showGameSlide, isHovered]);

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Fun Discovery Exchange Game Hero Slide */}
      <div
        role="region"
        aria-label="Play The Discovery Exchange Challenge Hero Banner"
        aria-hidden={!showGameSlide}
        onClick={(e) => {
          e.stopPropagation();
          onPlayNow();
        }}
        className={`absolute inset-0 overflow-hidden transition-opacity duration-700 ease-in-out ${
          showGameSlide
            ? 'opacity-100 z-30 pointer-events-auto cursor-pointer'
            : 'opacity-0 z-0 pointer-events-none'
        }`}
        style={{
          background:
            'linear-gradient(95deg, #071936 0%, #0b2447 46%, #102e57 62%, #091d3a 100%)',
        }}
      >
        {/* Right-side full-height fun game artwork with seamless left-edge blend */}
        <div className="absolute inset-y-0 right-0 w-full sm:w-[66%] md:w-[60%] lg:w-[56%] overflow-hidden">
          <img
            src={HERO_GAME_IMAGE}
            alt="Families, kids, and teachers playing Build the Block — turning everyday household items into debt-free brick apartment buildings and public school funding"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-[74%_46%] sm:object-[68%_46%]"
          />
          {/* Seamless royal-navy gradient blend on the left edge so text stays razor-sharp */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, #0b2447 0%, rgba(11,36,71,0.92) 14%, rgba(11,36,71,0.38) 32%, rgba(11,36,71,0) 52%)',
            }}
          />
        </div>

        {/* Left-side mobile scrim for readability on narrow screens */}
        <div
          className="absolute inset-0 sm:hidden"
          style={{
            background:
              'linear-gradient(90deg, rgba(7,25,54,0.94) 0%, rgba(7,25,54,0.82) 55%, rgba(7,25,54,0.35) 100%)',
          }}
        />

        {/* Foreground Content Column */}
        <div className="relative z-10 h-full max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12 pb-9 pt-4 sm:py-6 flex items-center">
          <div className="max-w-[560px] space-y-2.5 sm:space-y-3 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/60 text-emerald-200 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#fcd34d]" />
              <span>Jump In &amp; Play Free — Learn in 3 Minutes, Build for Hours</span>
            </div>

            <h1 className="font-serif text-lg sm:text-2xl lg:text-[1.85rem] font-extrabold text-white leading-[1.15] tracking-tight drop-shadow-xs">
              Play{' '}
              <span className="text-[#fcd34d]">“Build the Block”</span> — The Discovery Exchange
              Game
            </h1>

            <p className="text-[11.5px] sm:text-[13px] lg:text-[13.5px] text-slate-100 leading-snug sm:leading-relaxed font-medium max-w-[515px]">
              Go ahead and play to understand better how{' '}
              <strong className="text-white">The Discovery Exchange</strong> works—try the{' '}
              <strong className="text-[#fcd34d]">50 / 25 / 25</strong> Marketplace split, dodge bank
              debt traps, and close on a 100% debt-free apartment building!
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-0.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayNow();
                }}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white text-xs sm:text-[13px] font-extrabold shadow-lg border border-emerald-300/60 transition-transform hover:-translate-y-0.5 cursor-pointer"
              >
                <Gamepad2 className="w-4 h-4 text-[#fcd34d]" />
                <span>Go Ahead &amp; Play Now</span>
                <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-[#fcd34d] text-[#071936] text-[9.5px] font-black uppercase tracking-wide leading-none">
                  FREE
                </span>
              </button>

              <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-200/90">
                <Play className="w-3 h-3 text-[#fcd34d] fill-[#fcd34d]" />
                <span>No sign-up • Instant practice demo</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Always-accessible Bottom-Left Hero Slide Switcher (never collides with bottom-right video controls) */}
      <div
        className="absolute bottom-2.5 left-3 z-40 pointer-events-auto flex items-center gap-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowGameSlide(false);
          }}
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer shadow-sm ${
            !showGameSlide
              ? 'bg-[#fcd34d] text-[#071936] border-[#fcd34d]'
              : 'bg-[#071936]/85 text-slate-200 border-white/25 hover:border-[#fcd34d]/70 hover:text-[#fcd34d]'
          }`}
        >
          1. Main Hero
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowGameSlide(true);
          }}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer shadow-sm ${
            showGameSlide
              ? 'bg-emerald-500 text-white border-emerald-300'
              : 'bg-[#071936]/85 text-[#fcd34d] border-[#fcd34d]/50 hover:bg-emerald-600/90 hover:text-white'
          }`}
        >
          <span>🎮 2. Play the Game</span>
        </button>
      </div>
    </div>
  );
}
