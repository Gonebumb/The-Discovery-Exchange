import React, { useEffect } from 'react';
import { ArrowRight, BookOpen, Scale, ShieldCheck, X } from 'lucide-react';

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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={card.title}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-xl max-h-[90dvh] flex flex-col bg-white rounded-2xl border-2 border-[#dfa62a] shadow-2xl overflow-hidden my-auto">
        {/* Navy & Gold Header */}
        <div className="bg-[#081d38] text-white px-6 py-4 flex items-start justify-between gap-4 border-b border-[#dfa62a]/40">
          <div className="space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#dfa62a] inline-flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Quick Kitchen-Table Bridge &bull; {card.articleCitation}</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white leading-snug">
              {card.title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 text-slate-800 max-h-[80vh] overflow-y-auto">
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
      </div>
    </div>
  );
};
