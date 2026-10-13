import React from "react";
import { Wine, Sparkles, Video, Bot, Compass, CheckCircle } from "lucide-react";

export default function ExperienceFeatures() {
  const points = [
    {
      icon: <Wine size={26} className="text-amber-400" />,
      title: "1. Sommelier AI & Spinta alla Cantina",
      desc: "Accanto a ogni portata, Experience consiglia la bottiglia o il calice ideale della tua cantina con note di degustazione. I clienti ordinano etichette prestigiose con totale naturalezza."
    },
    {
      icon: <Sparkles size={26} className="text-orange-400" />,
      title: "2. Storytelling della Filiera e Km 0",
      desc: "Racconta l'origine dei tagli nobili, la provenienza del pescato locale o la storia secolare della tua tenuta. Quando il cliente comprende il pregio della materia prima, spende volentieri per i piatti speciali."
    },
    {
      icon: <Video size={26} className="text-amber-400" />,
      title: "3. Vibe Video & Atmosfera Esclusiva",
      desc: "Coinvolgi i commensali con video verticali cinematografici della sala, del fuoco in cucina o dei vigneti al tramonto, proiettando l'ospite nella filosofia del locale."
    },
    {
      icon: <Bot size={26} className="text-orange-400" />,
      title: "4. Maître Virtuale & Accoglienza Dedicata",
      desc: "Un assistente d'accoglienza al tavolo (Nexus) che dialoga con garbo, illustra i percorsi degustazione, spiega le preparazioni e rassicura con precisione medica su celiachia ed intolleranze."
    },
    {
      icon: <Compass size={26} className="text-amber-400" />,
      title: "5. Guida GPS & Esperienza Pre-Arrivo",
      desc: "Il portale calcola in automatico distanza e tempo di percorrenza stradale per raggiungere la tenuta, trasformando il menu in un punto di riferimento per chi pianifica la visita."
    },
    {
      icon: <CheckCircle size={26} className="text-emerald-400" />,
      title: "6. Modifiche Istantanee della Carta",
      desc: "Un'annata in cantina si è esaurita? Vuoi inserire il pescato del giorno o modificare una voce del percorso degustazione? Aggiorni i dati in 10 secondi senza ristampare nulla."
    }
  ];

  return (
    <section id="features" className="py-24 px-6 border-t border-white/10 bg-[#07080c] relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">
            L&apos;Arte dell&apos;Accoglienza Digitale
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Perché la ristorazione d&apos;eccellenza sceglie <span className="text-amber-400">Experience</span>
          </h2>
          <p className="mt-4 text-stone-400 max-w-2xl mx-auto text-base">
            Valorizza la tua cantina, racconta la passione dietro ogni piatto e trasforma una semplice cena in un ricordo indimenticabile.
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
