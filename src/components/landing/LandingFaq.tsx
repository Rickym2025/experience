"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQS = [
  {
    q: "Come visualizzano il menu i clienti del ristorante?",
    a: "Il cliente inquadra il QR Code sul tavolo con la fotocamera del proprio smartphone. Il menu si apre istantaneamente nel browser senza richiedere l'installazione di alcuna applicazione."
  },
  {
    q: "Come modifico piatti, prezzi e disponibilità?",
    a: "Attraverso il pannello gestionale puoi aggiornare piatti, prezzi del giorno, allergeni e abbinamenti vino in tempo reale: i tavoli vedranno subito le modifiche."
  },
  {
    q: "Cosa succede dopo il pagamento dei 390€?",
    a: "I nostri server attivano la licenza definitiva, rimuovono i banner di anteprima e procedono alla registrazione/puntamento del tuo dominio personalizzato con certificato SSL incluso."
  },
  {
    q: "Come funziona la sezione Vibe Grid per l'atmosfera?",
    a: "Puoi caricare brevi video verticali in stile reel per mostrare i piatti serviti al tavolo, i cocktail in preparazione o l'atmosfera delle serate con musica dal vivo."
  },
  {
    q: "L'assistente virtuale Nexus AI sa rispondere agli allergeni?",
    a: "Sì. Nexus AI analizza gli ingredienti inseriti in scheda e risponde con precisione agli ospiti celiaci, vegani o con specifiche intolleranze alimentari."
  },
  {
    q: "Posso stampare il QR Code sui miei sottobicchieri o cavalieri da tavolo?",
    a: "Certamente. Dalla dashboard puoi scaricare il QR Code vettoriale in alta risoluzione per stamparlo su qualsiasi supporto tipografico."
  },
  {
    q: "Ci sono canoni mensili o costi ricorrenti nascosti?",
    a: "Nessun canone mensile obbligatorio. Lo sblocco iniziale di 390€ include il primo anno di hosting e dominio. I rinnovi infrastrutturali annuali rimangono a tariffa fissa minima."
  },
  {
    q: "Il menu supporta lingue straniere per i turisti?",
    a: "Sì, l'assistente Nexus AI e l'interfaccia si adattano automaticamente alla lingua del turista (Inglese, Tedesco, Francese, Spagnolo e altre 6 lingue)."
  },
  {
    q: "Come collego il pulsante per le prenotazioni su Google o TheFork?",
    a: "Nel pannello ti basta inserire il link della tua piattaforma di booking o il numero WhatsApp del locale: il pulsante di prenotazione sarà visibile in cima al menu."
  },
  {
    q: "Come posso testare un'anteprima gratuita prima di pagare?",
    a: "Contatta il nostro lab: genereremo un'anteprima interattiva del tuo locale per farti toccare con mano l'esperienza prima dello sblocco."
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
          Tutto ciò che c&apos;è da sapere
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
