import React from "react";
import { Sparkles, Wine, Utensils, QrCode } from "lucide-react";

export default function LandingHero() {
  return (
    <header className="max-w-6xl mx-auto px-6 pt-36 pb-20 text-center relative z-10">
      
      {/* Badge Visivo */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest mb-6">
        <Sparkles size={14} /> La Nuova Generazione di Menu da Tavolo
      </div>

      {/* Titolo Principale ad Alto Impatto */}
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] max-w-4xl mx-auto mb-6">
        Basta PDF illeggibili da zoomare.<br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200">
          Il tuo Menu diventa uno strumento di vendita.
        </span>
      </h1>

      <p className="text-base sm:text-lg md:text-xl text-stone-300 max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
        I clienti inquadrano il QR Code con lo smartphone e vedono le foto reali dei piatti, la storia delle materie prime, il vino perfetto consigliato per ogni portata e un assistente AI che risponde a ogni dubbio sugli allergeni.
      </p>

      {/* Pulsanti CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
        <a 
          href="#pricing" 
          className="w-full sm:w-auto px-9 py-5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-black rounded-2xl transition-all shadow-xl shadow-amber-500/25 uppercase tracking-wider text-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <Utensils size={18} /> Sblocca il tuo Locale (€390)
        </a>
        <a 
          href="#features" 
          className="w-full sm:w-auto px-8 py-5 bg-stone-900/80 hover:bg-stone-800 text-white font-bold rounded-2xl border border-white/10 transition text-sm flex items-center justify-center gap-2"
        >
          <QrCode size={16} /> Come Funziona al Tavolo
        </a>
      </div>

      {/* Confronto Visivo: Menu Tradizionale vs Experience Engine */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left mt-8">
        
        {/* Card Vecchio Menu */}
        <div className="bg-red-950/20 border border-red-500/20 p-6 rounded-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-red-400 block mb-2">✕ Il Menu PDF Tradizionale</span>
          <p className="text-sm text-stone-300 mb-4">Foglio minuscolo da scaricare e ingrandire con due dita. Nessuna foto, niente abbinamenti, il cliente non sa cosa scegliere e ordina il piatto più economico.</p>
          <div className="bg-black/60 p-3.5 rounded-xl border border-red-500/10 text-xs font-mono text-stone-400">
            "Tagliata di Manzo ................ 22,00 €"
          </div>
        </div>

        {/* Card Nuovo Menu Experience */}
        <div className="bg-emerald-950/20 border-2 border-amber-500/40 p-6 rounded-3xl shadow-xl shadow-amber-500/10">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-2">✓ Con Experience Engine</span>
          <p className="text-sm text-stone-200 mb-4">Foto ad alta definizione, storia della carne frollata 45 giorni e calice di vino consigliato a 6€. Lo scontrino medio sale all&apos;istante.</p>
          <div className="bg-black/80 p-3.5 rounded-xl border border-amber-500/30 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-white block">Tagliata Frollata con Rosmarino</span>
              <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1 mt-0.5"><Wine size={12} /> Consigliato con: Chianti Classico (+6€)</span>
            </div>
            <span className="font-black text-white text-base">€ 22,00</span>
          </div>
        </div>

      </div>
    </header>
  );
}
