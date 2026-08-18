import React from "react";
import { Sparkles, Wine, Video, Bot, TrendingUp, QrCode } from "lucide-react";

export default function ExperienceFeatures() {
  const cards = [
    {
      icon: <Sparkles size={24} className="text-amber-400" />,
      title: "Menu Sensoriale con Storytelling",
      desc: "Ogni piatto racconta la provenienza delle materie prime, la passione dello chef e le occasioni ideali di degustazione, aumentando lo scontrino medio fino al 35%."
    },
    {
      icon: <Wine size={24} className="text-orange-400" />,
      title: "Abbinamento Vini Automatico",
      desc: "Suggerisce all'istante il calice o la bottiglia perfetta per ciascuna portata, valorizzando la cantina del locale senza richiedere personale di sala esperto."
    },
    {
      icon: <Video size={24} className="text-amber-400" />,
      title: "Vibe Grid & Video Atmosfera",
      desc: "Griglia video in stile TikTok/Reel per mostrare la preparazione dei piatti in cucina, il cocktail bar e l'energia delle serate del locale."
    },
    {
      icon: <Bot size={24} className="text-orange-400" />,
      title: "Nexus AI: Sommelier & Cameriere",
      desc: "Un assistente AI discreto a disposizione dell'ospite al tavolo: risponde a dubbi su allergeni, consiglia portate e accetta prenotazioni speciali."
    },
    {
      icon: <QrCode size={24} className="text-amber-400" />,
      title: "QR Code da Tavolo Dinamico",
      desc: "Nessuna applicazione da scaricare. Il cliente inquadra la cornicetta sul tavolo e naviga in meno di un secondo da qualsiasi smartphone (iOS e Android)."
    },
    {
      icon: <TrendingUp size={24} className="text-orange-400" />,
      title: "Dominio Dedicato & Zero Canoni",
      desc: "Nessuna commissione sulle ordinazioni né canoni mensili vincolanti. Sblocchi il portale una sola volta con il tuo dominio personalizzato per sempre."
    }
  ];

  return (
    <section id="features" className="py-24 px-6 border-t border-white/10 bg-[#07080c]/80 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">
            Ingegneria Horeca
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            I Superpoteri del tuo <span className="text-amber-400">Smart Menu</span>
          </h2>
          <p className="mt-4 text-stone-400 max-w-2xl mx-auto text-base">
            Progettato per trasformare una semplice lista di prezzi in uno strumento di vendita attiva al tavolo.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((c, i) => (
            <div key={i} className="bg-[#0b0c10]/90 border border-white/10 p-8 rounded-3xl hover:border-amber-500/40 transition-all group shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {c.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{c.title}</h3>
              <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
