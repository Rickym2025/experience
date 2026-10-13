import React from "react";
import { Sparkles, Wine, Utensils, Compass } from "lucide-react";

export default function LandingHero() {
  return (
    <header className="max-w-6xl mx-auto px-6 pt-36 pb-20 text-center relative z-10">
      
      {/* Badge Visivo di Posizionamento Alto */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest mb-6">
        <Sparkles size={14} /> Storytelling Gastronomico &amp; AI Sommelier per la Ristorazione d&apos;Autore
      </div>

      {/* Titolo Principale Focalizzato sul Valore del Piatto */}
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] max-w-4xl mx-auto mb-6">
        Non servire solo un piatto.<br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200">
          Racconta la terra, la cantina e la tua maestria.
        </span>
      </h1>

      <p className="text-base sm:text-lg md:text-xl text-stone-300 max-w-3xl mx-auto leading-relaxed mb-10 font-normal">
        Experience trasforma la tua carta in una narrazione sensoriale interattiva: svela l&apos;origine delle materie prime a km 0, consiglia l&apos;abbinamento vino ideale calice per calice ed integra un <strong>Maître Virtuale AI</strong> dedicato al tavolo per accogliere i commensali con l&apos;eleganza che il tuo locale merita.
      </p>

      {/* Pulsanti CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
        <a 
          href="#pricing" 
          className="w-full sm:w-auto px-9 py-5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-black rounded-2xl transition-all shadow-xl shadow-amber-500/25 uppercase tracking-wider text-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <Utensils size={18} /> Attiva il Portale del Tuo Locale ➔
        </a>
        <a 
          href="#features" 
          className="w-full sm:w-auto px-8 py-5 bg-stone-900/80 hover:bg-stone-800 text-white font-bold rounded-2xl border border-white/10 transition text-sm flex items-center justify-center gap-2"
        >
          <Compass size={16} /> Scopri l&apos;Esperienza
        </a>
      </div>

      {/* Confronto Visivo: Carta Muta vs Narrazione Sensoriale */}
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left mt-8">
        
        {/* Card Vecchio Metodo */}
        <div className="bg-red-950/20 border border-red-500/20 p-6 rounded-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-red-400 block mb-2">✕ La Carta Muta Tradizionale</span>
          <p className="text-sm text-stone-300 mb-4">Un semplice elenco di nomi e prezzi. Il cliente non conosce la frollatura, non coglie il pregio della materia prima, ordina l&apos;acqua e salta la carta dei vini.</p>
          <div className="bg-black/60 p-3.5 rounded-xl border border-red-500/10 text-xs font-mono text-stone-400">
            "Tagliata di Fassona ................ 26,00 €"
          </div>
        </div>

        {/* Card Experience Engine */}
        <div className="bg-emerald-950/20 border-2 border-amber-500/40 p-6 rounded-3xl shadow-xl shadow-amber-500/10">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block mb-2">✓ L&apos;Esperienza Sensoriale Experience</span>
          <p className="text-sm text-stone-200 mb-4">Origine dell&apos;allevamento, 45 giorni di frollatura a secco e il vino della cantina consigliato calice per calice. Il valore del piatto viene compreso all&apos;istante.</p>
          <div className="bg-black/80 p-3.5 rounded-xl border border-amber-500/30 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-white block">Tagliata di Fassona Dry-Aged con Sale di Cervia</span>
              <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1 mt-0.5">
                <Wine size={12} /> Abbinamento Sommelier: Valpolicella Ripasso DOC (+7€)
              </span>
            </div>
            <span className="font-black text-white text-base">€ 26,00</span>
          </div>
        </div>

      </div>
    </header>
  );
}
