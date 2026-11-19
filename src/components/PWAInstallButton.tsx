import React, { useState } from 'react';
import { Download, Share2, Smartphone, WifiOff, X } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showMobileGuide, setShowMobileGuide] = useState(false);
  const [dismissedButton, setDismissedButton] = useState(false);

  if (isInstalled || dismissedButton) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-3 left-3 sm:bottom-4 sm:left-4 z-40 flex items-center gap-1.5 max-w-[calc(100vw-6.5rem)]">
        {isInstallable ? (
          <button
            type="button"
            onClick={() => {
              void install();
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#081d38] hover:bg-[#0f2b52] text-[#dfa62a] border-2 border-[#dfa62a] text-xs font-bold shadow-lg cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install TDEX App</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setShowMobileGuide(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#081d38] hover:bg-[#0f2b52] text-[#dfa62a] border-2 border-[#dfa62a] text-xs font-bold shadow-lg cursor-pointer transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{isIOS ? 'Install on iPhone / iPad' : 'Get Mobile App'}</span>
          </button>
        )}

        <button
          type="button"
          aria-label="Hide install button"
          onClick={() => setDismissedButton(true)}
          className="p-1.5 rounded-full bg-[#081d38]/90 text-slate-300 hover:text-white border border-white/20 shadow cursor-pointer"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {showMobileGuide && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowMobileGuide(false);
          }}
        >
          <div className="w-full max-w-md max-h-[90dvh] overflow-y-auto bg-white rounded-2xl border-2 border-[#dfa62a] shadow-2xl">
            <div className="bg-[#081d38] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#dfa62a]" />
                <h3 className="font-serif text-lg font-bold">
                  Install TDEX on Your Phone
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileGuide(false)}
                className="p-1 rounded-lg text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs sm:text-sm text-slate-700">
              <div className="p-3.5 rounded-xl bg-[#fbfaf7] border border-slate-200 space-y-1.5">
                <div className="font-bold text-[#081d38] flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-[#b47d12]" />
                  <span>iPhone &amp; iPad (Safari):</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  1. Open <strong>nationaldiscoveryawards.com</strong> in Safari.<br />
                  2. Tap the <strong>Share</strong> icon (square with upward arrow).<br />
                  3. Scroll down and tap <strong>Add to Home Screen</strong> → <strong>Add</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#fbfaf7] border border-slate-200 space-y-1.5">
                <div className="font-bold text-[#081d38] flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-emerald-700" />
                  <span>Android (Chrome):</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  1. Open <strong>nationaldiscoveryawards.com</strong> in Chrome.<br />
                  2. Tap the <strong>⋮ menu</strong> (top right) → <strong>Install app</strong> (or <strong>Add to Home screen</strong>).
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowMobileGuide(false)}
                className="w-full py-2.5 rounded-xl bg-[#081d38] hover:bg-[#0f2b52] text-[#dfa62a] text-xs font-bold cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-3 right-3 z-50 flex items-center gap-2 rounded-full bg-amber-500 px-3 py-1.5 text-xs font-bold text-[#081d38] shadow-lg border border-amber-200">
      <WifiOff className="w-3.5 h-3.5" />
      <span>Offline Mode — Cached View Active</span>
    </div>
  );
};
