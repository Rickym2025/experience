"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Sparkles } from "lucide-react";
import { avviaCheckoutExperience, getLivePriceExperience } from "@/lib/stripe";

export default function LandingPricing() {
  const [loading, setLoading] = useState(false);
  const [livePrice, setLivePrice] = useState<number>(390);

  // Scarica il prezzo aggiornato da Supabase all'apertura
  useEffect(() => {
    getLivePriceExperience(390).then(price => setLivePrice(price));
  }, []);

  const handleUnlock = async () => {
    setLoading(true);
    await avviaCheckoutExperience("nuovo_ristorante", "Nuovo Ristorante", undefined, livePrice);
    setLoading(false);
  };

  return (
    <section id="pricing" className="py-24 px-6 relative z-10 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest mb-4">
          <Sparkles size={14} /> Modello Una Tantum Trasparente
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          Investi sull&apos;Esperienza, <br /><span className="text-amber-400">non sui canoni mensili.</span>
        </h2>
        <p className="text-stone-400 mt-4 max-w-xl mx-auto text-base">
          Nessuna percentuale sulle ordinazioni. Paga una sola volta per pubblicare il tuo portale definitivo.
        </p>
      </div>

      <div className="max-w-xl mx-auto bg-gradient-to-b from-amber-950/30 via-zinc-900 to-black border-2 border-amber-500/70 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-amber-500/15 relative">
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
          PACCHETTO ALL-INCLUSIVE
        </div>

        <div className="text-center border-b border-white/10 pb-8 mb-8">
          <h3 className="text-2xl font-black text-white uppercase">Sblocco Portale &amp; Smart Menu</h3>
          <div className="mt-4 flex items-baseline justify-center gap-2">
            <span className="text-5xl sm:text-6xl font-black text-white">€ {livePrice}</span>
            <span className="text-stone-400 text-xs font-bold uppercase">una tantum</span>
          </div>
          <p className="text-xs text-amber-400 font-bold mt-2">Zero canoni mensili • Il portale è tuo per sempre</p>
        </div>

        <ul className="space-y-3.5 text-xs sm:text-sm text-stone-200 mb-8">
          <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-amber-400 shrink-0" /> Dominio personalizzato incluso (es. <i>menu.tuoristorante.it</i>)</li>
          <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-amber-400 shrink-0" /> Hosting cloud veloce ad alta disponibilità</li>
          <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-amber-400 shrink-0" /> Storytelling piatti &amp; Abbinamenti vino guidati</li>
          <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-amber-400 shrink-0" /> Assistente AI Sommelier &amp; Prenotazioni (Nexus)</li>
          <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-amber-400 shrink-0" /> File grafici QR Code in alta risoluzione per la stampa</li>
        </ul>

        <button
          onClick={handleUnlock}
          disabled={loading}
          className="w-full py-5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-black font-black rounded-2xl transition-all shadow-xl shadow-amber-500/25 uppercase tracking-wider text-sm cursor-pointer disabled:opacity-50"
        >
          {loading ? "Apertura Checkout Sicuro..." : `Sblocca il tuo Locale Ora (€${livePrice}) 🚀`}
        </button>
      </div>
    </section>
  );
}
