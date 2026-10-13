"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Sparkles, Music2, Plus } from "lucide-react";
import { avviaCheckoutExperience, getLivePricesExperience } from "@/lib/stripe";

export default function LandingPricing() {
  const [loading, setLoading] = useState<boolean>(false);
  const [basePrice, setBasePrice] = useState<number>(390);
  const [musicPrice, setMusicPrice] = useState<number>(250);
  const [includeMusic, setIncludeMusic] = useState<boolean>(false);

  // Scarica i prezzi aggiornati da Supabase S2 all'avvio (Zero-Flicker con fallback)
  useEffect(() => {
    getLivePricesExperience().then((prices) => {
      setBasePrice(prices.basePrice);
      setMusicPrice(prices.musicPrice);
    });
  }, []);

  const totalPrice = basePrice + (includeMusic ? musicPrice : 0);

  const handleUnlock = async (): Promise<void> => {
    setLoading(true);
    await avviaCheckoutExperience("nuovo_ristorante", "Nuovo Ristorante", includeMusic, undefined, totalPrice);
    setLoading(false);
  };

  return (
    <section id="pricing" className="py-24 px-6 relative z-10 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest mb-4">
          <Sparkles size={14} /> Tariffa Una Tantum Trasparente
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          Investi sull&apos;Esperienza, <br /><span className="text-amber-400">non sui canoni mensili.</span>
        </h2>
        <p className="text-stone-400 mt-4 max-w-xl mx-auto text-base">
          Nessuna commissione sulle portate. Paga una sola volta per pubblicare il tuo portale definitivo.
        </p>
      </div>

      <div className="max-w-2xl mx-auto bg-gradient-to-b from-amber-950/30 via-zinc-900 to-black border-2 border-amber-500/70 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl shadow-amber-500/15 relative">
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
          PACCHETTO PORTALE DEFINITIVO
        </div>

        {/* Testata Prezzo Dinamico */}
        <div className="text-center border-b border-white/10 pb-8 mb-8">
          <h3 className="text-2xl font-black text-white uppercase">Sblocco Smart Menu &amp; Storytelling</h3>
          <div className="mt-4 flex items-baseline justify-center gap-2">
            <span className="text-5xl sm:text-6xl font-black text-white">€ {totalPrice}</span>
            <span className="text-stone-400 text-xs font-bold uppercase">una tantum</span>
          </div>
          <p className="text-xs text-amber-400 font-bold mt-2">Zero canoni mensili • Il portale è tuo a vita</p>
        </div>

        {/* Caratteristiche Base Incluse */}
        <ul className="space-y-3.5 text-xs sm:text-sm text-stone-200 mb-8">
          <li className="flex items-center gap-3">
            <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
            <span>Dominio dedicato o sottodominio personalizzato (es. <i>menu.tuoristorante.it</i>)</span>
          </li>
          <li className="flex items-center gap-3">
            <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
            <span>Storytelling degli ingredienti, frollature e provenienza a km 0</span>
          </li>
          <li className="flex items-center gap-3">
            <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
            <span>Abbinamenti vino guidati calice/bottiglia consigliati per ogni piatto</span>
          </li>
          <li className="flex items-center gap-3">
            <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
            <span>Maître Virtuale AI (Nexus) per allergeni, celiachia e prenotazioni</span>
          </li>
          <li className="flex items-center gap-3">
            <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
            <span>Grafica vettoriale QR Code ad alta risoluzione pronta per la stampa</span>
          </li>
        </ul>

        {/* ─── ADD-ON OPZIONALE: COLONNA SONORA FF EDIZIONI & FAUSTO FUSETTI ─── */}
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-[#0e1017] border border-amber-500/30 hover:border-amber-500/60 transition-all">
          <label className="flex items-start gap-3.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeMusic}
              onChange={(e) => setIncludeMusic(e.target.checked)}
              className="mt-1 w-5 h-5 accent-amber-500 rounded cursor-pointer shrink-0"
            />
            <div className="flex-1 text-left">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <Music2 size={16} className="text-amber-400" />
                  Add-on: Colonna Sonora d&apos;Autore Inedita
                </span>
                <span className="text-xs font-black text-amber-400 font-mono shrink-0">
                  +€ {musicPrice}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-stone-400 mt-1 leading-relaxed">
                Composizione musicale originale ed esclusiva prodotta e registrata in SIAE con il <strong>Maestro Fausto Fusetti (FF Edizioni)</strong>. Un&apos;identità sonora memorabile che accoglie i commensali sul menu.
              </p>
            </div>
          </label>
        </div>

        {/* Pulsante Checkout con Totale Reale */}
        <button
          onClick={handleUnlock}
          disabled={loading}
          className="w-full py-5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-black font-black rounded-2xl transition-all shadow-xl shadow-amber-500/25 uppercase tracking-wider text-sm cursor-pointer disabled:opacity-50"
        >
          {loading 
            ? "Apertura Checkout Sicuro..." 
            : `Sblocca il tuo Locale Ora (€${totalPrice}) 🚀`}
        </button>
      </div>
    </section>
  );
}
