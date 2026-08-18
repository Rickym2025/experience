"use client";

import React, { useState } from "react";
import { CheckCircle2, Sparkles } from "lucide-react";
import { avviaCheckoutExperience } from "@/lib/stripe";

export default function LandingPricing() {
  const [loading, setLoading] = useState(false);

  const handleUnlock = async () => {
    setLoading(true);
    await avviaCheckoutExperience("nuovo_ristorante", "Nuovo Ristorante");
    setLoading(false);
  };

  return (
    <section id="pricing" className="py-24 px-6 relative z-10 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest mb-4">
          <Sparkles size={14} /> Nessun Abbonamento Mensile
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          Un unico investimento. <span className="text-amber-400">Tuo per sempre.</span>
        </h2>
        <p className="text-stone-400 mt-4 max-w-xl mx-auto text-base">
          Nessun canone mensile vincolante e nessuna commissione sugli ordini.
        </p>
      </div>

      <div className="max-w-xl mx-auto bg-gradient-to-b from-amber-950/30 via-zinc-900 to-black border-2 border-amber-500/70 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-amber-500/15 relative">
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
          PACCHETTO COMPLETO CHIAVI IN MANO
        </div>

        <div className="text-center border-b border-white/10 pb-8 mb-8">
          <h3 className="text-2xl font-black text-white uppercase">Sblocco Locale & Smart Menu</h3>
          <div className="mt-4 flex items-baseline justify-center gap-2">
            <span className="text-stone-500 line-through text-xl">€ 590</span>
            <span className="text-5xl sm:text-6xl font-black text-white">€ 390</span>
            <span className="text-stone-400 text-xs font-bold uppercase">una tantum</span>
          </div>
          <p className="text-xs text-amber-400 font-bold mt-2">Zero canoni mensili • Dominio e Hosting inclusi</p>
        </div>

        <ul className="space-y-3.5 text-xs sm:text-sm text-stone-200 mb-8">
          <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-amber-400 shrink-0" /> Dominio personalizzato (es. <i>menu.tuoristorante.it</i>)</li>
          <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-amber-400 shrink-0" /> Menu interattivo con foto, storytelling e abbinamenti vino</li>
          <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-amber-400 shrink-0" /> Video verticali dei piatti e dell&apos;atmosfera del locale</li>
          <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-amber-400 shrink-0" /> Cameriere virtuale AI al tavolo (Nexus AI) per allergeni e domande</li>
          <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-amber-400 shrink-0" /> File grafici del QR Code in alta risoluzione pronti da stampare</li>
          <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-amber-400 shrink-0" /> Pannello di gestione per cambiare prezzi e piatti in tempo reale</li>
        </ul>

        <button
          onClick={handleUnlock}
          disabled={loading}
          className="w-full py-5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-black font-black rounded-2xl transition-all shadow-xl shadow-amber-500/25 uppercase tracking-wider text-sm cursor-pointer disabled:opacity-50"
        >
          {loading ? "Apertura Checkout Sicuro..." : "Sblocca il tuo Locale Ora (€390) 🚀"}
        </button>
      </div>
    </section>
  );
}
