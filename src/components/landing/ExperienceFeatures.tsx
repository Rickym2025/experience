import React from "react";
import { Wine, Sparkles, Video, Bot, Compass, CheckCircle } from "lucide-react";

export default function ExperienceFeatures() {
  const points = [
    {
      icon: <Wine size={26} className="text-amber-400" />,
      tag: "CANTINA & ETICHETTE",
      title: "Sommelier AI & Spinta alla Cantina",
      desc: "Accanto a ogni portata, Experience consiglia la bottiglia o il calice ideale con note sensoriali. Il commensale ordina vini prestigiosi senza esitazioni, aumentando il margine di sala."
    },
    {
      icon: <Sparkles size={26} className="text-orange-400" />,
      tag: "FILIERA & KM 0",
      title: "Storytelling Autentico delle Materie Prime",
      desc: "Svela l'origine dei tagli frollati a secco, la provenienza del pescato locale e i produttori della tua terra. Chi comprende la cura dietro il piatto non percepisce più il prezzo come un ostacolo."
    },
    {
      icon: <Video size={26} className="text-amber-400" />,
      tag: "NEUROMARKETING VISIVO",
      title: "Vibe Video & Atmosfera Esclusiva",
      desc: "Coinvolgi i sensi con micro-video verticali a 60 FPS che mostrano il fuoco della brace, l'impiattamento dello chef o i vigneti al tramonto, stimolando i neuroni specchio dell'appetito."
    },
    {
      icon: <Bot size={26} className="text-orange-400" />,
      tag: "ACCOGLIENZA DEDICATA",
      title: "Maître Virtuale & Dialogo al Tavolo",
      desc: "Un assistente d'accoglienza (Nexus) che dialoga con garbo ed empatia, illustra i percorsi degustazione e risponde con rigore medico a dubbi su celiachia, intolleranze e allergeni."
    },
    {
      icon: <Compass size={26} className="text-amber-400" />,
      tag: "PRE-ARRIVO & SMART GPS",
      title: "Guida Stradale & Navigazione GPS",
      desc: "Il portale calcola in automatico distanza e tempi di guida per raggiungere la tenuta o il ristorante, trasformando il menu in un punto di riferimento per chi pianifica la visita."
    },
    {
      icon: <CheckCircle size={26} className="text-emerald-400" />,
      tag: "ZERO RISTAMPE",
      title: "Controllo Istantaneo della Carta",
      desc: "Un'annata in cantina si è esaurita? Vuoi inserire il piatto fuori menu del giorno? Modifichi i dati dal pannello in 10 secondi e tutti i tavoli si sincronizzano senza ristampare un solo foglio."
    }
  ];

  return (
    <section id="features" className="py-28 px-6 border-t border-amber-500/20 bg-[#05060a] relative z-10 overflow-hidden">
      
      {/* Bagliori Laser d'Atmosfera in Sottofondo */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[300px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Intestazione */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest mb-4">
            L&apos;Arte dell&apos;Accoglienza Sensoriale
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Perché la ristorazione d&apos;eccellenza sceglie <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200">
              Experience Engine
            </span>
          </h2>
          <p className="mt-4 text-stone-400 max-w-2xl mx-auto text-base">
            Dalla terra al calice: dai voce al prestigio della tua cucina ed eleva il valore percepito di ogni degustazione.
          </p>
        </div>

        {/* ─── GRIGLIA CARDS CON EFFETTO LASER BORDER & AMBIENT GLOW ─── */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {points.map((p, idx) => (
            <div 
              key={idx} 
              className="group relative rounded-3xl p-[1px] bg-gradient-to-b from-amber-500/30 via-white/5 to-white/5 hover:from-amber-400 hover:via-orange-500/50 hover:to-amber-500 transition-all duration-500 shadow-[0_4px_25px_rgba(0,0,0,0.7)] hover:shadow-[0_0_35px_rgba(245,158,11,0.25)]"
            >
              {/* Fascio Laser di Luce in Testa (Attivo su Hover) */}
              <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-amber-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Corpo Interno della Scheda */}
              <div className="h-full bg-gradient-to-b from-[#0c0e17] to-[#07080e] p-8 rounded-[23px] flex flex-col justify-between relative overflow-hidden">
                
                {/* Alone Glow Interno */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/15 transition-all duration-500 pointer-events-none" />

                <div>
                  {/* Icona con Cornice Dorata Glow */}
                  <div className="w-14 h-14 rounded-2xl bg-[#121522] border border-amber-500/30 group-hover:border-amber-400 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/10 group-hover:scale-110 transition-transform duration-300">
                    {p.icon}
                  </div>

                  {/* Micro Tag Tecnico */}
                  <span className="text-[10px] font-extrabold text-amber-400 tracking-wider uppercase font-mono block mb-2">
                    {p.tag}
                  </span>

                  {/* Titolo */}
                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-amber-200 transition-colors">
                    {p.title}
                  </h3>

                  {/* Descrizione */}
                  <p className="text-sm text-stone-300/80 leading-relaxed">
                    {p.desc}
                  </p>
                </div>

                {/* Dettaglio di Finitura sul Fondo */}
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-stone-400 font-mono">
                  <span>EXP-0{idx + 1}</span>
                  <span className="text-amber-500/80 group-hover:text-amber-400 transition-colors">● Attivo</span>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
