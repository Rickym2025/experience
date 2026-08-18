import React from "react";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingHero from "@/components/landing/LandingHero";
import ExperienceFeatures from "@/components/landing/ExperienceFeatures";
import LandingPricing from "@/components/landing/LandingPricing";
import LandingFaq from "@/components/landing/LandingFaq";
import LandingOrbit from "@/components/landing/LandingOrbit";
import LandingFooter from "@/components/landing/LandingFooter";

export const metadata = {
  title: "Experience Engine | Smart Menu Interattivo & Storytelling per Ristoranti",
  description: "Trasforma il tuo menu in una narrazione sensoriale con abbinamenti vino guidati, video dell'atmosfera e sommelier AI. Sblocca il tuo locale a €390 una tantum."
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#050508] text-stone-100 font-sans selection:bg-amber-500 selection:text-black overflow-x-hidden relative">
      <LandingNavbar />
      <LandingHero />
      <ExperienceFeatures />
      <LandingPricing />
      <LandingFaq />
      <LandingOrbit />
      <LandingFooter />
    </div>
  );
}
