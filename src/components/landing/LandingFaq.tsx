"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQS = [
  {
    q: "Come visualizzano il menu i clienti del mio ristorante?",
    a: "Il cliente inquadra il QR Code sul tavolo con la normale fotocamera del suo smartphone. Il menu si apre istantaneamente nel browser, veloce come un sito web, senza costringerlo a scaricare nessuna applicazione."
  },
  {
    q: "Cosa succede se finisce un ingrediente o voglio cambiare un prezzo?",
    a: "Hai un pannello di controllo semplicissimo: puoi nascondere un piatto esaurito o aggiornare i prezzi del giorno in 10 secondi. Tutti i tavoli vedranno all'istante il menu aggiornato."
  },
  {
    q: "Come fa il menu ad aumentare gli ordini di vino?",
    a: "Per ogni piatto puoi impostare un vino abbinato (es. 'Consigliato con calice di Nebbiolo 6€'). Il cliente lo vede direttamente sotto il piatto e lo ordina spontaneamente."
  },
  {
    q: "Come risponde l'assistente AI agli ospiti con allergie o intolleranze?",
    a: "L'assistente virtuale legge la lista degli ingredienti e degli allergeni inseriti nel database: se un cliente chiede 'Quali piatti sono senza glutine?', l'AI mostra solo le portate sicure."
  },
  {
    q: "Cosa ricevo dopo aver pagato i 390€?",
    a: "Attiviamo il tuo sito definitivo, colleghiamo il tuo dominio personalizzato (es: menu.nomeosteria.it), impostiamo il certificato di sicurezza SSL e ti inviamo i file grafici del QR Code da stampare per i tavoli."
  },
  {
    q: "Ci sono canoni mensili nascosti da pagare ogni mese?",
    a: "No, a differenza della concorrenza che richiede abbonamenti mensili di 30-50€, Experience si paga una sola volta per la licenza e l'attivazione iniziale."
  },
  {
    q: "Posso inserire anche il link per prenotare i tavoli o le recensioni Google?",
    a: "Sì, in cima alla pagina del tuo menu ci sono i pulsanti diretti per prenotare il tavolo (tramite il tuo link o WhatsApp) e per lasciare una recensione a 5 stelle su Google Maps."
  },
  {
    q: "Come funzionano i video dell'atmosfera nel menu?",
    a: "Puoi caricare brevi video verticali (stile Instagram) che mostrano la carne sulla brace, la pizza in forno o la sala del locale, dando subito un senso di qualità e calore."
  }
];

export default function LandingFaq() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 px-6 border-t border-white/10 bg-[#050508] relative z-10 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest mb-3">
          <HelpCircle size={14} /> Domande Frequenti
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          Tutto quello che c&apos;è da sapere
        </h2>
      </div>

      <div className="space-y-4">
        {FAQS.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={idx} className="bg-[#0b0c10] border border-white/10 rounded-2xl overflow-hidden transition-all hover:border-amber-500/30">
              <button
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full p-6 text-left flex justify-between items-center gap-4 cursor-pointer"
              >
                <span className="font-bold text-white text-sm sm:text-base">{faq.q}</span>
                <ChevronDown className={`text-amber-400 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} size={18} />
              </button>
              {isOpen && (
                <div className="px-6 pb-6 text-stone-400 text-xs sm:text-sm leading-relaxed border-t border-white/5 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
