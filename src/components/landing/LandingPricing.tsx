"use client";

import React, { useState, useEffect } from "react";
import { Check, Sparkles, Flame, Crown, Music, ShieldCheck, Tag } from "lucide-react";
import { avviaCheckoutTierExperience, getLiveTiersExperience, ExperienceTierPrices } from "@/lib/stripe";

export default function LandingPricing() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [tiers, setTiers] = useState<ExperienceTierPrices>({
    starter: 190,
    pro: 350,
    royal: 600,
    musicAddon: 300
  });

  // Scarica in tempo reale i prezzi da Supabase S2 e verifica se sei SuperAdmin
  useEffect(() => {
    getLiveTiersExperience().then((res) => {
      if (res) {
        setTiers({
          starter: res.starter || 190,
          pro: res.pro || 350,
          royal: res.royal || 600,
          musicAddon: res.musicAddon || 300
        });
      }
    });

    if (typeof window !== "undefined") {
      const adminActive =
        localStorage.getItem("locanda_unlocked") === "true" ||
        localStorage.getItem("rm_superadmin") === "true" ||
        window.location.search.includes("admin=true") ||
        window.location.search.includes("pin=RM2026!");
      setIsSuperAdmin(adminActive);
    }
  }, []);

  const handleCheckout = async (planId: 'starter' | 'pro' | 'royal') => {
    // 👑 BYPASS SUPERADMIN RICCARDO MODENA: se sei admin, niente Stripe!
    if (isSuperAdmin) {
      alert("👑 Modalità SuperAdmin Attiva (Riccardo Modena).\nPer creare e gestire le Experience senza costi, accedi direttamente dal tuo Command Center Portale!");
      window.open("https://portale.rmstudio.app", "_blank");
      return;
    }

    setLoadingPlan(planId);
    await avviaCheckoutTierExperience(planId, "nuovo_locale", "Nuovo Locale", undefined, tiers[planId]);
    setLoadingPlan(null);
  };

  return (
    <section id="pricing" className="py-24 px-6 relative z-10 max-w-6xl mx-auto text-left">
      
      {/* Intestazione Neuromarketing */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest mb-4 shadow-sm">
          <Sparkles size={14} /> Zero Canoni Mensili • Investimento Una Tantum
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          Investi sull&apos;Arte dell&apos;Esperienza, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200">
            non sulle percentuali d&apos;asporto.
          </span>
        </h2>
        <p className="text-stone-400 mt-4 max-w-2xl mx-auto text-base">
          Zero abbonamenti ricorrenti, zero commissioni sulle comande. Sblocchi il portale del tuo ristorante una sola volta ed è tuo a vita.
        </p>

        {isSuperAdmin && (
          <div className="mt-4 inline-block bg-amber-500/10 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold px-3 py-1 rounded-full">
            👑 SuperAdmin Attivo: bypass Stripe abilitato
          </div>
        )}
      </div>

      {/* ─── GRIGLIA A 3 LIVELLI (NEUROMARKETING COMPROMISE EFFECT) ─── */}
      <div className="grid lg:grid-cols-3 gap-8 items-stretch pt-4">
        
        {/* TIER 1: ANCORA MINIMA (Carta Digitale Smart - €190) */}
        <div className="bg-[#0b0d14]/90 border border-white/10 rounded-3xl p-7 flex flex-col justify-between hover:border-white/20 transition-all shadow-xl">
          <div>
            <div className="text-xs font-extrabold text-stone-400 uppercase tracking-widest mb-2 font-mono">
              Base • Iniziale
            </div>
            <h3 className="text-xl font-bold font-serif text-white">Carta Digitale</h3>
            <p className="text-xs text-stone-400 mt-2 leading-relaxed font-light">
              Per locali che vogliono sostituire il foglio cartaceo con una carta mobile rapida ed elegante.
            </p>

            <div className="mt-6 pb-6 border-b border-white/10">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white inline-block py-1 leading-[1.1]">€ {tiers.starter}</span>
                <span className="text-xs text-stone-400 font-bold uppercase font-mono">una tantum</span>
              </div>
              <span className="text-[11px] text-stone-400 block mt-1.5 font-medium">Nessun costo mensile</span>
            </div>

            <ul className="space-y-3 pt-6 text-xs text-stone-300">
              <li className="flex items-center gap-2.5">
                <Check size={15} className="text-amber-400 shrink-0" />
                <span>Smart Menu mobile consultabile via QR Code</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check size={15} className="text-amber-400 shrink-0" />
                <span>Foto piatti in alta definizione &amp; allergeni base</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check size={15} className="text-amber-400 shrink-0" />
                <span>Sottodominio dedicato (es. <i>menu.tuolocale.it</i>)</span>
              </li>
              <li className="flex items-center gap-2.5 text-stone-400">
                <span className="text-stone-400 text-sm">✕</span>
                <span className="line-through">Nessun Sommelier AI &amp; Abbinamenti Vino</span>
              </li>
              <li className="flex items-center gap-2.5 text-stone-400">
                <span className="text-stone-400 text-sm">✕</span>
                <span className="line-through">Nessun Storytelling filiera e materie prime</span>
              </li>
              <li className="flex items-center gap-2.5 text-stone-400">
                <span className="text-stone-400 text-sm">✕</span>
                <span className="line-through">Nessun Maître Virtuale Nexus H24</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleCheckout('starter')}
            disabled={loadingPlan !== null}
            className="w-full mt-8 py-4 bg-stone-900 hover:bg-stone-800 border border-white/20 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
          >
            {loadingPlan === 'starter' ? 'Caricamento...' : `Attiva Base (€${tiers.starter})`}
          </button>
        </div>

        {/* TIER 2: IL CENTRO IRRESISTIBILE (SWEET SPOT - €350) */}
        <div className="relative rounded-3xl p-[2px] bg-gradient-to-b from-amber-400 via-orange-500 to-amber-600 shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col justify-between transform lg:-translate-y-4">
          
          {/* Badge Superiore */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-950 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1.5 whitespace-nowrap">
            <Flame size={13} className="fill-slate-950" /> SCELTO DALL&apos;84% DELLE STRUTTURE
          </div>

          <div className="bg-[#0a0c14] rounded-[22px] p-7 sm:p-8 h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black text-amber-400 uppercase tracking-widest font-mono">
                  ★ Esperienza Completa
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                  Miglior Valore
                </span>
              </div>
              
              <h3 className="text-2xl font-black font-serif text-white">Signature Experience</h3>
              <p className="text-xs text-stone-300 mt-2 leading-relaxed font-light">
                Il pacchetto sensoriale definitivo: fa percepire il valore dei piatti ed incentiva le etichette prestigiose della tua cantina.
              </p>

              <div className="mt-6 pb-6 border-b border-amber-500/20">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 font-serif inline-block py-1.5 leading-[1.15]">
                    € {tiers.pro}
                  </span>
                  <span className="text-xs text-stone-400 font-bold uppercase font-mono">una tantum</span>
                </div>
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 mt-2.5">
                  <ShieldCheck size={14} className="shrink-0" /> Si ripaga nei primi 3 weekend di servizio
                </span>
              </div>

              <ul className="space-y-3.5 pt-6 text-xs sm:text-sm text-stone-200">
                <li className="flex items-center gap-2.5 font-semibold text-white">
                  <Check size={16} className="text-amber-400 shrink-0" />
                  <span><strong>Sommelier AI &amp; Wine Pairing:</strong> consiglia bottiglia e calice per ogni portata</span>
                </li>
                <li className="flex items-center gap-2.5 font-semibold text-white">
                  <Check size={16} className="text-amber-400 shrink-0" />
                  <span><strong>Storytelling Materie Prime:</strong> origine km 0, frollature ed allevamenti</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-amber-400 shrink-0" />
                  <span><strong>Maître Virtuale Nexus H24:</strong> risponde su allergeni, celiachia ed accoglienza</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-amber-400 shrink-0" />
                  <span><strong>Vibe Video dell&apos;Atmosfera:</strong> micro-video emozionali della sala e dei vigneti</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-amber-400 shrink-0" />
                  <span><strong>Guida GPS Interattiva:</strong> calcolo tempi e distanza stradale per i visitatori</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-amber-400 shrink-0" />
                  <span>Grafica vettoriale QR Code ad alta risoluzione per i tavoli</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleCheckout('pro')}
              disabled={loadingPlan !== null}
              className="w-full mt-8 py-5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:scale-[1.02] text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl transition shadow-xl shadow-amber-500/30 cursor-pointer"
            >
              {loadingPlan === 'pro' ? 'Apertura Checkout...' : `Attiva Signature Experience (€${tiers.pro}) ➔`}
            </button>
          </div>
        </div>

        {/* TIER 3: ROYAL & SOUND IDENTITY (€600 - CON SCONTO BUNDLE €50) */}
        <div className="bg-[#0b0d14]/90 border border-amber-500/30 rounded-3xl p-7 flex flex-col justify-between hover:border-amber-500/60 transition-all shadow-xl relative">
          
          {/* Badge Risparmio Bundle */}
          <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-[10px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md flex items-center gap-1">
            <Tag size={12} className="fill-slate-950" /> SCONTO BUNDLE € 50
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-extrabold text-amber-400 uppercase tracking-widest font-mono flex items-center gap-1">
                <Crown size={14} /> Tenute &amp; Resort
              </span>
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                Musica SIAE
              </span>
            </div>

            <h3 className="text-xl font-bold font-serif text-white">Royal &amp; Sound Identity</h3>
            <p className="text-xs text-stone-400 mt-2 leading-relaxed font-light">
              Per cantine, resort e ristoranti d&apos;autore che desiderano un&apos;identità sonora memorabile con brano originale SIAE.
            </p>

            <div className="mt-6 pb-6 border-b border-white/10">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-white inline-block py-1 leading-[1.1]">€ {tiers.royal}</span>
                <span className="text-xs text-stone-500 line-through font-mono">€ {tiers.pro + tiers.musicAddon}</span>
                <span className="text-xs text-stone-400 font-bold uppercase font-mono">una tantum</span>
              </div>
              <span className="text-xs text-amber-400 font-semibold block mt-1.5 flex items-center gap-1">
                <Music size={13} /> Include Brano d&apos;Autore SIAE (Valore € {tiers.musicAddon})
              </span>
            </div>

            <ul className="space-y-3 pt-6 text-xs text-stone-300">
              <li className="flex items-center gap-2.5 font-bold text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                <Music size={16} className="text-amber-400 shrink-0" />
                <span><strong>Brano Inedito SIAE (€ {tiers.musicAddon}):</strong> composto dal Maestro Fausto Fusetti (FF Edizioni) a soli € 250 nel bundle</span>
              </li>
              <li className="flex items-center gap-2.5 font-bold text-white">
                <Check size={15} className="text-amber-400 shrink-0" />
                <span>Tutte le funzionalità di Signature Experience</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check size={15} className="text-amber-400 shrink-0" />
                <span>Player musicale d&apos;atmosfera integrato nel menu</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check size={15} className="text-amber-400 shrink-0" />
                <span>Storytelling completo della cantina e riserve storiche</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check size={15} className="text-amber-400 shrink-0" />
                <span>Supporto VIP prioritario per modifiche del menu stagionale</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleCheckout('royal')}
            disabled={loadingPlan !== null}
            className="w-full mt-8 py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-lg shadow-amber-900/30"
          >
            {loadingPlan === 'royal' ? 'Caricamento...' : `Attiva Royal Experience (€${tiers.royal})`}
          </button>
        </div>

      </div>
    </section>
  );
}
