import React, { useEffect } from 'react';
import { ArrowRight, BookOpen, Scale, ShieldCheck, X } from 'lucide-react';
import { MarketplaceBridgeContent } from './MarketplaceBridgeContent';

export interface HomepageWindowCardData {
  id: string;
  title: string;
  articleCitation: string;
  quickReminder: string;
  bridgeExplanation: string;
  keyTakeaways: string[];
  targetRouteLabel: string;
  onOpenFullPage: () => void;
  onOpenConstitution: () => void;
}

interface QuickBridgePreviewModalProps {
  card: HomepageWindowCardData | null;
  onClose: () => void;
}

export const QuickBridgePreviewModal: React.FC<QuickBridgePreviewModalProps> = ({
  card,
  onClose,
}) => {
  useEffect(() => {
    if (!card) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [card, onClose]);

  if (!card) return null;

  const isMarketplaceBridge = card.id === 'marketplace';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={card.title}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full ${
          isMarketplaceBridge ? 'max-w-[1220px] max-h-[92dvh]' : 'max-w-xl max-h-[90dvh]'
        } flex flex-col bg-[#F8FAFC] rounded-2xl border-2 border-[#dfa62a] shadow-2xl overflow-hidden my-auto`}
      >
        {/* Navy & Gold Header */}
        <div className="bg-[#081d38] text-white px-6 py-4 flex items-center justify-between gap-4 border-b-2 border-[#dfa62a]/60 shrink-0">
          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#dfa62a] inline-flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Quick Kitchen-Table Bridge &bull; {card.articleCitation}</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white leading-snug">
              {card.title}
            </h3>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {isMarketplaceBridge && (
              <button
                type="button"
                onClick={() => {
                  card.onOpenFullPage();
                  onClose();
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#dfa62a] hover:bg-[#eab308] text-[#081d38] font-extrabold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                <span>Continue to Marketplace</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="p-2 rounded-lg text-slate-200 hover:text-white bg-white/10 hover:bg-white/20 cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        {isMarketplaceBridge ? (
          <div className="p-6 space-y-6 text-slate-800 overflow-y-auto flex-1">
            <MarketplaceBridgeContent
              onContinueToMarketplace={() => {
                card.onOpenFullPage();
                onClose();
              }}
              onOpenConstitution={() => {
                card.onOpenConstitution();
                onClose();
              }}
            />

            {/* Sticky-Style Bottom Action Bar */}
            <div className="bg-[#081d38] text-white border-2 border-[#dfa62a] rounded-2xl p-5 flex flex-row items-center justify-between gap-4 shadow-md">
              <div className="space-y-0.5">
                <div className="font-serif text-lg font-bold text-white">
                  Ready to Browse or List an Item?
                </div>
                <p className="text-xs text-slate-200">
                  Close this bridge guide and continue directly into the live Discovery Marketplace ($0 listing fee).
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    card.onOpenConstitution();
                    onClose();
                  }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/25 font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" aria-hidden="true" />
                  <span>Read Constitutional Article</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-100 text-[#081d38] font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
                >
                  <span>Close</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    card.onOpenFullPage();
                    onClose();
                  }}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#dfa62a] hover:bg-[#eab308] text-[#081d38] font-extrabold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer shadow-sm"
                >
                  <span>Continue to Marketplace</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-5 text-slate-800 max-h-[80vh] overflow-y-auto bg-white">
            <div className="p-4 rounded-xl bg-[#fbfaf7] border border-slate-200 space-y-1.5">
              <div className="text-xs font-bold uppercase tracking-wider text-[#b47d12]">
                30-Second Summary
              </div>
              <p className="text-sm font-medium text-[#081d38] leading-relaxed">
                {card.quickReminder}
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-[#081d38]">
                How It Connects (Plain-English Bridge)
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{card.bridgeExplanation}</p>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-[#081d38]">
                Constitutional Safeguards
              </div>
              <ul className="space-y-2">
                {card.keyTakeaways.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dual Action Buttons */}
            <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  card.onOpenFullPage();
                  onClose();
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#081d38] hover:bg-[#0f2b52] text-[#dfa62a] font-bold text-sm rounded-xl transition-colors cursor-pointer"
              >
                <span>Open Full Page</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => {
                  card.onOpenConstitution();
                  onClose();
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-amber-50 text-[#081d38] border-2 border-[#081d38] font-bold text-sm rounded-xl transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4" aria-hidden="true" />
                <span>Read Constitutional Article</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
