import React from "react";
import { Wine, Video, Bot, Smartphone, CheckCircle, Flame } from "lucide-react";

export default function ExperienceFeatures() {
  const points = [
    {
      icon: <Wine size={26} className="text-amber-400" />,
      title: "1. Vendi più Vino (Abbinamento Automatico)",
      desc: "Accanto a ogni primo o secondo piatto, il menu consiglia il calice o la bottiglia ideale della tua cantina. Il cliente ordina il vino senza dover chiedere al cameriere."
    },
    {
      icon: <Flame size={26} className="text-orange-400" />,
      title: "2. Storytelling degli Ingredienti",
      desc: "Spiega da dove arriva la carne, come viene fatto l'impasto della pizza o il perché di una ricetta tipica. Quando il cliente capisce la qualità, spende volentieri di più."
    },
    {
      icon: <Video size={26} className="text-amber-400" />,
      title: "3. Video Brevi dei Piatti in Cottura",
      desc: "Mostra brevi video verticali dei piatti mentre vengono preparati in cucina o dell'atmosfera del locale. La vista del cibo attiva i neuroni specchio e stimola gli ordini."
    },
    {
      icon: <Bot size={26} className="text-orange-400" />,
      title: "4. Il Cameriere AI per gli Allergeni",
      desc: "Un assistente virtuale al tavolo risponde subito a dubbi come 'Questo piatto contiene lattosio?' o 'Quali opzioni avete per celiaci?', evitando errori in sala."
    },
    {
      icon: <Smartphone size={26} className="text-amber-400" />,
      title: "5. Zero App da Scaricare",
      desc: "Si apre in 1 secondo inquadrando il QR Code con la fotocamera di qualsiasi smartphone (iPhone e Android). Funziona anche con linea internet debole."
    },
    {
      icon: <CheckCircle size={26} className="text-emerald-400" />,
      title: "6. Modifiche in Tempo Reale",
      desc: "Un piatto è terminato per la serata? Vuoi cambiare i prezzi o inserire il piatto del giorno? Modifichi i dati dal pannello e tutti i tavoli si aggiornano all'istante."
    }
  ];

  return (
    <section id="features" className="py-24 px-6 border-t border-white/10 bg-[#07080c] relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">
            I Vantaggi per il tuo Locale
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Perché i ristoranti guadagnano di più con <span className="text-amber-400">Experience</span>
          </h2>
          <p className="mt-4 text-stone-400 max-w-2xl mx-auto text-base">
            Meno tempo sprecato a spiegare i piatti, zero ristampe cartacee e uno scontrino medio sensibilmente più alto.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {points.map((p, idx) => (
            <div key={idx} className="bg-[#0b0c10] border border-white/10 p-8 rounded-3xl hover:border-amber-500/40 transition-all shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
                {p.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2.5">{p.title}</h3>
              <p className="text-sm text-stone-400 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
