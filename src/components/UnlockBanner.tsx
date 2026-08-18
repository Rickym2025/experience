"use client";

import React, { useState, useEffect } from "react";
import { avviaCheckoutExperience, getLivePriceExperience } from "@/lib/stripe";

interface UnlockBannerProps {
  slug: string;
  nomeRistorante: string;
  ownerEmail?: string;
  isPaid?: boolean;
}

export default function UnlockBanner({
  slug,
  nomeRistorante,
  ownerEmail,
  isPaid
}: UnlockBannerProps) {
  const [loading, setLoading] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [livePrice, setLivePrice] = useState<number>(390);

  useEffect(() => {
    getLivePriceExperience(390).then(p => setLivePrice(p));
  }, []);

  if (isPaid) return null;

  const handleUnlock = async () => {
    setLoading(true);
    await avviaCheckoutExperience(slug, nomeRistorante, ownerEmail, livePrice);
    setLoading(false);
  };

  return (
    <aside aria-label="Banner sblocco smart menu" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <div className="bg-[#0b0c10]/95 backdrop-blur-xl border border-amber-500/40 rounded-2xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.8)] text-white flex items-center justify-between gap-4">
        {!minimized ? (
          <>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
                  Anteprima Smart Menu
                </span>
              </div>
              <p className="text-xs text-stone-300 font-medium">
                Sblocca il portale per <strong>{nomeRistorante}</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleUnlock}
                disabled={loading}
                className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-amber-500/20 whitespace-nowrap cursor-pointer disabled:opacity-50"
              >
                {loading ? "Apertura..." : `Sblocca a €${livePrice} 🚀`}
              </button>
              <button
                onClick={() => setMinimized(true)}
                className="text-stone-500 hover:text-white text-xs p-1 cursor-pointer"
                title="Riduci a icona"
              >
                ✕
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={() => setMinimized(false)}
            className="w-full text-center text-xs font-bold text-amber-400 hover:underline cursor-pointer"
          >
            🔒 Sblocca Smart Menu Definitivo (€{livePrice})
          </button>
        )}
      </div>
    </aside>
  );
}
