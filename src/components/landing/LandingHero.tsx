import React from "react";
import { Sparkles, Utensils, Play, Wine } from "lucide-react";

export default function LandingHero() {
  return (
    <header className="max-w-6xl mx-auto px-6 pt-36 pb-20 text-center relative z-10">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest mb-6">
        <Sparkles size={14} className="text-amber-400" />
        La Nuova Era della Ristorazione Esperienziale
      </div>

      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] max-w-4xl mx-auto mb-6 font-display">
        Basta PDF statici da zoomare.<br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200" style={{ textShadow: "0 0 35px rgba(251,191,36,0.35)" }}>
          Fai vivere il tuo Menu.
        </span>
      </h1>

      <p className="text-base sm:text-lg md:text-xl text-stone-300 max-w-2xl mx-auto leading-relaxed mb-10 font-light">
        Il primo Smart Menu interattivo con storytelling emozionale dei piatti, abbinamenti vino guidati, video dell&apos;atmosfera del locale e sommelier virtuale AI integrato.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
        <a 
          href="#features" 
          className="w-full sm:w-auto px-9 py-5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-black font-black rounded-2xl transition-all shadow-xl shadow-amber-500/25 uppercase tracking-wider text-sm flex items-center justify-center gap-2"
        >
          <Utensils size={18} /> Scopri i Moduli
        </a>
        <a 
          href="#pricing" 
          className="w-full sm:w-auto px-8 py-5 bg-stone-900/80 hover:bg-stone-800 text-white font-bold rounded-2xl border border-white/10 transition text-sm flex items-center justify-center gap-2"
        >
          <Play size={16} fill="currentColor" /> Sblocca Locale (€390)
        </a>
      </div>

      {/* Mockup Preview Interattiva */}
      <div className="relative max-w-3xl mx-auto rounded-3xl p-1 bg-gradient-to-b from-amber-500/30 to-transparent shadow-2xl">
        <div className="bg-[#0b0c10]/95 backdrop-blur-2xl rounded-[1.4rem] p-6 border border-white/10 text-left grid sm:grid-cols-3 gap-4 items-center">
          <div className="sm:col-span-2 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Wine size={14} /> Storytelling & Pairing
            </div>
            <h4 className="text-white font-bold text-lg">Tagliolini al Tartufo Bianco & Calice Nebbiolo</h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              Pasta fresca tirata a mano con burro di malga d&apos;alpeggio e lamelle di tartufo fresco. Accompagnato dal calice consigliato dall&apos;AI.
            </p>
          </div>
          <div className="text-right sm:border-l sm:border-white/10 sm:pl-4">
            <span className="text-2xl font-black text-amber-400">€ 24,00</span>
            <span className="block text-[10px] text-stone-500 uppercase mt-1 font-semibold">Abbinamento suggerito</span>
          </div>
        </div>
      </div>
    </header>
  );
}
