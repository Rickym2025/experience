'use client';

import { TasteExperience } from '@/types/experience';

interface HeroProps {
  experience: TasteExperience & {
    google_rating?: number;
    google_reviews_count?: number;
  };
}

export default function HeroExperience({ experience }: HeroProps) {
  const primaryColor = experience.brand_color || '#d97706';
  const rating = experience.google_rating || 4.4;
  const reviewsCount = experience.google_reviews_count || 150;

  return (
    <div className="relative w-full border-b border-white/10 overflow-hidden bg-transparent">
      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-12 pb-8 text-center flex flex-col items-center">
        {/* Stelle Google Reviews */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-zinc-950/60 border border-amber-500/30 text-amber-400 text-sm font-black mb-4 backdrop-blur-md shadow-lg">
          <span>★ {rating} su Google Reviews</span>
          <span className="text-zinc-400 font-normal">({reviewsCount}+ Recensioni)</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-md">
          {experience.nome_ristorante}
        </h1>
        {experience.tagline && (
          <p className="text-sm md:text-base text-zinc-300 max-w-lg mt-2 font-light drop-shadow">
            {experience.tagline}
          </p>
        )}

        {/* PULSANTI DI PRENOTAZIONE E CONTATTO DINAMICI */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          {experience.booking_url && (
            <a
              href={experience.booking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-full text-sm font-black uppercase tracking-wider text-slate-950 transition-transform active:scale-95 shadow-xl flex items-center gap-2"
              style={{ backgroundColor: primaryColor }}
            >
              💬 Prenota su WhatsApp
            </a>
          )}

          {experience.phone_number && (
            <a
              href={`tel:${experience.phone_number}`}
              className="px-5 py-3.5 rounded-full bg-zinc-950/60 hover:bg-zinc-900/80 text-white text-sm font-bold transition border border-white/15 backdrop-blur-md flex items-center gap-2 shadow"
            >
              📞 Chiama Ora
            </a>
          )}

          {experience.owner_email && (
            <a
              href={`mailto:${experience.owner_email}?subject=Richiesta%20Informazioni%20Tavolo`}
              className="px-5 py-3.5 rounded-full bg-zinc-950/60 hover:bg-zinc-900/80 text-white text-sm font-bold transition border border-white/15 backdrop-blur-md flex items-center gap-2 shadow"
            >
              ✉️ Invia Email
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
