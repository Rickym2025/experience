'use client';

import { useState, useEffect } from 'react';
import { TasteExperience } from '@/types/experience';

interface HeroProps {
  experience: TasteExperience;
}

export default function HeroExperience({ experience }: HeroProps) {
  const primaryColor = experience.brand_color || '#d97706';
  const [userDistance, setUserDistance] = useState<string | null>(null);

  // Coordinate GPS indicative del ristorante (Ariano nel Polesine / Delta)
  const restLat = 44.9467;
  const restLon = 12.1242;

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat1 = pos.coords.latitude;
          const lon1 = pos.coords.longitude;
          
          // Formula dell'Emiverseno per calcolare la distanza in km
          const R = 6371; 
          const dLat = ((restLat - lat1) * Math.PI) / 180;
          const dLon = ((restLon - lon1) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
              Math.cos((restLat * Math.PI) / 180) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;

          setUserDistance(distance < 1 ? 'Meno di 1 km' : `${distance.toFixed(1)} km`);
        },
        (err) => console.log('GPS non autorizzato:', err),
        { timeout: 5000 }
      );
    }
  }, []);

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

      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-10 pb-8 text-center flex flex-col items-center">
        {experience.logo_url ? (
          <img
            src={experience.logo_url}
            alt={experience.nome_ristorante}
            className="w-20 h-20 rounded-full object-cover border-2 shadow-xl mb-3"
            style={{ borderColor: primaryColor }}
          />
        ) : (
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black text-black mb-3 shadow-lg"
            style={{ backgroundColor: primaryColor }}
          >
            🍷
          </div>
        )}

        {/* Badge Stelle Google */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-amber-400 text-xs font-bold mb-3">
          <span>★ 4.9 su Google Reviews</span>
          <span className="text-gray-400 font-normal">(280+ Recensioni)</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          {experience.nome_ristorante}
        </h1>
        {experience.tagline && (
          <p className="text-xs md:text-sm text-gray-300 max-w-md mt-1.5 font-light">
            {experience.tagline}
          </p>
        )}

        {/* DISTANZA GPS DINAMICA IN TEMPO REALE */}
        {userDistance && (
          <div className="mt-3 inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-3.5 py-1.5 rounded-full animate-pulse">
            <span>📍 Sei a {userDistance} da noi</span>
          </div>
        )}

        {/* Pulsanti Azione */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
          {experience.booking_url && (
            <a
              href={experience.booking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider text-black shadow-xl transition-all active:scale-95"
              style={{ backgroundColor: primaryColor }}
            >
              📅 Prenota Tavolo
            </a>
          )}

          {experience.google_maps_url && (
            <a
              href={experience.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition border border-white/10 flex items-center gap-2"
            >
              <span>🗺️ Navigatore GPS</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
