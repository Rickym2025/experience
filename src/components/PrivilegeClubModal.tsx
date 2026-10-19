"use client";

import React, { useState, useEffect } from "react";
import { Wine, Sparkles, Star, X, CheckCircle2, ShieldAlert, Gift } from "lucide-react";

interface PrivilegeClubModalProps {
  slug: string;
  nomeRistorante: string;
  googleMapsUrl?: string;
  ownerPhone?: string;
  brandColor?: string;
}

interface GuestData {
  name: string;
  phone: string;
  birthday: string;
  slug: string;
  registeredAt: string;
}

export default function PrivilegeClubModal({
  slug,
  nomeRistorante,
  googleMapsUrl = "https://maps.google.com",
  ownerPhone = "+393495258418",
  brandColor = "#d4af37",
}: PrivilegeClubModalProps) {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState<boolean>(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [registeredGuest, setRegisteredGuest] = useState<GuestData | null>(null);

  // Stati form Lead
  const [name, setName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [birthday, setBirthday] = useState<string>("");
  const [isSubmittingLead, setIsSubmittingLead] = useState<boolean>(false);

  // Stati Review Shield
  const [selectedStars, setSelectedStars] = useState<number>(0);
  const [privateFeedback, setPrivateFeedback] = useState<string>("");
  const [isFeedbackSent, setIsFeedbackSent] = useState<boolean>(false);

  useEffect(() => {
    // Controllo ospite già registrato
    const saved = localStorage.getItem(`experience_guest_${slug}`);
    if (saved) {
      try {
        const parsed: GuestData = JSON.parse(saved);
        setRegisteredGuest(parsed);
      } catch (e) {
        console.warn("Dati ospite non validi:", e);
      }
    } else {
      // Comparsa discreta automatica dopo 7 secondi per i nuovi visitatori
      const timer = setTimeout(() => {
        setIsLeadModalOpen(true);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [slug]);

  // Invio registrazione Lead
  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !birthday) return;

    setIsSubmittingLead(true);

    const guest: GuestData = {
      name: name.trim(),
      phone: phone.trim(),
      birthday: birthday,
      slug: slug,
      registeredAt: new Date().toISOString(),
    };

    try {
      // Inoltro al webhook n8n per schedulazione compleanni e voucher OpenWA
      await fetch("https://n8n.rmstudio.app/webhook/experience-lead-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...guest,
          nome_ristorante: nomeRistorante,
        }),
      });
    } catch (err) {
      console.warn("Notifica webhook lead:", err);
    }

    // Memorizzazione locale permanente
    localStorage.setItem(`experience_guest_${slug}`, JSON.stringify(guest));
    setRegisteredGuest(guest);
    setIsSubmittingLead(false);
    setIsLeadModalOpen(false);
  };

  // Gestione Scudo Recensioni
  const handleStarSelection = (stars: number) => {
    setSelectedStars(stars);
    if (stars >= 4) {
      // 4 o 5 Stelle: Reindirizzamento pubblico su Google Maps / TripAdvisor
      window.open(googleMapsUrl, "_blank", "noopener,noreferrer");
      setIsReviewModalOpen(false);
    }
    // Per 1, 2 o 3 stelle resta aperto il riquadro riservato per intercettare il reclamo
  };

  const handleSendPrivateFeedback = () => {
    if (!privateFeedback.trim()) return;

    const guestName = registeredGuest?.name || "Ospite";
    const guestPhone = registeredGuest?.phone || "Non specificato";
    const cleanPhone = ownerPhone.replace(/[^0-9]/g, "");

    const msg = encodeURIComponent(
      `⚠️ SEGNALAZIONE RISERVATA TAVOLO (${nomeRistorante})\n` +
      `👤 Ospite: ${guestName} (${guestPhone})\n` +
      `⭐ Valutazione: ${selectedStars}/5 Stelle\n` +
      `💬 Commento: "${privateFeedback.trim()}"`
    );

    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");
    setIsFeedbackSent(true);
    setTimeout(() => {
      setIsReviewModalOpen(false);
      setIsFeedbackSent(false);
      setSelectedStars(0);
      setPrivateFeedback("");
    }, 2500);
  };

  return (
    <>
      {/* ─── 1. BARRA / BADGE FLUTTUANTE IN BASSO A SINISTRA ─── */}
      <div className="fixed bottom-20 left-4 sm:left-5 z-30 flex items-center gap-2">
        {/* Pulsante Club Privato */}
        <button
          onClick={() => setIsLeadModalOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-[#0e1017]/95 border border-amber-500/40 hover:border-amber-400 text-amber-300 font-bold text-xs uppercase tracking-wider backdrop-blur-xl shadow-2xl flex items-center gap-2 transition hover:scale-105 active:scale-95"
          style={{ borderColor: brandColor }}
        >
          {registeredGuest ? (
            <>
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>Privilege Club: {registeredGuest.name.split(" ")[0]}</span>
            </>
          ) : (
            <>
              <Wine size={16} className="text-amber-400 animate-pulse" />
              <span>Invito Riserva di Cantina</span>
            </>
          )}
        </button>

        {/* Pulsante Scudo Recensioni */}
        <button
          onClick={() => setIsReviewModalOpen(true)}
          className="w-10 h-10 rounded-2xl bg-[#0e1017]/95 border border-white/10 hover:border-amber-400 text-stone-300 hover:text-white flex items-center justify-center backdrop-blur-xl shadow-2xl transition hover:scale-105"
          title="Lascia la tua valutazione sulla visita"
        >
          <Star size={16} className="text-amber-400" />
        </button>
      </div>

      {/* ─── 2. MODALE: CIRCOLO PRIVATO & OMAGGIO DEL SOMMELIER ─── */}
      {isLeadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-4 flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-[#0b0d14] border-2 border-amber-500/50 rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 relative shadow-[0_0_50px_rgba(212,175,55,0.2)]">
            <button
              onClick={() => setIsLeadModalOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white transition"
            >
              <X size={20} />
            </button>

            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                <Wine size={28} />
              </div>
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest font-mono">
                Privilege Club • {nomeRistorante}
              </span>
              <h3 className="text-2xl font-bold font-serif text-white leading-tight">
                L&apos;Assaggio della Riserva Privata
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Entra nel circolo ristretto degli ospiti della tenuta: per te un calice di degustazione della nostra <strong>Riserva Storica</strong> offerto dal Sommelier durante la visita, e un invito esclusivo con bottiglia Magnum in omaggio per il tuo compleanno.
              </p>
            </div>

            <form onSubmit={handleLeadSubmit} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase mb-1.5">
                  Nome e Cognome *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="es. Dott. Marco Vianello"
                  className="w-full bg-[#121522] border border-stone-700 rounded-xl px-4 py-3 text-sm text-white font-medium focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase mb-1.5">
                  Cellulare WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="es. 340 1234567"
                  className="w-full bg-[#121522] border border-stone-700 rounded-xl px-4 py-3 text-sm text-white font-mono focus:border-amber-400 outline-none"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">
                  Invieremo qui il voucher riservato per il calice di degustazione.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-400 uppercase mb-1.5 flex items-center gap-1.5">
                  <Gift size={13} /> La Tua Data di Nascita (Per la Magnum di Compleanno) *
                </label>
                <input
                  type="date"
                  required
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="w-full bg-[#121522] border border-stone-700 rounded-xl px-4 py-3 text-sm text-white font-mono focus:border-amber-400 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingLead}
                className="w-full py-4 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles size={16} />
                <span>
                  {isSubmittingLead
                    ? "Conferma in corso..."
                    : "Accedi al Club & Sblocca l'Assaggio Riserva"}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── 3. MODALE: SCUDO RECENSIONI PER ECCELLENZE E CANTINE ─── */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-4 flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-[#0b0d14] border border-amber-500/40 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 relative shadow-2xl">
            <button
              onClick={() => setIsReviewModalOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white transition"
            >
              <X size={20} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <Star size={24} className="fill-amber-400" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest font-mono">
                Feedback d&apos;Eccellenza
              </span>
              <h3 className="text-xl font-bold font-serif text-white">
                La Vostra Esperienza da Noi
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Come valuta l&apos;accoglienza, i piatti e la selezione della cantina oggi?
              </p>
            </div>

            {/* Pulsanti Stelle */}
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleStarSelection(star)}
                  className={`text-3xl transition-transform hover:scale-125 ${
                    selectedStars >= star ? "opacity-100" : "opacity-40"
                  }`}
                >
                  ⭐
                </button>
              ))}
            </div>

            {/* Bivio: Selezionate 1, 2 o 3 stelle -> Canale Riservato */}
            {selectedStars > 0 && selectedStars <= 3 && (
              <div className="space-y-3 pt-3 border-t border-stone-800 text-left animate-in fade-in">
                <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold">
                  <ShieldAlert size={14} />
                  <span>Desideriamo prenderci cura del Vostro riscontro</span>
                </div>
                <textarea
                  rows={3}
                  value={privateFeedback}
                  onChange={(e) => setPrivateFeedback(e.target.value)}
                  placeholder="Indicateci cosa non è stato all'altezza delle Vostre aspettative..."
                  className="w-full bg-[#121522] border border-stone-700 rounded-xl p-3 text-xs text-white focus:border-amber-400 outline-none resize-none"
                />
                <button
                  onClick={handleSendPrivateFeedback}
                  className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs uppercase rounded-xl transition flex items-center justify-center gap-2"
                >
                  {isFeedbackSent ? (
                    <>
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span>Inviato al Direttore di Sala</span>
                    </>
                  ) : (
                    "Comunica Riservatamente alla Proprietà"
                  )}
                </button>
              </div>
            )}

            <button
              onClick={() => setIsReviewModalOpen(false)}
              className="text-xs text-stone-400 hover:text-white pt-2 font-medium"
            >
              Chiudi
            </button>
          </div>
        </div>
      )}
    </>
  );
}
