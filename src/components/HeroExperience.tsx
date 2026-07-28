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
    <div className="relative w-full bg-[#0a0a0f] border-b border-white/10 overflow-hidden">
      {experience.cover_image && (
        <div className="absolute inset-0 z-0 opacity-30">
          <img
            src={experience.cover_image}
            alt={experience.nome_ristorante}
            className="w-full h-full object-cover filter blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#0a0a0f]/80 to-transparent" />
        </div>
      )}

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-12 pb-8 text-center flex flex-col items-center">
        {/* Stelle Google REALI estratte */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-amber-400 text-sm font-black mb-4">
          <span>★ {rating} su Google Reviews</span>
          <span className="text-gray-400 font-normal">({reviewsCount}+ Recensioni)</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          {experience.nome_ristorante}
        </h1>
        {experience.tagline && (
          <p className="text-sm md:text-base text-gray-300 max-w-lg mt-2 font-light">
            {experience.tagline}
          </p>
        )}

        {/* PULSANTI DI PRENOTAZIONE E CONTATTO DINAMICI */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          {/* Se c'è WhatsApp o Booking */}
          {experience.booking_url && (
            <a
              href={experience.booking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-full text-sm font-black uppercase tracking-wider text-black transition-transform active:scale-95 shadow-xl flex items-center gap-2"
              style={{ backgroundColor: primaryColor }}
            >
              💬 Prenota su WhatsApp
            </a>
          )}

          {/* Telefonata Diretta */}
          {experience.phone_number && (
            <a
              href={`tel:${experience.phone_number}`}
              className="px-5 py-3.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-sm font-bold transition border border-white/10 flex items-center gap-2"
            >
              📞 Chiama Ora
            </a>
          )}

          {/* Email Ristorante */}
          {experience.owner_email && (
            <a
              href={`mailto:${experience.owner_email}?subject=Richiesta%20Informazioni%20Tavolo`}
              className="px-5 py-3.5 rounded-full bg-white/10 hover:bg-white/15 text-white text-sm font-bold transition border border-white/10 flex items-center gap-2"
            >
              ✉️ Invia Email
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
