import React from "react";
import type { Metadata } from "next";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingHero from "@/components/landing/LandingHero";
import ExperienceFeatures from "@/components/landing/ExperienceFeatures";
import LandingPricing from "@/components/landing/LandingPricing";
import LandingFaq from "@/components/landing/LandingFaq";
import LandingOrbit from "@/components/landing/LandingOrbit";
import LandingFooter from "@/components/landing/LandingFooter";

export const metadata: Metadata = {
  title: "Experience Engine | Smart Menu Interattivo & Storytelling per Ristoranti",
  description: "Trasforma il tuo menu in una narrazione sensoriale con abbinamenti vino guidati, video dell'atmosfera e sommelier AI. Sblocca il tuo portale definitivo una tantum senza canoni mensili.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo_experience.png",
  },
  openGraph: {
    title: "Experience Engine | Smart Menu Interattivo",
    description: "La piattaforma interattiva per storytelling e vendita al tavolo nel settore ristorazione.",
    images: [
      {
        url: "/logo_experience.png",
        width: 800,
        height: 800,
        alt: "Experience Engine Logo",
      },
    ],
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#050508] text-stone-100 font-sans selection:bg-amber-500 selection:text-black overflow-x-hidden relative">
      
      {/* ─── IMMAGINE BACKGROUND ATMOSFERICA CON OVERLAY SCURO ─── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src="/background.jpg"
          alt=""
          className="w-full h-full object-cover opacity-25 filter brightness-75 scale-105"
          onError={(e) => {
            // Prova prima .jpeg locale, poi fallback a sfondo atmosferico restaurant/wine scuro ad alta risoluzione
            if (!e.currentTarget.dataset.retried) {
              e.currentTarget.dataset.retried = "true";
              e.currentTarget.src = "/background.jpeg";
            } else {
              e.currentTarget.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=2000&q=80";
            }
          }}
        />
        {/* Doppia sfumatura per garantire leggibilità assoluta e contrasto */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050508]/80 via-[#050508]/90 to-[#050508]" />
      </div>

      {/* ─── CONTENUTO PRINCIPALE (Z-10) ─── */}
      <div className="relative z-10">
        <LandingNavbar />
        <LandingHero />
        <ExperienceFeatures />
        <LandingPricing />
        <LandingFaq />
        <LandingOrbit />
        <LandingFooter />
      </div>
    </div>
  );
}
