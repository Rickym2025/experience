'use client';

import { TasteExperience } from '@/types/experience';

interface HeroProps {
  experience: TasteExperience;
}

export default function HeroExperience({ experience }: HeroProps) {
  const primaryColor = experience.brand_color || '#d97706';

  return (
    <div className="relative w-full bg-[#0a0a0f] border-b border-white/10 overflow-hidden">
      {/* Background Cover Image con overlay scuro */}
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
        {/* Logo o Icona del Ristorante */}
        {experience.logo_url ? (
          <img
            src={experience.logo_url}
            alt={experience.nome_ristorante}
            className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-2 shadow-xl mb-4"
            style={{ borderColor: primaryColor }}
          />
        ) : (
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black text-black mb-4 shadow-lg"
            style={{ backgroundColor: primaryColor }}
          >
            🍽️
          </div>
        )}

        {/* Badge 5 Stelle */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-amber-400 text-xs font-bold mb-3">
          <span>★★★★★</span>
          <span className="text-gray-300 font-medium text-[11px]">4.9 su Google Reviews</span>
        </div>

        {/* Titolo e Tagline */}
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          {experience.nome_ristorante}
        </h1>
        {experience.tagline && (
          <p className="text-sm md:text-base text-gray-300 max-w-lg mt-2 font-light">
            {experience.tagline}
          </p>
        )}

        {/* Pulsanti di Azione Rapida */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          {experience.booking_url && (
            <a
              href={experience.booking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full text-xs font-extrabold uppercase tracking-wider text-black transition-transform active:scale-95 shadow-lg flex items-center gap-2"
              style={{ backgroundColor: primaryColor }}
            >
              <span>📅</span> Prenota un Tavolo
            </a>
          )}

          {experience.google_maps_url && (
            <a
              href={experience.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition border border-white/10 flex items-center gap-2"
            >
              <span>📍</span> Indicazioni Stradali
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
